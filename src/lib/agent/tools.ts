/**
 * Tool implementations for Yarin's admin agent. Each function here corresponds
 * to a tool exposed to Claude in /api/admin/agent. Tools are intentionally
 * small + idempotent: the agent composes them, not the other way around.
 */
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { scrapeNygaProduct, scrapeNygaCollection } from "@/lib/scrapers/nyga";
import { scrapeFloralProduct, scrapeFloralCollection } from "@/lib/scrapers/floralis";
import { scrapeDomicileProduct, scrapeDomicileCategory } from "@/lib/scrapers/domicile";
import type { ScrapedProduct } from "@/lib/scrapers/types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function detectSupplier(url: string): "domicile" | "nyga" | "floralis" | null {
  if (url.includes("domicile.co.il")) return "domicile";
  if (url.includes("nyga.co.il")) return "nyga";
  if (url.includes("floralis")) return "floralis";
  return null;
}

async function scrapeAnyProduct(url: string): Promise<ScrapedProduct> {
  const supplier = detectSupplier(url);
  if (!supplier) throw new Error(`Unsupported supplier for URL: ${url}`);
  if (supplier === "domicile") return scrapeDomicileProduct(url);
  if (supplier === "nyga") return scrapeNygaProduct(url);
  return scrapeFloralProduct(url);
}

async function scrapeAnyCollection(url: string): Promise<{ name: string; url: string }[]> {
  const supplier = detectSupplier(url);
  if (!supplier) throw new Error(`Unsupported supplier for URL: ${url}`);
  if (supplier === "domicile") return scrapeDomicileCategory(url);
  if (supplier === "nyga") return scrapeNygaCollection(url);
  return scrapeFloralCollection(url);
}

/* ------------------------------------------------------------------ */
/* Tool: scrape_product                                                */
/* ------------------------------------------------------------------ */

export async function scrape_product(args: { url: string }) {
  const product = await scrapeAnyProduct(args.url);
  return {
    name: product.name,
    description: product.description?.slice(0, 500),
    price: product.price,
    variants: product.variants,
    imageCount: product.images.length,
    images: product.images.slice(0, 3),
    sku: product.supplierSku,
    detectedCategory: product.category,
    supplier: detectSupplier(args.url),
  };
}

/* ------------------------------------------------------------------ */
/* Tool: scrape_category — returns list of product URLs in a category */
/* ------------------------------------------------------------------ */

export async function scrape_category(args: { url: string }) {
  const items = await scrapeAnyCollection(args.url);
  return {
    count: items.length,
    products: items.slice(0, 50).map((i) => ({ name: i.name, url: i.url })),
    supplier: detectSupplier(args.url),
  };
}

/* ------------------------------------------------------------------ */
/* Tool: search_products — find existing products in DB                */
/* ------------------------------------------------------------------ */

export async function search_products(args: { query: string; limit?: number }) {
  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: args.query, mode: "insensitive" } },
        { supplierSku: { contains: args.query, mode: "insensitive" } },
        { slug: { contains: args.query.toLowerCase() } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      status: true,
      supplierSku: true,
      category: { select: { slug: true, name: true } },
      _count: { select: { images: true } },
    },
    take: Math.min(args.limit ?? 10, 30),
  });
  return { count: products.length, products };
}

/* ------------------------------------------------------------------ */
/* Tool: list_categories                                               */
/* ------------------------------------------------------------------ */

export async function list_categories() {
  const cats = await db.category.findMany({
    select: {
      slug: true,
      name: true,
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
    orderBy: { sortOrder: "asc" },
  });
  return cats.map((c) => ({ slug: c.slug, name: c.name, productCount: c._count.products }));
}

/* ------------------------------------------------------------------ */
/* Tool: add_product_from_url — scrape + insert + upload images        */
/* ------------------------------------------------------------------ */

export async function add_product_from_url(args: {
  url: string;
  categorySlug: string;
  /** Override the supplier-detected name */
  customName?: string;
  /** Override scraped price (e.g. with markup) */
  customPrice?: number;
}) {
  const scraped = await scrapeAnyProduct(args.url);

  const category = await db.category.findUnique({ where: { slug: args.categorySlug } });
  if (!category) throw new Error(`Category not found: ${args.categorySlug}`);

  const supplier = detectSupplier(args.url);
  const supplierRow = supplier
    ? await db.supplier.upsert({
        where: { name: supplier },
        update: {},
        create: { name: supplier, website: `https://${supplier}.co.il` },
      })
    : null;

  const name = args.customName ?? scraped.name;
  const price = args.customPrice ?? scraped.price ?? 0;
  const slugBase = (scraped.supplierSku || name)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .slice(0, 60);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  // Skip if already exists by supplierUrl
  const existing = await db.product.findFirst({ where: { supplierUrl: args.url } });
  if (existing) {
    return { status: "exists", productId: existing.id, name: existing.name };
  }

  const product = await db.product.create({
    data: {
      name,
      slug,
      description: scraped.description?.slice(0, 2000) || null,
      categoryId: category.id,
      supplierId: supplierRow?.id,
      supplierUrl: args.url,
      supplierSku: scraped.supplierSku,
      basePrice: price,
      status: "ACTIVE",
      sortOrder: 0,
    },
  });

  // Variants
  if (scraped.variants.length > 0) {
    for (let i = 0; i < scraped.variants.length; i++) {
      const v = scraped.variants[i];
      await db.variant.create({
        data: {
          productId: product.id,
          name: v.name,
          sku: `${scraped.supplierSku || slug}-${i + 1}`.slice(0, 50),
          priceOverride: v.price,
          isDefault: i === 0,
          stockStatus: "AT_SUPPLIER",
          sortOrder: i,
        },
      });
    }
  } else {
    await db.variant.create({
      data: {
        productId: product.id,
        name: "סטנדרט",
        sku: `${scraped.supplierSku || slug}-1`.slice(0, 50),
        isDefault: true,
        stockStatus: "AT_SUPPLIER",
      },
    });
  }

  // Images — store remote URLs for now (Supabase upload is a follow-up).
  for (let i = 0; i < scraped.images.slice(0, 6).length; i++) {
    const imgUrl = scraped.images[i];
    await db.productImage.create({
      data: {
        productId: product.id,
        url: imgUrl,
        sourceUrl: imgUrl,
        altText: name,
        sortOrder: i,
      },
    });
  }

  return {
    status: "created",
    productId: product.id,
    name: product.name,
    price: product.basePrice,
    imagesAdded: scraped.images.slice(0, 6).length,
    variantsAdded: scraped.variants.length || 1,
  };
}

/* ------------------------------------------------------------------ */
/* Tool: update_product — change price, status, name, etc.             */
/* ------------------------------------------------------------------ */

export async function update_product(args: {
  productId: string;
  basePrice?: number;
  status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
  name?: string;
  description?: string;
}) {
  const { productId, ...changes } = args;
  // Drop undefined keys
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(changes)) {
    if (v !== undefined) data[k] = v;
  }
  if (Object.keys(data).length === 0) {
    return { status: "noop", reason: "no changes provided" };
  }
  const updated = await db.product.update({
    where: { id: productId },
    data,
    select: { id: true, name: true, basePrice: true, status: true },
  });
  return { status: "updated", product: updated };
}

/* ------------------------------------------------------------------ */
/* Tool: mark_out_of_stock — flip every variant of a product           */
/* ------------------------------------------------------------------ */

export async function mark_out_of_stock(args: { productId: string; outOfStock: boolean }) {
  const newStatus = args.outOfStock ? "OUT_OF_STOCK" : "AT_SUPPLIER";
  const result = await db.variant.updateMany({
    where: { productId: args.productId },
    data: { stockStatus: newStatus },
  });
  return {
    status: "updated",
    productId: args.productId,
    variantsChanged: result.count,
    newStockStatus: newStatus,
  };
}

/* ------------------------------------------------------------------ */
/* Tool: add_category — create new category                            */
/* ------------------------------------------------------------------ */

export async function add_category(args: {
  slug: string;
  name: string;
  brand?: string;
  tagline?: string;
  shortDesc?: string;
  description?: string;
  cover?: string;
  featured?: boolean;
  bentoSize?: "xl" | "lg" | "md" | "sm";
  sortOrder?: number;
}) {
  const existing = await db.category.findUnique({ where: { slug: args.slug } });
  if (existing) {
    return { status: "exists", category: existing };
  }
  // Compute next indexLabel based on current max
  const lastByOrder = await db.category.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const nextOrder = args.sortOrder ?? (lastByOrder?.sortOrder ?? 0) + 1;
  const created = await db.category.create({
    data: {
      slug: args.slug,
      name: args.name,
      brand: args.brand,
      tagline: args.tagline,
      shortDesc: args.shortDesc,
      description: args.description,
      cover: args.cover,
      featured: args.featured ?? true,
      bentoSize: args.bentoSize ?? "sm",
      indexLabel: String(nextOrder).padStart(2, "0"),
      sortOrder: nextOrder,
    },
  });
  // Bust the storefront's getCategories() cache so the new category appears
  // on header/footer/bento immediately on next request
  // Categories appear on every storefront page chrome — wipe the entire layout cache
  revalidatePath("/", "layout");
  return {
    status: "created",
    category: created,
    note: "הקטגוריה זמינה מיידית באתר (cache revalidated). תופיע בכותרת, בפוטר, בדף הבית ובקטלוג.",
  };
}

/* ------------------------------------------------------------------ */
/* Tool: update_category — edit existing category metadata             */
/* ------------------------------------------------------------------ */

export async function update_category(args: {
  slug: string;
  name?: string;
  brand?: string;
  tagline?: string;
  shortDesc?: string;
  description?: string;
  cover?: string;
  featured?: boolean;
  bentoSize?: "xl" | "lg" | "md" | "sm";
  sortOrder?: number;
}) {
  const { slug, ...rest } = args;
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) data[k] = v;
  }
  if (Object.keys(data).length === 0) {
    return { status: "noop", reason: "no changes provided" };
  }
  const updated = await db.category.update({ where: { slug }, data });
  // Categories appear on every storefront page chrome — wipe the entire layout cache
  revalidatePath("/", "layout");
  return { status: "updated", category: updated };
}

/* ------------------------------------------------------------------ */
/* Tool registry — what Claude sees                                    */
/* ------------------------------------------------------------------ */

export const toolDefinitions = [
  {
    name: "scrape_product",
    description:
      "Scrape a single product page from a supported supplier (domicile.co.il, nyga.co.il, floralis). Use this to PREVIEW a product before adding it. Returns name, description, price, variants, image URLs.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "Full URL to the supplier product page" },
      },
      required: ["url"],
    },
  },
  {
    name: "scrape_category",
    description:
      "List all product URLs in a supplier category page. Use this when Yarin asks to upload an entire category (e.g. all of Domicile bath). Returns up to 50 product names + URLs.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "Full URL to the supplier category page" },
      },
      required: ["url"],
    },
  },
  {
    name: "search_products",
    description:
      "Search existing Modaco product catalog. Use this to check if a product already exists before adding, or to find a product to update (by SKU/name).",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search term — name, SKU, or slug fragment" },
        limit: { type: "number", description: "Max results, default 10" },
      },
      required: ["query"],
    },
  },
  {
    name: "list_categories",
    description: "List all Modaco categories with slug, name, and product count. Always call this first when deciding where to put a new product.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "add_product_from_url",
    description:
      "Scrape a supplier product page AND insert it into Modaco's catalog under the given categorySlug. Returns the created product id. If the product already exists (by URL), returns existing instead.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "Supplier product page URL" },
        categorySlug: { type: "string", description: "Modaco category slug to assign (e.g. 'bath', 'handles', 'cladding')" },
        customName: { type: "string", description: "Optional override for the product name" },
        customPrice: { type: "number", description: "Optional override for the base price (e.g. with retail markup)" },
      },
      required: ["url", "categorySlug"],
    },
  },
  {
    name: "update_product",
    description: "Change price, status, name, or description of an existing product.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "string", description: "Modaco product id (cuid)" },
        basePrice: { type: "number" },
        status: { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED"] },
        name: { type: "string" },
        description: { type: "string" },
      },
      required: ["productId"],
    },
  },
  {
    name: "mark_out_of_stock",
    description: "Mark every variant of a product as OUT_OF_STOCK (or back to AT_SUPPLIER).",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: { type: "string" },
        outOfStock: { type: "boolean", description: "true = mark out, false = restore" },
      },
      required: ["productId", "outOfStock"],
    },
  },
  {
    name: "add_category",
    description:
      "Create a new product category. Slug is the URL-safe kebab-case English id; name is the Hebrew display label. Optional metadata (brand, tagline, shortDesc, description, cover, featured, bentoSize) controls how the category appears in the homepage bento, footer, header desktop strip, and /catalog. Cover should be a /images/... path. After creating, the storefront updates within ~60s via the categories cache.",
    input_schema: {
      type: "object" as const,
      properties: {
        slug: { type: "string", description: "URL-safe slug, e.g. 'bath-mirrors'" },
        name: { type: "string", description: "Hebrew display name, e.g. 'מראות לאמבט'" },
        brand: { type: "string", description: "Supplier brand, e.g. 'Domicile' or 'Blanco · Delta'" },
        tagline: { type: "string", description: "Short Hebrew tagline shown under the H1" },
        shortDesc: { type: "string", description: "One-line description for small cards" },
        description: { type: "string", description: "Long-form paragraph for the category page" },
        cover: { type: "string", description: "Hero image path, e.g. '/images/domicile/categories/handles.jpg'" },
        featured: { type: "boolean", description: "Show in homepage bento (default true)" },
        bentoSize: { type: "string", enum: ["xl", "lg", "md", "sm"], description: "Size hint for the bento card (default 'sm')" },
        sortOrder: { type: "number", description: "Numeric position in the lists (lower = earlier). Auto-assigned if omitted." },
      },
      required: ["slug", "name"],
    },
  },
  {
    name: "update_category",
    description:
      "Edit metadata on an existing category (name, brand, tagline, cover image, featured flag, bento size, sort order). Pass only the fields you want to change. Storefront updates within ~60s.",
    input_schema: {
      type: "object" as const,
      properties: {
        slug: { type: "string", description: "Existing category slug to edit" },
        name: { type: "string" },
        brand: { type: "string" },
        tagline: { type: "string" },
        shortDesc: { type: "string" },
        description: { type: "string" },
        cover: { type: "string" },
        featured: { type: "boolean" },
        bentoSize: { type: "string", enum: ["xl", "lg", "md", "sm"] },
        sortOrder: { type: "number" },
      },
      required: ["slug"],
    },
  },
];

/* ------------------------------------------------------------------ */
/* Tool dispatcher                                                     */
/* ------------------------------------------------------------------ */

const dispatch: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  scrape_product: (a) => scrape_product(a as { url: string }),
  scrape_category: (a) => scrape_category(a as { url: string }),
  search_products: (a) => search_products(a as { query: string; limit?: number }),
  list_categories: () => list_categories(),
  add_product_from_url: (a) =>
    add_product_from_url(
      a as { url: string; categorySlug: string; customName?: string; customPrice?: number },
    ),
  update_product: (a) =>
    update_product(
      a as {
        productId: string;
        basePrice?: number;
        status?: "ACTIVE" | "DRAFT" | "ARCHIVED";
        name?: string;
        description?: string;
      },
    ),
  mark_out_of_stock: (a) =>
    mark_out_of_stock(a as { productId: string; outOfStock: boolean }),
  add_category: (a) =>
    add_category(
      a as {
        slug: string;
        name: string;
        brand?: string;
        tagline?: string;
        shortDesc?: string;
        description?: string;
        cover?: string;
        featured?: boolean;
        bentoSize?: "xl" | "lg" | "md" | "sm";
        sortOrder?: number;
      },
    ),
  update_category: (a) =>
    update_category(
      a as {
        slug: string;
        name?: string;
        brand?: string;
        tagline?: string;
        shortDesc?: string;
        description?: string;
        cover?: string;
        featured?: boolean;
        bentoSize?: "xl" | "lg" | "md" | "sm";
        sortOrder?: number;
      },
    ),
};

export async function runTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const fn = dispatch[name];
  if (!fn) throw new Error(`Unknown tool: ${name}`);
  return fn(args);
}
