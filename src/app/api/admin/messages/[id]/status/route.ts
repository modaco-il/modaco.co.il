/**
 * Update the status of a ContactMessage.
 *
 * Allowed transitions: any → any. We rely on Yarin's discretion and
 * keep the schema permissive; audit log captures who made the change.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set(["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"]);

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
  const status = body?.status as string | undefined;
  if (!status || !ALLOWED.has(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const existing = await db.contactMessage.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await db.contactMessage.update({
    where: { id },
    data: { status: status as any },
  });

  // Audit
  await db.auditLog
    .create({
      data: {
        actor: (session.user as any).email || "admin",
        action: "contact_message.status_changed",
        entityType: "ContactMessage",
        entityId: id,
        data: { from: existing.status, to: status },
      },
    })
    .catch((e) => console.warn("[messages.status] audit failed:", e));

  return NextResponse.json({ ok: true, status });
}
