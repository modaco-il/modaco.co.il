/**
 * Inline quick-actions for a product from the admin product list.
 * Lets Yarin flip stock + archive + edit price without opening the product
 * page or chatting with the agent. POST body shape:
 *
 *   { action: "toggle_out_of_stock" }              → flips every variant between
 *                                                    OUT_OF_STOCK and AT_SUPPLIER
 *   { action: "set_variant_stock", variantId, status }
 *                                                  → sets one variant's stockStatus
 *                                                    (status ∈ IN_STOCK|AT_SUPPLIER|ON_ORDER|OUT_OF_STOCK)
 *   { action: "archive" }                           → status → ARCHIVED (hides from shop)
 *   { action: "restore" }                           → status → ACTIVE
 *   { action: "set_price", price: number }          → basePrice = price
 *
 * ADMIN-only. Revalidates the storefront so the change shows up immediately.
 */
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type Action =
  | "toggle_out_of_stock"
  | "set_variant_stock"
  | "archive"
  | "restore"
  | "set_price";
const ALLOWED: Action[] = [
  "toggle_out_of_stock",
  "set_variant_stock",
  "archive",
  "restore",
  "set_price",
];
const STOCK_STATUSES = ["IN_STOCK", "AT_SUPPLIER", "ON_ORDER", "OUT_OF_STOCK"] as const;
type StockStatus = (typeof STOCK_STATUSES)[number];

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

  if (action === "set_variant_stock") {
    const variantId = String(body?.variantId ?? "");
    const status = String(body?.status ?? "") as StockStatus;
    if (!variantId || !STOCK_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "variantId and valid status required" },
        { status: 400 },
      );
    }
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) {
      return NextResponse.json(
        { error: "variant not found on this product" },
        { status: 404 },
      );
    }
    await db.variant.update({
      where: { id: variantId },
      data: { stockStatus: status },
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, variantId, stockStatus: status });
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

  if (action === "set_price") {
    const price = Number(body?.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "invalid price" }, { status: 400 });
    }
    const updated = await db.product.update({
      where: { id },
      data: { basePrice: price },
      select: { basePrice: true },
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, basePrice: updated.basePrice });
  }

  return NextResponse.json({ error: "unreachable" }, { status: 500 });
}
