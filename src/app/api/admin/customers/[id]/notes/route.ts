/**
 * Update internal notes on a Customer record.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const MAX_NOTES = 4000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const notes = typeof body?.notes === "string" ? body.notes.slice(0, MAX_NOTES) : "";

  await db.customer.update({
    where: { id },
    data: { notes: notes || null },
  });

  return NextResponse.json({ ok: true });
}
