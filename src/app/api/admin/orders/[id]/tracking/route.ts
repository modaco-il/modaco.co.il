import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const trackingNumber: string = (body?.trackingNumber || "").trim().slice(0, 60);

  await db.order.update({
    where: { id },
    data: { trackingNumber: trackingNumber || null },
  });

  await db.orderEvent.create({
    data: {
      orderId: id,
      type: "tracking_updated",
      data: { trackingNumber, by: (session.user as any).email },
    },
  });

  return NextResponse.json({ ok: true });
}
