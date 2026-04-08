import * as cheerio from "cheerio";
import type { ScrapedProduct } from "./types";

const BASE_URL = "https://www.nyga.co.il";

export async function scrapeNygaProduct(url: string): Promise<ScrapedProduct> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const name = $("h1.product_title").text().trim();
  const description = $(".woocommerce-product-details__short-description")
    .text()
    .trim();

  // Price
  const priceText = $(".woocommerce-Price-amount bdi").first().text().trim();
  const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || null;

  // Images
  const images: string[] = [];
  $(".woocommerce-product-gallery__image img").each((_, el) => {
    const src = $(el).attr("data-large_image") || $(el).attr("src");
    if (src) images.push(src);
  });

  // Variants (colors/finishes from WooCommerce)
  const variants: { name: string; price: number | null }[] = [];
  $("select.variation-selector option, .variable-items-wrapper .variable-item").each(
    (_, el) => {
      const varName = $(el).text().trim() || $(el).attr("data-title") || "";
      if (varName && varName !== "בחר אפשרות") {
        variants.push({ name: varName, price: null });
      }
    }
  );

  // Specs from additional info table
  const specs: Record<string, string> = {};
  $(".woocommerce-product-attributes tr").each((_, el) => {
    const label = $(el).find("th").text().trim();
    const value = $(el).find("td").text().trim();
    if (label && value) specs[label] = value;
  });

  // SKU
  const supplierSku = $(".sku").text().trim() || null;

  // Category
  const category = $(".posted_in a").first().text().trim() || "ברזי מטבח";

  return {
    name,
    description,
    price,
    images,
    variants,
    category,
    supplierUrl: url,
    supplierSku,
    specs,
  };
}

export async function scrapeNygaCollection(
  url: string
): Promise<{ name: string; url: string }[]> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const products: { name: string; url: string }[] = [];
  $(".products .product a.woocommerce-LoopProduct-link").each((_, el) => {
    const href = $(el).attr("href");
    const productName = $(el).find("h2").text().trim();
    if (href && productName) {
      products.push({
        name: productName,
        url: href.startsWith("http") ? href : `${BASE_URL}${href}`,
      });
    }
  });

  return products;
}
