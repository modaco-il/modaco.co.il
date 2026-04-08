import * as cheerio from "cheerio";
import type { ScrapedProduct } from "./types";

const BASE_URL = "https://www.floralis.co.il";

export async function scrapeFloralProduct(
  url: string
): Promise<ScrapedProduct> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  // Shopify product page structure
  const name = $("h1.product__title, h1").first().text().trim();
  const description = $(
    ".product__description, .product-single__description"
  )
    .text()
    .trim();

  // Price (Shopify format)
  const priceText = $(".product__price, .price-item--regular")
    .first()
    .text()
    .trim();
  const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || null;

  // Images
  const images: string[] = [];
  $(
    ".product__media img, .product-single__media img, .product__photo img"
  ).each((_, el) => {
    let src = $(el).attr("data-src") || $(el).attr("src") || "";
    if (src.startsWith("//")) src = `https:${src}`;
    // Get high-res version
    if (src.includes("_small") || src.includes("_medium")) {
      src = src.replace(/_small|_medium|_compact|_grande/, "");
    }
    if (src) images.push(src);
  });

  // Variants
  const variants: { name: string; price: number | null }[] = [];
  $("select[name='id'] option, .swatch__button").each((_, el) => {
    const varName = $(el).text().trim() || $(el).attr("data-value") || "";
    if (varName && !varName.includes("---")) {
      variants.push({ name: varName, price: null });
    }
  });

  // Category from breadcrumbs
  const category =
    $(".breadcrumbs a, .breadcrumb a").last().text().trim() ||
    "אקססוריז לבית";

  return {
    name,
    description,
    price,
    images,
    variants,
    category,
    supplierUrl: url,
    supplierSku: null,
    specs: {},
  };
}

export async function scrapeFloralCollection(
  url: string
): Promise<{ name: string; url: string }[]> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const products: { name: string; url: string }[] = [];
  $(
    ".collection-product-card a, .product-card a, .grid-product__link"
  ).each((_, el) => {
    const href = $(el).attr("href");
    const productName = $(el).find(".product-card__name, .grid-product__title, h3").text().trim();
    if (href) {
      products.push({
        name: productName || "מוצר",
        url: href.startsWith("http") ? href : `${BASE_URL}${href}`,
      });
    }
  });

  // Deduplicate by URL
  const seen = new Set<string>();
  return products.filter((p) => {
    if (seen.has(p.url)) return false;
    seen.add(p.url);
    return true;
  });
}
