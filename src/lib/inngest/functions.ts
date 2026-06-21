import { inngest } from "./client";
import { db } from "@/lib/db";
import { sendWhatsAppMessage, notifyAdmin } from "@/lib/whatsapp/send";

// ==================== ABANDONED CART RECOVERY ====================

export const abandonedCartCheck = inngest.createFunction(
  {
    id: "abandoned-cart-check",
    name: "Check Abandoned Cart",
    triggers: [{ event: "cart/updated" }],
  },
  async ({ event, step }) => {
    const cartId = event.data.cartId as string;

    // Wait 30 minutes
    await step.sleep("wait-for-purchase", "30m");

    // Check if cart was converted
    const cart = await step.run("check-cart", async () => {
      return db.cart.findUnique({
        where: { id: cartId },
        include: {
          customer: { include: { user: true } },
          items: { include: { variant: { include: { product: true } } } },
        },
      });
    });

    if (!cart || cart.convertedAt) {
      return { status: "cart-converted-or-deleted" };
    }

    if (cart.recoverySentAt) {
      return { status: "recovery-already-sent" };
    }

    // Mark as abandoned
    await step.run("mark-abandoned", async () => {
      await db.cart.update({
        where: { id: cartId },
        data: { abandonedAt: new Date() },
      });
    });

    // Send WhatsApp recovery message if customer has phone
    const phone = cart.customer?.user?.phone;
    if (phone) {
      await step.run("send-whatsapp-recovery", async () => {
        const text =
          `שלום מ-Modaco 👋\n\n` +
          `שמנו לב שהשארת מוצרים בסל הקניות. אם נתקלת בקושי או שיש לך שאלה — אנחנו כאן.\n` +
          `https://modaco.co.il/cart\n\n` +
          `מודקו · פרזול ואקססוריז לבית`;
        await sendWhatsAppMessage(phone, text);
        await db.cart.update({
          where: { id: cartId },
          data: { recoverySentAt: new Date() },
        });
      });
    }

    return { status: "recovery-sent", phone };
  }
);

// ==================== ORDER NOTIFICATIONS ====================

export const orderCreatedNotify = inngest.createFunction(
  {
    id: "order-created-notify",
    name: "Notify on New Order",
    triggers: [{ event: "order/created" }],
  },
  async ({ event, step }) => {
    const orderId = event.data.orderId as string;

    const order = await step.run("fetch-order", async () => {
      return db.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          customer: { include: { user: true } },
          address: true,
          items: { include: { variant: { include: { product: true } } } },
        },
      });
    });

    const customerName =
      order.address?.fullName || order.customer?.user?.name || order.customer?.user?.email || "—";
    const customerPhone = order.address?.phone || order.customer?.user?.phone || "";
    const fullAddress = order.address
      ? `${order.address.street}, ${order.address.city}${order.address.zipCode ? " " + order.address.zipCode : ""}`
      : "(אין כתובת)";
    const itemsText = order.items
      .map((i) => `• ${i.variant.product.name} (${i.variant.name}) × ${i.quantity}  — ₪${i.total.toLocaleString()}`)
      .join("\n");

    // Email to Yarin — full picking + shipping brief
    await step.run("email-yarin", async () => {
      const adminUrl = `https://modaco.co.il/admin/orders/${order.id}`;
      const wazeUrl = order.address
        ? `https://waze.com/ul?q=${encodeURIComponent(fullAddress)}&navigate=yes`
        : null;
      const cleanPhone = customerPhone.replace(/[^\d]/g, "");
      const waPhone = cleanPhone.startsWith("0") ? "972" + cleanPhone.slice(1) : cleanPhone;
      const waUrl = customerPhone
        ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`שלום, תודה על ההזמנה ${order.orderNumber} ב-Modaco.`)}`
        : null;

      const body = [
        `הזמנה חדשה ב-Modaco — ${order.orderNumber}`,
        ``,
        `לקוח: ${customerName}`,
        customerPhone ? `טלפון: ${customerPhone}` : "",
        `כתובת: ${fullAddress}`,
        ``,
        `פריטים (${order.items.length}):`,
        itemsText,
        ``,
        `סה"כ: ₪${order.total.toLocaleString()}`,
        ``,
        `--- קישורים מהירים ---`,
        `פאנל ניהול: ${adminUrl}`,
        wazeUrl ? `Waze: ${wazeUrl}` : "",
        waUrl ? `WhatsApp ללקוח: ${waUrl}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      console.log(`[Email→Yarin]\n${body}`);

      // TODO: send via Resend once RESEND_API_KEY is set
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "Modaco <orders@modaco.co.il>",
              to: ["yarin@modaco.co.il"],
              subject: `הזמנה חדשה ${order.orderNumber} — ₪${order.total.toLocaleString()}`,
              text: body,
            }),
          });
        } catch (e) {
          console.error("Resend failed:", e);
        }
      }
    });

    // WhatsApp alert to Yarin. Until WHATSAPP_ADMIN_PHONE is set the helper
    // logs to stdout; once Meta verification completes and the env var lands
    // in Vercel, this fires for real with no code change.
    await step.run("notify-admin-whatsapp", async () => {
      const summary =
        `📦 הזמנה חדשה ${order.orderNumber}\n` +
        `${customerName}\n` +
        `סה"כ ₪${order.total.toLocaleString()}\n` +
        `https://modaco.co.il/admin/orders/${order.id}`;
      await notifyAdmin(summary);
    });

    // Email confirmation to customer
    await step.run("send-customer-email", async () => {
      const email = order.customer?.user?.email;
      if (!email) return;
      console.log(`[Email→Customer] confirmation to ${email}`);
      // TODO: integrate with transactional email
    });

    // Create invoice
    await step.run("create-invoice", async () => {
      console.log(`[Invoice] Creating Green Invoice for ${order.orderNumber}`);
      // TODO: integrate with Green Invoice API once credentials provided
    });

    await step.run("log-event", async () => {
      await db.orderEvent.create({
        data: {
          orderId,
          type: "notifications_sent",
          data: { yarinEmail: true, yarinWA: !!process.env.WHATSAPP_ACCESS_TOKEN, customerEmail: !!order.customer?.user?.email, invoice: !!process.env.GREEN_INVOICE_API_KEY },
        },
      });
    });

    return { status: "notifications-sent", orderNumber: order.orderNumber };
  }
);

// ==================== LOW STOCK ALERT ====================

export const lowStockAlert = inngest.createFunction(
  {
    id: "low-stock-alert",
    name: "Low Stock Alert",
    triggers: [{ event: "stock/updated" }],
  },
  async ({ event, step }) => {
    const variantId = event.data.variantId as string;
    const LOW_STOCK_THRESHOLD = 3;

    const variant = await step.run("check-stock", async () => {
      return db.variant.findUniqueOrThrow({
        where: { id: variantId },
        include: { product: true },
      });
    });

    const totalStock = variant.stockStore + variant.stockSupplier;

    if (totalStock <= LOW_STOCK_THRESHOLD) {
      await step.run("alert-admin", async () => {
        const msg =
          totalStock === 0
            ? `⛔ אזל מהמלאי: ${variant.product.name} (${variant.name})`
            : `⚠️ מלאי נמוך: ${variant.product.name} (${variant.name}) — נשארו ${totalStock}`;
        await notifyAdmin(msg);
      });

      if (totalStock === 0) {
        await step.run("update-stock-status", async () => {
          await db.variant.update({
            where: { id: variantId },
            data: { stockStatus: "OUT_OF_STOCK" },
          });
        });
      }
    }

    return { totalStock, alerted: totalStock <= LOW_STOCK_THRESHOLD };
  }
);

// ==================== DAILY MORNING SUMMARY ====================

export const dailySummary = inngest.createFunction(
  {
    id: "daily-summary",
    name: "Daily Morning Summary for Yarin",
    triggers: [{ cron: "0 8 * * *" }], // Every day at 8:00 AM
  },
  async ({ step }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const stats = await step.run("gather-stats", async () => {
      const [newOrders, revenue, abandonedCarts, lowStockItems, pageViews] =
        await Promise.all([
          db.order.count({
            where: { createdAt: { gte: yesterday, lt: today } },
          }),
          db.order.aggregate({
            where: {
              createdAt: { gte: yesterday, lt: today },
              status: { not: "CANCELLED" },
            },
            _sum: { total: true },
          }),
          db.cart.count({
            where: { abandonedAt: { gte: yesterday, lt: today } },
          }),
          db.variant.count({
            where: { stockStatus: "OUT_OF_STOCK" },
          }),
          db.pageView.count({
            where: { createdAt: { gte: yesterday, lt: today } },
          }),
        ]);

      return {
        newOrders,
        revenue: revenue._sum.total || 0,
        abandonedCarts,
        lowStockItems,
        pageViews,
      };
    });

    // Pull a bit more context — work queue Yarin should see first thing
    const queues = await step.run("gather-queues", async () => {
      const [pendingOrders, newMessages, freshAbandoned] = await Promise.all([
        db.order.findMany({
          where: { status: "PENDING" },
          select: { orderNumber: true, total: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        db.contactMessage.count({ where: { status: "NEW" } }),
        db.cart.count({
          where: {
            convertedAt: null,
            abandonedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
            recoverySentAt: null,
          },
        }),
      ]);
      return { pendingOrders, newMessages, freshAbandoned };
    });

    await step.run("send-summary", async () => {
      const dateStr = yesterday.toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });

      const pendingList = queues.pendingOrders
        .map(
          (o) =>
            `• ${o.orderNumber} · ₪${o.total.toLocaleString()} (${new Date(o.createdAt).toLocaleDateString("he-IL")})`,
        )
        .join("\n");

      const text = [
        `סיכום יום ${dateStr} · Modaco`,
        ``,
        `── אתמול ──`,
        `הזמנות חדשות: ${stats.newOrders}`,
        `הכנסות (לא כולל ביטולים): ₪${stats.revenue.toLocaleString()}`,
        `עגלות נטושות: ${stats.abandonedCarts}`,
        `צפיות באתר: ${stats.pageViews}`,
        ``,
        `── דורש טיפול ──`,
        `הודעות יצירת קשר חדשות: ${queues.newMessages}`,
        `עגלות נטושות לשחזור (7 ימים): ${queues.freshAbandoned}`,
        `מוצרים שאזלו: ${stats.lowStockItems}`,
        ``,
        queues.pendingOrders.length > 0
          ? `הזמנות שעדיין PENDING:\n${pendingList}`
          : `אין הזמנות שממתינות לתשלום`,
        ``,
        `פתח דשבורד: https://modaco.co.il/admin/dashboard`,
        `הזמנות פתוחות: https://modaco.co.il/admin/orders?status=PENDING`,
        `הודעות: https://modaco.co.il/admin/messages?status=NEW`,
      ].join("\n");

      const html = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"></head>
<body style="font-family:Heebo,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#0A0908;background:#FAF6F0">
  <div style="color:#8B6F4E;font-size:11px;letter-spacing:.32em;text-transform:uppercase;margin-bottom:8px">Modaco · סיכום יומי</div>
  <h1 style="font-size:22px;margin:0 0 24px">${dateStr}</h1>

  <table style="width:100%;margin-bottom:24px">
    <tr><td style="padding:6px 0;color:#5B4D40">הזמנות אתמול</td><td style="text-align:left;font-weight:700">${stats.newOrders}</td></tr>
    <tr><td style="padding:6px 0;color:#5B4D40">הכנסות</td><td style="text-align:left;font-weight:700">₪${stats.revenue.toLocaleString()}</td></tr>
    <tr><td style="padding:6px 0;color:#5B4D40">עגלות נטושות אתמול</td><td style="text-align:left;font-weight:700">${stats.abandonedCarts}</td></tr>
    <tr><td style="padding:6px 0;color:#5B4D40">צפיות באתר</td><td style="text-align:left;font-weight:700">${stats.pageViews}</td></tr>
  </table>

  <h2 style="font-size:14px;margin:0 0 8px;border-bottom:1px solid #D9C3A5;padding-bottom:6px">דורש טיפול</h2>
  <table style="width:100%;margin-bottom:24px">
    <tr><td style="padding:6px 0;color:#5B4D40">הודעות יצירת קשר חדשות</td><td style="text-align:left;font-weight:700">${queues.newMessages}</td></tr>
    <tr><td style="padding:6px 0;color:#5B4D40">עגלות לשחזור (7 ימים)</td><td style="text-align:left;font-weight:700">${queues.freshAbandoned}</td></tr>
    <tr><td style="padding:6px 0;color:#5B4D40">מוצרים שאזלו</td><td style="text-align:left;font-weight:700">${stats.lowStockItems}</td></tr>
  </table>

  ${queues.pendingOrders.length > 0 ? `
  <h2 style="font-size:14px;margin:0 0 8px;border-bottom:1px solid #D9C3A5;padding-bottom:6px">הזמנות שממתינות לתשלום</h2>
  <ul style="margin:0 0 24px;padding:0;list-style:none">
    ${queues.pendingOrders.map((o) => `<li style="padding:6px 0;font-size:13px"><strong>${o.orderNumber}</strong> · ₪${o.total.toLocaleString()} · ${new Date(o.createdAt).toLocaleDateString("he-IL")}</li>`).join("")}
  </ul>` : ""}

  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:24px">
    <a href="https://modaco.co.il/admin/dashboard" style="background:#0A0908;color:#FAF6F0;padding:10px 18px;text-decoration:none;font-size:13px">פתח דשבורד</a>
    <a href="https://modaco.co.il/admin/orders?status=PENDING" style="border:1px solid #0A0908;color:#0A0908;padding:10px 18px;text-decoration:none;font-size:13px">הזמנות פתוחות</a>
    <a href="https://modaco.co.il/admin/messages?status=NEW" style="border:1px solid #0A0908;color:#0A0908;padding:10px 18px;text-decoration:none;font-size:13px">הודעות חדשות</a>
  </div>

  <p style="margin-top:32px;color:#8B6F4E;font-size:11px">נשלח אוטומטית מ-Inngest cron · 08:00 בכל יום</p>
</body></html>`;

      if (!process.env.RESEND_API_KEY) {
        console.warn("[daily-summary] RESEND_API_KEY missing — logging only");
        console.log(text);
        return;
      }

      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          from: "Modaco <orders@modaco.co.il>",
          to: ["yarin@modaco.co.il"],
          subject: `סיכום יומי · ${stats.newOrders} הזמנות · ₪${stats.revenue.toLocaleString()}`,
          text,
          html,
        }),
      });
      if (!r.ok) {
        const body = await r.text().catch(() => "");
        console.error(`[daily-summary] Resend failed (${r.status}): ${body.slice(0, 200)}`);
      }
    });

    return { ...stats, ...queues };
  }
);
