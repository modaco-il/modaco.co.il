import { scrapeNygaProduct, scrapeNygaCollection } from "./nyga";
import { scrapeFloralProduct, scrapeFloralCollection } from "./floralis";
import { scrapeDomicileProduct, scrapeDomicileCategory } from "./domicile";
import { scrapeGenericProduct } from "./generic";
import type { ScrapedProduct } from "./types";

export type { ScrapedProduct };
export { scrapeGenericProduct };

// Map supplier domains to their scrapers
const supplierMap: Record<
  string,
  {
    name: string;
    scrapeProduct: (url: string) => Promise<ScrapedProduct>;
    scrapeCollection: (url: string) => Promise<{ name: string; url: string }[]>;
  }
> = {
  "nyga.co.il": {
    name: "Nyga",
    scrapeProduct: scrapeNygaProduct,
    scrapeCollection: scrapeNygaCollection,
  },
  "floralis.co.il": {
    name: "Floralis",
    scrapeProduct: scrapeFloralProduct,
    scrapeCollection: scrapeFloralCollection,
  },
  "domicile.co.il": {
    name: "Domicile",
    scrapeProduct: scrapeDomicileProduct,
    scrapeCollection: scrapeDomicileCategory,
  },
};

/**
 * Auto-detect supplier from URL and scrape product. Falls back to a generic
 * OG/JSON-LD scraper for unknown hosts, so any URL with a product page can be
 * imported — Yarin then fills in the category/variants in the preview step.
 *
 * Returns { supplier: "Generic" } when the fallback was used; supplier names
 * for known scrapers ("Nyga", "Floralis", "Domicile") otherwise.
 */
export async function scrapeProductFromUrl(
  url: string
): Promise<{ product: ScrapedProduct; supplier: string } | null> {
  const hostname = new URL(url).hostname.replace("www.", "");
  const supplier = supplierMap[hostname];

  if (supplier) {
    const product = await supplier.scrapeProduct(url);
    return { product, supplier: supplier.name };
  }

  // Fallback: try to extract product data from OG/JSON-LD on any URL.
  // The generic scraper throws if it can't find a name; we let that bubble up
  // so the caller can show a meaningful error.
  const product = await scrapeGenericProduct(url);
  return { product, supplier: "Generic" };
}

/**
 * Scrape all products from a collection/category page.
 */
export async function scrapeCollectionFromUrl(
  url: string
): Promise<{ products: { name: string; url: string }[]; supplier: string } | null> {
  const hostname = new URL(url).hostname.replace("www.", "");
  const supplier = supplierMap[hostname];

  if (!supplier) {
    return null;
  }

  const products = await supplier.scrapeCollection(url);
  return { products, supplier: supplier.name };
}

/**
 * Generate a slug from a Hebrew product name.
 */
export function generateSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0590-\u05FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

/**
 * Generate a SKU from supplier name and product name.
 */
export function generateSku(supplier: string, name: string): string {
  const prefix = supplier.slice(0, 3).toUpperCase();
  const hash = Math.abs(
    name.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  )
    .toString(36)
    .toUpperCase()
    .slice(0, 6);
  return `${prefix}-${hash}`;
}
