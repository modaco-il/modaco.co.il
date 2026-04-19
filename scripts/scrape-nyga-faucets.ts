import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {}
}
loadEnv();
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const CATEGORY_URLS = [
  { url: "https://www.nyga.co.il/product-category/%D7%91%D7%A8%D7%96%D7%99%D7%9D/%D7%91%D7%A8%D7%96%D7%99-%D7%9E%D7%98%D7%91%D7%97-%D7%91%D7%9C%D7%A0%D7%A7%D7%95/", brand: "Blanco" },
  { url: "https://www.nyga.co.il/product-category/%D7%91%D7%A8%D7%96%D7%99%D7%9D/%D7%91%D7%A8%D7%96%D7%99-%D7%9E%D7%98%D7%91%D7%97-delta/", brand: "Delta" },
];

function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#8220;|&#8221;|&#8216;|&#8217;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchHtml(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "he-IL,he;q=0.9,en;q=0.6",
    },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} on ${url}`);
  return await resp.text();
}

interface ScrapedItem {
  name: string;
  url: string;
  image: string | null;
  price: number | null;
}

function parseCategoryListing(html: string): ScrapedItem[] {
  const items: ScrapedItem[] = [];
  // Nyga uses <a class="box-product-v2" href="..."> wrapping an h2.product-title
  const productRe = /<a[^>]*class="[^"]*\bbox-product-v2\b[^"]*"[^>]*href="([^"]+)"[\s\S]*?<\/a>/gi;
  for (const m of html.matchAll(productRe)) {
    const block = m[0];
    const url = m[1];
    const nameMatch = block.match(/<h2[^>]*class="[^"]*product-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/i);
    const imgMatch = block.match(/<img[^>]*(?:src|data-src|data-lazy-src)="([^"]+)"/i);
    if (!nameMatch) continue;
    const name = decode(nameMatch[1].replace(/<[^>]+>/g, "")).trim();
    const image = imgMatch ? imgMatch[1] : null;
    if (name && url) items.push({ name, url, image, price: null });
  }
  return items;
}

function findNextPageUrl(html: string): string | null {
  const m = html.match(/<a[^>]+class="[^"]*next page-numbers[^"]*"[^>]+href="([^"]+)"/i);
  return m ? m[1] : null;
}

async function main() {
  const dryRun = process.argv.includes("--dry");

  const faucetsCat = await db.category.findUnique({ where: { slug: "faucets" } });
  if (!faucetsCat) {
    console.error("No 'faucets' category in DB. Aborting.");
    process.exit(1);
  }

  // Optional: ensure blanco + delta sub-categories exist
  const blancoCat = await db.category.upsert({
    where: { slug: "faucets-blanco" },
    update: { parentId: faucetsCat.id, name: "ברזי Blanco" },
    create: { slug: "faucets-blanco", name: "ברזי Blanco", parentId: faucetsCat.id, sortOrder: 1 },
  });
  const deltaCat = await db.category.upsert({
    where: { slug: "faucets-delta" },
    update: { parentId: faucetsCat.id, name: "ברזי Delta" },
    create: { slug: "faucets-delta", name: "ברזי Delta", parentId: faucetsCat.id, sortOrder: 2 },
  });

  const suppl = await db.supplier.findFirst({ where: { name: "Nyga" } });

  let total = 0;
  let created = 0;
  let updated = 0;

  for (const { url: catUrl, brand } of CATEGORY_URLS) {
    const subCatId = brand === "Blanco" ? blancoCat.id : deltaCat.id;
    console.log(`\n=== ${brand} ===`);
    let pageUrl: string | null = catUrl;
    let pageNum = 0;
    const allItems: ScrapedItem[] = [];

    while (pageUrl && pageNum < 10) {
      pageNum++;
      console.log(`Fetching page ${pageNum}: ${pageUrl.slice(0, 90)}...`);
      const html: string = await fetchHtml(pageUrl);
      const items = parseCategoryListing(html);
      console.log(`  found ${items.length} products`);
      allItems.push(...items);
      pageUrl = findNextPageUrl(html);
    }

    console.log(`Total ${brand}: ${allItems.length} products`);
    total += allItems.length;

    if (dryRun) {
      for (const it of allItems.slice(0, 5)) {
        console.log(`  sample: ${it.name} — ₪${it.price ?? "?"} — ${it.url.slice(0, 60)}`);
      }
      continue;
    }

    for (const it of allItems) {
      // Build slug from URL tail
      const rawSlug = (it.url.match(/product\/([^/]+)\/?$/)?.[1] || "");
      let urlSlug = rawSlug;
      try { urlSlug = decodeURIComponent(rawSlug); } catch { urlSlug = rawSlug; }
      const slug = `${urlSlug}-nyga-${brand.toLowerCase()}`.slice(0, 180);

      const existing = await db.product.findUnique({ where: { slug } });
      if (existing) {
        // Update basics
        await db.product.update({
          where: { id: existing.id },
          data: {
            name: it.name,
            categoryId: subCatId,
            basePrice: it.price ?? existing.basePrice,
            supplierUrl: it.url,
            supplierId: suppl?.id,
            status: "ACTIVE",
          },
        });
        updated++;
      } else {
        const newProduct = await db.product.create({
          data: {
            name: it.name,
            slug,
            categoryId: subCatId,
            supplierId: suppl?.id,
            supplierUrl: it.url,
            basePrice: it.price ?? 0,
            status: "ACTIVE",
            sortOrder: 0,
          },
        });
        if (it.image) {
          await db.productImage.create({
            data: {
              productId: newProduct.id,
              url: it.image,
              sourceUrl: it.url,
              altText: it.name,
              sortOrder: 0,
            },
          });
        }
        created++;
      }
    }
  }

  console.log(`\nDone. ${dryRun ? "DRY " : ""}scraped:${total} created:${created} updated:${updated}`);
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
