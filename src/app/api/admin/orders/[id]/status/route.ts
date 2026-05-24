import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set([
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const status = body?.status;
  if (!ALLOWED.has(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const previous = await db.order.findUnique({
    where: { id },
    select: { status: true, orderNumber: true },
  });
  const order = await db.order.update({
    where: { id },
    data: { status },
  });

  await db.orderEvent.create({
    data: {
      orderId: id,
      type: "status_changed",
      data: { to: status, by: (session.user as any).email },
    },
  });

  await db.auditLog
    .create({
      data: {
        actor: (session.user as any).email || "admin",
        action: "order.status_changed",
        entityType: "Order",
        entityId: id,
        data: {
          orderNumber: previous?.orderNumber,
          from: previous?.status,
          to: status,
        },
      },
    })
    .catch((e) => console.warn("[orders.status] audit failed:", e));

  return NextResponse.json({ ok: true, order });
}
