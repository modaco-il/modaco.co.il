/**
 * Regenerate a Morning hosted-checkout link for an existing order.
 *
 * Used by Yarin from the order detail page when:
 *   - The original payment-link generation failed at checkout (most often
 *     errorCode 2600: clearing not yet approved by Grow), so the order
 *     sits PENDING with no `paymentRef`.
 *   - The original link expired or the customer lost it and asks for a
 *     fresh one.
 *
 * Behaviour:
 *   - Only ADMINs can call.
 *   - Only PENDING orders are eligible (PAID orders should not generate
 *     new payment links — silently ignore on the client side; the route
 *     returns 409 if asked).
 *   - On success, the new URL replaces `paymentRef` and an
 *     OrderEvent("payment_link_generated") is recorded.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createPaymentForm } from "@/lib/morning/payments";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: { include: { user: true } },
      address: true,
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
  });
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: `order status is ${order.status}, not PENDING` },
      { status: 409 },
    );
  }

  // Build an origin matching the storefront — webhook + return URLs must
  // be absolute and reach this same deployment.
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  const origin = host
    ? `${proto}://${host}`
    : process.env.NEXT_PUBLIC_SITE_URL || "https://modaco.co.il";

  const name =
    order.address?.fullName ||
    order.customer?.user?.name ||
    order.customer?.user?.email ||
    "Modaco customer";
  const email = order.customer?.user?.email || "";
  const phone = order.address?.phone || order.customer?.user?.phone || "";

  try {
    const form = await createPaymentForm({
      type: 320,
      description: `הזמנה ${order.orderNumber} · Modaco`,
      amount: order.total,
      vatType: 0,
      client: {
        name,
        emails: email ? [email] : undefined,
        phone: phone || undefined,
        address: order.address?.street || undefined,
        city: order.address?.city || undefined,
        zip: order.address?.zipCode || undefined,
        country: "IL",
      },
      income: order.items.map((it) => ({
        description: `${it.variant.product.name} – ${it.variant.name}`,
        price: it.unitPrice,
        quantity: it.quantity,
      })),
      successUrl: `${origin}/checkout/success?o=${order.id}`,
      failureUrl: `${origin}/checkout/failed?o=${order.id}`,
      notifyUrl: `${origin}/api/checkout/morning-webhook`,
      custom: order.id,
    });

    await db.order.update({
      where: { id: order.id },
      data: { paymentRef: form.url },
    });

    await db.orderEvent.create({
      data: {
        orderId: order.id,
        type: "payment_link_generated",
        data: {
          url: form.url,
          formId: form.formId,
          by: (session.user as any).email,
        },
      },
    });

    return NextResponse.json({ ok: true, paymentUrl: form.url, formId: form.formId });
  } catch (err) {
    const message = (err as Error).message;
    // Capture the failure too so we have a paper trail for the Grow gap.
    await db.orderEvent.create({
      data: {
        orderId: order.id,
        type: "payment_link_failed",
        data: { error: message, by: (session.user as any).email },
      },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
