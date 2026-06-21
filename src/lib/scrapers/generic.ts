/**
 * Generic fallback scraper for arbitrary product URLs.
 *
 * Tries, in order of decreasing trust:
 *   1. JSON-LD `Product` schema  — used by most modern e-commerce sites
 *   2. OpenGraph `og:product:*`   — used by Facebook-friendly stores
 *   3. Twitter card + og:title    — last-resort name/image extraction
 *
 * Returns a `ScrapedProduct` shape compatible with the supplier-specific
 * scrapers, but with empty/minimal variants and category (we don't try to
 * guess those — Yarin assigns them in the wizard's preview step).
 *
 * This is intentionally permissive: it will return SOMETHING for almost any
 * URL with at least an OG image and a title. Worst case Yarin edits the
 * preview before saving — better than the previous "Unsupported supplier"
 * error that forced manual entry.
 */
import type { ScrapedProduct } from "./types";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

interface JsonLdProduct {
  "@type"?: string | string[];
  name?: string;
  description?: string;
  image?: string | string[] | { url?: string }[];
  offers?:
    | {
        "@type"?: string;
        price?: string | number;
        priceCurrency?: string;
        priceSpecification?: { price?: string | number };
        availability?: string;
      }
    | {
        "@type"?: string;
        price?: string | number;
        priceCurrency?: string;
        availability?: string;
      }[];
  sku?: string;
  mpn?: string;
  brand?: { name?: string } | string;
  category?: string;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function metaContent(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const m = html.match(re);
  if (m) return decodeHtmlEntities(m[1]);
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? decodeHtmlEntities(m2[1]) : null;
}

function allMetaContent(html: string, name: string): string[] {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*content=["']([^"']*)["']`,
    "gi",
  );
  return [...html.matchAll(re)].map((m) => decodeHtmlEntities(m[1]));
}

function extractJsonLd(html: string): JsonLdProduct | null {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    try {
      const raw = m[1].trim();
      const parsed = JSON.parse(raw);
      const candidates: unknown[] = Array.isArray(parsed)
        ? parsed
        : parsed["@graph"]
          ? (parsed["@graph"] as unknown[])
          : [parsed];
      for (const c of candidates) {
        if (!c || typeof c !== "object") continue;
        const obj = c as JsonLdProduct;
        const type = obj["@type"];
        const isProduct = Array.isArray(type)
          ? type.some((t) => /product/i.test(String(t)))
          : /product/i.test(String(type ?? ""));
        if (isProduct) return obj;
      }
    } catch {
      // Some sites embed broken JSON-LD; just skip.
    }
  }
  return null;
}

function priceFromJsonLd(ld: JsonLdProduct): number | null {
  const offers = ld.offers;
  const pick = (o: unknown): number | null => {
    if (!o || typeof o !== "object") return null;
    const oo = o as {
      price?: string | number;
      priceSpecification?: { price?: string | number };
    };
    const raw =
      typeof oo.price !== "undefined"
        ? oo.price
        : oo.priceSpecification?.price;
    if (raw === undefined || raw === null) return null;
    const n = typeof raw === "number" ? raw : Number(String(raw).replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  if (Array.isArray(offers)) {
    for (const o of offers) {
      const p = pick(o);
      if (p !== null) return p;
    }
    return null;
  }
  return pick(offers);
}

function imagesFromJsonLd(ld: JsonLdProduct): string[] {
  const raw = ld.image;
  if (!raw) return [];
  if (typeof raw === "string") return [raw];
  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === "string" ? x : x?.url))
      .filter((u): u is string => typeof u === "string" && u.length > 0);
  }
  return [];
}

/**
 * Best-effort scrape from any URL with no supplier-specific knowledge.
 * Throws if the page returns non-2xx or has no recognizable product data.
 */
export async function scrapeGenericProduct(url: string): Promise<ScrapedProduct> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "he,en;q=0.9",
    },
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Generic scrape failed: HTTP ${res.status} for ${url}`);
  }
  const html = await res.text();

  // 1. JSON-LD
  const ld = extractJsonLd(html);
  let name = ld?.name?.trim() ?? null;
  let description = (ld?.description ?? "").trim();
  let price = ld ? priceFromJsonLd(ld) : null;
  let images = ld ? imagesFromJsonLd(ld) : [];
  let sku = ld?.sku ?? ld?.mpn ?? null;

  // 2. OpenGraph fallback
  if (!name) name = metaContent(html, "og:title") ?? metaContent(html, "twitter:title");
  if (!description)
    description =
      metaContent(html, "og:description") ?? metaContent(html, "description") ?? "";
  if (!price) {
    const ogPrice =
      metaContent(html, "product:price:amount") ??
      metaContent(html, "og:price:amount") ??
      metaContent(html, "twitter:data1");
    if (ogPrice) {
      const n = Number(ogPrice.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(n) && n > 0) price = n;
    }
  }
  if (!images.length) {
    const og = allMetaContent(html, "og:image");
    images = og;
  }

  // 3. <title> fallback for name
  if (!name) {
    const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (t) name = decodeHtmlEntities(t[1].trim().slice(0, 200));
  }

  if (!name) {
    throw new Error(
      `Could not extract product name from ${url}. The page may not be a product page.`,
    );
  }

  // De-dupe + absolutize image URLs
  const base = new URL(url);
  const absoluteImages = [...new Set(images)]
    .map((src) => {
      try {
        return new URL(src, base).toString();
      } catch {
        return null;
      }
    })
    .filter((s): s is string => !!s);

  return {
    name,
    description: description || "",
    price,
    images: absoluteImages,
    variants: [],
    category: "",
    supplierUrl: url,
    supplierSku: sku,
    specs: {},
  };
}
