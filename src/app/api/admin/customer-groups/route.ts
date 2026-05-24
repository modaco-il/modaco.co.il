/**
 * POST /api/admin/customer-groups — create a new CustomerGroup.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/auth/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSuperAdmin(session)) {
    return NextResponse.json(
      { error: "ניהול קבוצות לקוחות זמין רק לבעלים" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const displayName = String(body.displayName || "").trim();
  const discountPercent = Number(body.discountPercent) || 0;
  const paymentTerms = String(body.paymentTerms || "").trim() || null;

  if (!name || !displayName) {
    return NextResponse.json(
      { error: "name + displayName חובה" },
      { status: 400 },
    );
  }
  if (!/^[a-z_-]+$/.test(name)) {
    return NextResponse.json(
      { error: "name חייב להיות אנגלית קטנה בלבד (a-z, _, -)" },
      { status: 400 },
    );
  }
  if (discountPercent < 0 || discountPercent > 100) {
    return NextResponse.json(
      { error: "הנחה חייבת להיות בין 0 ל-100" },
      { status: 400 },
    );
  }

  try {
    const group = await db.customerGroup.create({
      data: { name, displayName, discountPercent, paymentTerms },
    });
    return NextResponse.json({ ok: true, group });
  } catch (err) {
    const msg = (err as { code?: string }).code === "P2002" ? "שם כבר תפוס" : (err as Error).message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
