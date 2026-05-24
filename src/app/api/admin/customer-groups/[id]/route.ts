/**
 * PATCH / DELETE on a single CustomerGroup.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") {
    if (!/^[a-z_-]+$/.test(body.name)) {
      return NextResponse.json(
        { error: "name חייב להיות אנגלית קטנה בלבד" },
        { status: 400 },
      );
    }
    data.name = body.name.trim();
  }
  if (typeof body.displayName === "string") {
    data.displayName = body.displayName.trim();
  }
  if (typeof body.discountPercent !== "undefined") {
    const v = Number(body.discountPercent);
    if (isNaN(v) || v < 0 || v > 100) {
      return NextResponse.json(
        { error: "הנחה חייבת להיות בין 0 ל-100" },
        { status: 400 },
      );
    }
    data.discountPercent = v;
  }
  if (typeof body.paymentTerms === "string") {
    data.paymentTerms = body.paymentTerms.trim() || null;
  }

  try {
    const group = await db.customerGroup.update({ where: { id }, data });
    return NextResponse.json({ ok: true, group });
  } catch (err) {
    const msg = (err as { code?: string }).code === "P2002" ? "שם כבר תפוס" : (err as Error).message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  // Detach customers first (set groupId=null), then delete the group.
  await db.$transaction([
    db.customer.updateMany({ where: { groupId: id }, data: { groupId: null } }),
    db.groupPrice.deleteMany({ where: { groupId: id } }),
    db.customerGroup.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
