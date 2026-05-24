/**
 * Stamp `recoverySentAt` on an abandoned cart.
 *
 * Called fire-and-forget when Yarin clicks "WhatsApp לשחזור" from
 * /admin/carts. Best-effort — failing here doesn't break the action.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.cart.update({
    where: { id },
    data: { recoverySentAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
