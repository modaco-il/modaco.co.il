/**
 * Morning payment webhook.
 *
 * When Morning's hosted checkout completes (success or failure), it POSTs
 * here with the result. We use the `custom` field we passed in (the order
 * id) to look up the order, then update its status accordingly.
 *
 * Morning's webhook isn't HMAC-signed in the public Apiary docs, but the
 * `custom` field is sufficient since it's a server-generated cuid we never
 * leak. We still defensively validate that the order exists and that the
 * amount matches.
 *
 * Expected payload shape (from observed Morning webhooks):
 *   {
 *     "id": "<form id>",
 *     "custom": "<our order id>",
 *     "status": "PAID" | "FAILED" | "CANCELED",
 *     "amount": 123.45,
 *     "documentId": "<invoice id when status=PAID>",
 *     "transactionId": "<clearing transaction>",
 *     ...
 *   }
 */
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface MorningWebhookPayload {
  id?: string;
  custom?: string;
  status?: string;
  amount?: number;
  documentId?: string;
  transactionId?: string;
  [k: string]: unknown;
}

export async function POST(req: NextRequest) {
  let body: MorningWebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const orderId = body.custom;
  if (!orderId) {
    console.warn("[morning-webhook] no custom field, ignoring", body);
    return NextResponse.json({ ok: true, note: "no order id in custom" });
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, total: true, status: true, orderNumber: true },
  });
  if (!order) {
    console.warn(`[morning-webhook] order ${orderId} not found`);
    return NextResponse.json({ ok: true, note: "order not found" });
  }

  // Defensive amount check — log if Morning reports a different amount but
  // don't reject (rounding differences happen).
  if (typeof body.amount === "number" && Math.abs(body.amount - order.total) > 0.5) {
    console.warn(
      `[morning-webhook] amount mismatch for ${order.orderNumber}: ` +
        `expected ${order.total}, got ${body.amount}`,
    );
  }

  const status = (body.status || "").toUpperCase();
  let newStatus: "PAID" | "CANCELLED" | null = null;
  if (status === "PAID" || status === "APPROVED" || status === "SUCCESS") {
    newStatus = "PAID";
  } else if (status === "FAILED" || status === "CANCELED" || status === "CANCELLED") {
    newStatus = "CANCELLED";
  }

  if (newStatus && newStatus !== order.status) {
    await db.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        invoiceRef: body.documentId || undefined,
      },
    });
    await db.orderEvent.create({
      data: {
        orderId: order.id,
        type: newStatus === "PAID" ? "paid" : "cancelled",
        data: {
          source: "morning-webhook",
          transactionId: body.transactionId || null,
          documentId: body.documentId || null,
          rawStatus: status,
        },
      },
    });
  }

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber, newStatus });
}

// Morning hits this with POST only — return 405 on GET to make that obvious.
export async function GET() {
  return NextResponse.json(
    { error: "POST only", note: "this is the Morning payment webhook" },
    { status: 405 },
  );
}
