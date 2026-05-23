/**
 * Inline quick-actions for a product from the admin product list.
 * Lets Yarin flip stock + archive without opening the product page or chatting
 * with the agent. POST body shape:
 *
 *   { action: "toggle_out_of_stock" }      → flips every variant between
 *                                            OUT_OF_STOCK and AT_SUPPLIER
 *   { action: "archive" }                   → status → ARCHIVED (hides from shop)
 *   { action: "restore" }                   → status → ACTIVE
 *
 * ADMIN-only. Revalidates the storefront so the change shows up immediately.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type Action = "toggle_out_of_stock" | "archive" | "restore";
const ALLOWED: Action[] = ["toggle_out_of_stock", "archive", "restore"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body?.action as Action;
  if (!ALLOWED.includes(action)) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      variants: { select: { id: true, stockStatus: true } },
    },
  });
  if (!product) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (action === "toggle_out_of_stock") {
    // If ANY variant is currently OUT_OF_STOCK, restore all to AT_SUPPLIER;
    // otherwise mark all as OUT_OF_STOCK. Single-click behavior — matches the
    // toggle button in the UI.
    const anyOut = product.variants.some((v) => v.stockStatus === "OUT_OF_STOCK");
    const next = anyOut ? "AT_SUPPLIER" : "OUT_OF_STOCK";
    await db.variant.updateMany({
      where: { productId: id },
      data: { stockStatus: next },
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, newStockStatus: next });
  }

  if (action === "archive") {
    await db.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, status: "ARCHIVED" });
  }

  if (action === "restore") {
    await db.product.update({ where: { id }, data: { status: "ACTIVE" } });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, status: "ACTIVE" });
  }

  return NextResponse.json({ error: "unreachable" }, { status: 500 });
}
