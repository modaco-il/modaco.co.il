"use server";

/**
 * Checkout submit — two paths in one entry point:
 *
 *   mode = "online" → B2C: pay now (Morning hosted page, wired tomorrow).
 *                    Returns { orderId, mode, total } and the storefront
 *                    redirects to a thank-you page that will later carry
 *                    the Morning payment URL.
 *
 *   mode = "quote"  → B2B: no payment, sales reaches out. Returns a
 *                    prefilled WhatsApp deep-link to Yarin so the customer
 *                    can ping him directly with the order summary.
 *
 * Both paths create a real Order row (status=PENDING) and fire two emails
 * via Resend:
 *   - Admin notification → Yarin (orders@modaco.co.il routes to Yarin)
 *   - Customer confirmation → the buyer
 *
 * Cart is emptied on success. If anything mid-write fails the whole
 * transaction rolls back.
 */
import { db } from "@/lib/db";
import { cookies, headers } from "next/headers";
import { createPaymentForm } from "@/lib/morning/payments";
import { orderTrackingUrl } from "@/lib/order-token";

const CART_COOKIE = "modaco_cart_session";
const ADMIN_NOTIFY_EMAIL = "yarin@modaco.co.il";
const FROM = "Modaco <orders@modaco.co.il>";
const WHATSAPP_NUMBER = "972526804945";

export interface CheckoutInput {
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Address
  street: string;
  city: string;
  zipCode?: string;
  notes?: string;
  // B2B-only
  company?: string;
  taxId?: string;
  // Flow
  mode: "online" | "quote";
  marketingConsent?: boolean;
}

export type CheckoutResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      total: number;
      mode: "online" | "quote";
      whatsappLink?: string;
      /** Morning hosted-checkout URL. Present in `online` mode when payment
       *  link generation succeeded. Storefront should redirect here. */
      paymentUrl?: string;
      /** If payment-link generation failed (e.g. clearing not yet approved
       *  by Grow), surface a friendly note. The order is still created. */
      paymentLinkError?: string;
    }
  | { ok: false; error: string };

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  // ── Validate
  if (!input.email || !input.firstName || !input.phone || !input.street || !input.city) {
    return { ok: false, error: "פרטים חיוניים חסרים" };
  }
  if (input.mode === "quote" && !input.company) {
    return { ok: false, error: "שם העסק חובה לבקשת הצעת מחיר" };
  }
  const email = input.email.trim().toLowerCase();

  // ── Load cart
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionId) return { ok: false, error: "לא נמצאה עגלה פעילה" };
  const cart = await db.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
  });
  if (!cart || cart.items.length === 0) return { ok: false, error: "העגלה ריקה" };

  const subtotal = cart.items.reduce((s, it) => {
    const price = it.variant.priceOverride ?? it.variant.product.basePrice;
    return s + price * it.quantity;
  }, 0);
  const shippingCost = input.mode === "quote" ? 0 : 49;
  const total = subtotal + shippingCost;

  // ── Generate order number — count existing orders + 1, zero-padded.
  // Concurrency race is small at this stage; if collisions appear we'll
  // switch to a Postgres sequence.
  const orderCount = await db.order.count();
  const orderNumber = `MOD-${String(orderCount + 1).padStart(5, "0")}`;

  // ── Upsert User+Customer+Address in a transaction with the order
  let orderId = "";
  try {
    await db.$transaction(async (tx) => {
      // User by email (create if new)
      const user = await tx.user.upsert({
        where: { email },
        update: { name: `${input.firstName} ${input.lastName}`.trim() },
        create: {
          email,
          name: `${input.firstName} ${input.lastName}`.trim(),
          role: "CUSTOMER",
        },
      });

      // Customer for this user (only one per user — schema enforces unique)
      const customer = await tx.customer.upsert({
        where: { userId: user.id },
        update: {
          company: input.company || undefined,
          taxId: input.taxId || undefined,
        },
        create: {
          userId: user.id,
          company: input.company || undefined,
          taxId: input.taxId || undefined,
        },
      });

      // Address
      const address = await tx.address.create({
        data: {
          customerId: customer.id,
          fullName: `${input.firstName} ${input.lastName}`.trim(),
          phone: input.phone,
          street: input.street,
          city: input.city,
          zipCode: input.zipCode || undefined,
          isDefault: false,
        },
      });

      // Order
      const orderNotes = [
        input.mode === "quote" ? "[B2B_QUOTE_REQUEST]" : null,
        input.notes?.trim() || null,
      ]
        .filter(Boolean)
        .join(" — ");

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          addressId: address.id,
          status: "PENDING",
          subtotal,
          shippingCost,
          total,
          notes: orderNotes || null,
          items: {
            create: cart.items.map((it) => ({
              variantId: it.variantId,
              quantity: it.quantity,
              unitPrice: it.variant.priceOverride ?? it.variant.product.basePrice,
              total:
                (it.variant.priceOverride ?? it.variant.product.basePrice) *
                it.quantity,
            })),
          },
          events: {
            create: {
              type: "created",
              data: {
                mode: input.mode,
                marketingConsent: !!input.marketingConsent,
                phone: input.phone,
              },
            },
          },
        },
      });
      orderId = order.id;

      // Empty the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    });
  } catch (err) {
    return { ok: false, error: `שגיאה ביצירת ההזמנה: ${(err as Error).message}` };
  }

  // ── Build customer-facing tracking URL (used in confirmation email)
  const trackingOrigin = await detectOrigin();
  const trackingUrl = orderTrackingUrl(trackingOrigin, orderId);

  // ── Fire-and-forget emails (don't fail the order if email fails)
  void sendOrderEmails({
    orderNumber,
    customerName: `${input.firstName} ${input.lastName}`.trim(),
    customerEmail: email,
    customerPhone: input.phone,
    company: input.company,
    address: `${input.street}, ${input.city}${input.zipCode ? " " + input.zipCode : ""}`,
    items: cart.items.map((it) => ({
      name: it.variant.product.name,
      variant: it.variant.name,
      quantity: it.quantity,
      unitPrice: it.variant.priceOverride ?? it.variant.product.basePrice,
    })),
    subtotal,
    shippingCost,
    total,
    mode: input.mode,
    notes: input.notes,
    trackingUrl,
  });

  // ── For online mode, generate a Morning hosted-checkout URL.
  //    If the call fails (e.g. Grow clearing pending approval), we keep the
  //    order alive and surface a friendly note so the customer can still see
  //    the order number and reach Yarin via WhatsApp.
  let paymentUrl: string | undefined;
  let paymentLinkError: string | undefined;
  if (input.mode === "online" && process.env.MORNING_API_KEY_ID) {
    try {
      const origin = await detectOrigin();
      const form = await createPaymentForm({
        type: 320, // חשבונית מס — matches the Morning plugin's docType setting
        description: `הזמנה ${orderNumber} · Modaco`,
        amount: total,
        vatType: 0, // VAT included in prices
        client: {
          name: `${input.firstName} ${input.lastName}`.trim(),
          emails: [email],
          phone: input.phone,
          address: input.street,
          city: input.city,
          zip: input.zipCode,
          country: "IL",
        },
        income: cart.items.map((it) => ({
          description: `${it.variant.product.name} – ${it.variant.name}`,
          price: it.variant.priceOverride ?? it.variant.product.basePrice,
          quantity: it.quantity,
        })),
        successUrl: `${origin}/checkout/success?o=${orderId}`,
        failureUrl: `${origin}/checkout/failed?o=${orderId}`,
        notifyUrl: `${origin}/api/checkout/morning-webhook`,
        custom: orderId,
      });
      paymentUrl = form.url;

      // Persist the form URL on the order so admin can re-link the customer
      await db.order.update({
        where: { id: orderId },
        data: { paymentRef: paymentUrl },
      });
    } catch (err) {
      // Most common path here: errorCode 2600 (clearing not yet approved).
      // Order stays PENDING; admin will see it and follow up manually.
      paymentLinkError = (err as Error).message;
      console.warn(`[checkout] Morning payment-link failed for ${orderNumber}:`, paymentLinkError);
    }
  }

  // ── Build WhatsApp link for quote-mode customer
  let whatsappLink: string | undefined;
  if (input.mode === "quote") {
    const lines = [
      `היי ירין, הגשתי בקשה להצעת מחיר במודקו (#${orderNumber}):`,
      "",
      ...cart.items.map(
        (it) => `• ${it.variant.product.name} – ${it.variant.name} ×${it.quantity}`,
      ),
      "",
      `סכום: ₪${total.toLocaleString()}`,
      `${input.firstName} ${input.lastName}${input.company ? ` (${input.company})` : ""}`,
      input.phone,
    ];
    whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      lines.join("\n"),
    )}`;
  }

  return {
    ok: true,
    orderId,
    orderNumber,
    total,
    mode: input.mode,
    whatsappLink,
    paymentUrl,
    paymentLinkError,
  };
}

/** Build an absolute origin from request headers, falling back to env. */
async function detectOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() unavailable in some contexts — fall through
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://modaco.co.il";
}

// ─────────────────────────────────────────────────────────────────────────
// Resend wiring — admin notification + customer confirmation
// Both use the orders@modaco.co.il sending address (verified in Resend).

interface EmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  address: string;
  items: { name: string; variant: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  mode: "online" | "quote";
  notes?: string;
  /** Signed link the customer can use to track the order anytime. */
  trackingUrl?: string;
}

async function sendOrderEmails(p: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[checkout] RESEND_API_KEY missing — skipping emails");
    return;
  }

  // Admin → Yarin
  await sendResend(apiKey, {
    to: [ADMIN_NOTIFY_EMAIL],
    subject:
      p.mode === "quote"
        ? `📩 בקשת הצעת מחיר חדשה ${p.orderNumber} — ${p.customerName}${p.company ? ` (${p.company})` : ""}`
        : `🛒 הזמנה חדשה ${p.orderNumber} — ${p.customerName} — ₪${p.total.toLocaleString()}`,
    html: renderAdminHtml(p),
    text: renderAdminText(p),
  }).catch((e) => console.error("[checkout] admin email failed:", e));

  // Customer confirmation
  await sendResend(apiKey, {
    to: [p.customerEmail],
    subject:
      p.mode === "quote"
        ? `הבקשה התקבלה ${p.orderNumber} — מודקו`
        : `הזמנה ${p.orderNumber} התקבלה — מודקו`,
    html: renderCustomerHtml(p),
    text: renderCustomerText(p),
  }).catch((e) => console.error("[checkout] customer email failed:", e));
}

async function sendResend(
  apiKey: string,
  msg: { to: string[]; subject: string; html: string; text: string },
) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ from: FROM, ...msg }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Resend ${r.status}: ${t}`);
  }
}

function renderAdminHtml(p: EmailPayload): string {
  const itemsHtml = p.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escape(i.name)} <span style="color:#8B6F4E">· ${escape(i.variant)}</span></td><td style="text-align:left;padding:6px 0">×${i.quantity}</td><td style="text-align:left;padding:6px 0">₪${(i.unitPrice * i.quantity).toLocaleString()}</td></tr>`,
    )
    .join("");
  const label = p.mode === "quote" ? "בקשת הצעת מחיר" : "הזמנה אונליין";
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"></head>
<body style="font-family:Heebo,Arial,sans-serif;max-width:640px;margin:0 auto;padding:32px;color:#0A0908;background:#FAF6F0">
  <div style="color:#8B6F4E;font-size:11px;letter-spacing:.2em;text-transform:uppercase;margin-bottom:8px">${label}</div>
  <h1 style="font-size:24px;margin:0 0 6px">${p.orderNumber}</h1>
  <p style="margin:0 0 18px;color:#5B4D40">${escape(p.customerName)}${p.company ? ` · <strong>${escape(p.company)}</strong>` : ""} · ${escape(p.customerPhone)} · <a href="mailto:${escape(p.customerEmail)}" style="color:#8B6F4E">${escape(p.customerEmail)}</a></p>

  <h3 style="font-size:14px;border-bottom:1px solid #D9C3A5;padding-bottom:6px;margin:24px 0 8px">פריטים</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${itemsHtml}</table>

  <table style="width:100%;border-top:1px solid #D9C3A5;margin-top:16px;font-size:14px">
    <tr><td style="padding:6px 0">סכום ביניים</td><td style="text-align:left;padding:6px 0">₪${p.subtotal.toLocaleString()}</td></tr>
    <tr><td style="padding:6px 0">משלוח</td><td style="text-align:left;padding:6px 0">₪${p.shippingCost.toLocaleString()}</td></tr>
    <tr><td style="padding:8px 0;font-weight:700;border-top:1px solid #0A0908">סה״כ</td><td style="text-align:left;padding:8px 0;font-weight:700;border-top:1px solid #0A0908">₪${p.total.toLocaleString()}</td></tr>
  </table>

  <h3 style="font-size:14px;border-bottom:1px solid #D9C3A5;padding-bottom:6px;margin:24px 0 8px">משלוח</h3>
  <p style="margin:0 0 6px">${escape(p.address)}</p>
  ${p.notes ? `<p style="margin:0;color:#5B4D40;font-size:13px"><em>${escape(p.notes)}</em></p>` : ""}

  ${p.mode === "quote" ? '<p style="margin-top:24px;padding:12px;background:#fff5e0;border:1px solid #D9C3A5;border-radius:4px;font-size:13px">💬 הלקוח התבקש לשלוח לך הודעת וואטסאפ ישירה עם פרטי הבקשה. ייתכן שתקבל פנייה בקרוב.</p>' : '<p style="margin-top:24px;padding:12px;background:#e8f5e9;border:1px solid #a3c9a5;border-radius:4px;font-size:13px">⏳ ההזמנה ממתינה לתשלום. אחרי שמורנינג מחובר, יישלח ללקוח קישור תשלום אוטומטי.</p>'}

  <p style="margin-top:32px;color:#8B6F4E;font-size:12px">
    Modaco · מודקו<br>
    <a href="https://modaco.co.il/admin/orders" style="color:#8B6F4E">פתח בפאנל הניהול →</a>
  </p>
</body></html>`;
}

function renderAdminText(p: EmailPayload): string {
  const items = p.items
    .map((i) => `• ${i.name} · ${i.variant} ×${i.quantity} – ₪${(i.unitPrice * i.quantity).toLocaleString()}`)
    .join("\n");
  return `${p.mode === "quote" ? "בקשת הצעת מחיר" : "הזמנה"} ${p.orderNumber}\n\n${p.customerName}${p.company ? " (" + p.company + ")" : ""}\n${p.customerPhone} · ${p.customerEmail}\n\nפריטים:\n${items}\n\nסכום: ₪${p.subtotal.toLocaleString()} · משלוח ₪${p.shippingCost.toLocaleString()} · סה"כ ₪${p.total.toLocaleString()}\n\nכתובת: ${p.address}\n${p.notes ? "הערות: " + p.notes : ""}\n\nhttps://modaco.co.il/admin/orders`;
}

function renderCustomerHtml(p: EmailPayload): string {
  const itemsHtml = p.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;font-size:14px">${escape(i.name)}<br><span style="color:#8B6F4E;font-size:12px">${escape(i.variant)} ×${i.quantity}</span></td><td style="text-align:left;padding:8px 0;font-size:14px;vertical-align:top">₪${(i.unitPrice * i.quantity).toLocaleString()}</td></tr>`,
    )
    .join("");
  const heading =
    p.mode === "quote"
      ? "הבקשה שלך התקבלה — נחזור אליך בהקדם"
      : "תודה על ההזמנה!";
  const body =
    p.mode === "quote"
      ? "ירין יחזור אליך תוך 24 שעות עם הצעת מחיר מותאמת. אם זה דחוף, אפשר גם לשלוח הודעת וואטסאפ ישירה — קיבלת כפתור באתר."
      : "אנחנו נצור איתך קשר טלפוני לאישור הפרטים ולתיאום משלוח. לאחר מכן תקבל קישור לתשלום מאובטח דרך מורנינג.";
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"></head>
<body style="font-family:Heebo,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#0A0908;background:#FAF6F0">
  <div style="color:#8B6F4E;font-size:11px;letter-spacing:.32em;text-transform:uppercase;margin-bottom:16px">Modaco · מודקו</div>
  <h1 style="font-size:22px;margin:0 0 12px">${heading}</h1>
  <p style="line-height:1.7;font-size:15px;margin:0 0 24px">${body}</p>

  <div style="background:#fff;padding:18px;border:1px solid #D9C3A5">
    <div style="font-size:11px;color:#8B6F4E;letter-spacing:.2em;text-transform:uppercase;margin-bottom:6px">מספר הזמנה</div>
    <div style="font-size:20px;font-weight:700;margin-bottom:14px">${p.orderNumber}</div>

    <table style="width:100%;border-collapse:collapse">${itemsHtml}</table>

    <table style="width:100%;margin-top:14px;border-top:1px solid #D9C3A5;font-size:14px">
      <tr><td style="padding:6px 0">סכום ביניים</td><td style="text-align:left;padding:6px 0">₪${p.subtotal.toLocaleString()}</td></tr>
      <tr><td style="padding:6px 0">משלוח</td><td style="text-align:left;padding:6px 0">${p.shippingCost === 0 ? "חינם" : "₪" + p.shippingCost.toLocaleString()}</td></tr>
      <tr><td style="padding:8px 0;font-weight:700;border-top:1px solid #0A0908">סה״כ</td><td style="text-align:left;padding:8px 0;font-weight:700;border-top:1px solid #0A0908">₪${p.total.toLocaleString()}</td></tr>
    </table>
  </div>

  ${p.trackingUrl && p.mode === "online" ? `<div style="text-align:center;margin-top:24px">
    <a href="${escape(p.trackingUrl)}" style="display:inline-block;background:#0A0908;color:#FAF6F0;padding:14px 28px;text-decoration:none;font-size:14px;letter-spacing:.04em">מעקב הזמנה</a>
  </div>
  <p style="text-align:center;margin-top:8px;color:#8B6F4E;font-size:11px">שמרו את הקישור — לא נדרש חשבון</p>` : ""}

  <p style="margin-top:24px;color:#8B6F4E;font-size:13px">
    יש שאלה? כתבו לנו ב-<a href="https://wa.me/${WHATSAPP_NUMBER}" style="color:#8B6F4E">וואטסאפ</a> או חייגו <a href="tel:0526804945" style="color:#8B6F4E">052-680-4945</a>.
  </p>

  <p style="margin-top:32px;color:#8B6F4E;font-size:12px">
    Modaco · מודקו<br>
    האומן 1, בית שמש
  </p>
</body></html>`;
}

function renderCustomerText(p: EmailPayload): string {
  const items = p.items.map((i) => `• ${i.name} (${i.variant}) ×${i.quantity}`).join("\n");
  return `${p.mode === "quote" ? "בקשת הצעת מחיר התקבלה" : "תודה על ההזמנה"} - ${p.orderNumber}\n\n${items}\n\nסה"כ: ₪${p.total.toLocaleString()}\n\n${p.mode === "quote" ? "ירין יחזור אליך תוך 24 שעות." : "ניצור קשר לאישור פרטים ולתיאום משלוח."}\n\nModaco · מודקו\nhttps://modaco.co.il`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
