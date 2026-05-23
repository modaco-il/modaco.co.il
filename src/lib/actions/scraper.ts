"use server";

/**
 * Server actions powering the focused "Add product from URL" wizard at
 * /admin/products/from-url. These wrap the same scrapers + DB writes that the
 * agent's tools use, but expose them as direct RPCs so we can give Yarin a
 * single-purpose, low-friction UI for the most common operation.
 *
 * The agent chat at /admin/agent stays as the catch-all for everything else.
 */
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  scrape_product,
  add_product_from_url,
  list_categories,
} from "@/lib/agent/tools";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "ADMIN") {
    throw new Error("unauthorized");
  }
}

export interface PreviewResult {
  ok: true;
  name: string;
  description: string | undefined;
  price: number | undefined;
  imageCount: number;
  images: string[];
  sku: string | undefined;
  detectedCategory: string | undefined;
  supplier: "domicile" | "nyga" | "floralis" | null;
  variantCount: number;
}

export type ActionResult<T> =
  | T
  | { ok: false; error: string };

/**
 * Step 1: scrape + show the product without writing anything to the catalog.
 * Used by the wizard's "preview" step so Yarin can see what's coming before
 * committing.
 */
export async function previewFromUrl(url: string): Promise<ActionResult<PreviewResult>> {
  await requireAdmin();
  if (!url || !/^https?:\/\//.test(url)) {
    return { ok: false, error: "כתובת לא תקינה" };
  }
  try {
    const scraped = await scrape_product({ url });
    return {
      ok: true,
      name: scraped.name,
      description: scraped.description ?? undefined,
      // Scraper returns null when price can't be parsed; the UI handles undefined
      price: scraped.price ?? undefined,
      imageCount: scraped.imageCount,
      images: scraped.images,
      sku: scraped.sku ?? undefined,
      detectedCategory: scraped.detectedCategory ?? undefined,
      supplier: scraped.supplier,
      variantCount: scraped.variants?.length || 1,
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export interface CategoryOption {
  slug: string;
  name: string;
  productCount: number;
}

export async function listCategoriesForPicker(): Promise<CategoryOption[]> {
  await requireAdmin();
  return await list_categories();
}

export interface CreateResult {
  ok: true;
  productId: string;
  productSlug: string;
  name: string;
  imagesAdded: number;
  alreadyExisted: boolean;
}

/**
 * Step 2: commit the product to the DB. Same code path as the agent tool;
 * we just expose it as a typed RPC for the wizard.
 */
export async function createFromUrl(input: {
  url: string;
  categorySlug: string;
  customName?: string;
  customPrice?: number;
}): Promise<ActionResult<CreateResult>> {
  await requireAdmin();
  try {
    const r = await add_product_from_url(input);

    // Fetch the slug so the success screen can link to the live product
    const product = await db.product.findUnique({
      where: { id: r.productId },
      select: { slug: true, name: true },
    });

    // The agent tool already revalidates indirectly when categories change;
    // a product addition needs a /products + category revalidation too.
    revalidatePath("/products");
    revalidatePath(`/categories/${input.categorySlug}`);
    revalidatePath("/");

    return {
      ok: true,
      productId: r.productId,
      productSlug: product?.slug || "",
      name: product?.name || r.name,
      imagesAdded: ("imagesAdded" in r ? r.imagesAdded : 0) as number,
      alreadyExisted: r.status === "exists",
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
