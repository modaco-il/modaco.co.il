/**
 * Imports the FLEX CNC flexible cladding boards from Domicile (לוח גמיש לחיפוי).
 * 22 products, 1200×2700mm, thickness 1-5.5mm.
 *
 * Products imported with basePrice=0; Yarin will fill in prices via the admin
 * panel or a separate price-import step.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import * as path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const env = readFileSync(".env.local", "utf8");
for (const l of env.split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) {
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const CATEGORY_URL = "https://www.domicile.co.il/product-category/%d7%9c%d7%95%d7%97-%d7%92%d7%9e%d7%99%d7%a9-%d7%9c%d7%97%d7%99%d7%a4%d7%95%d7%99/";

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

interface Listing {
  name: string;
  url: string;
  image: string | null;
}

/** Parse Domicile category page — Elementor markup. Just collect unique product URLs;
 *  full details will be derived from each product page. */
function parseListing(html: string): Listing[] {
  const urls = new Set<string>();
  for (const m of html.matchAll(/href="(https:\/\/www\.domicile\.co\.il\/product\/[^"]+)"/gi)) {
    urls.add(m[1]);
  }
  return [...urls].map((url) => ({ name: "", url, image: null }));
}

function fullSize(u: string): string {
  return u.replace(/-\d+x\d+(\.[a-z]+)$/i, "$1");
}

const NOISE_RE = /\b(new_logo|DOMICILE-?\d|shade_\d+|cropped-|placeholder|logo)\b/i;

function parseProductImages(html: string, sku: string): string[] {
  const imgs = new Set<string>();
  const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
  if (og) imgs.add(fullSize(og[1]));

  for (const m of html.matchAll(/data-large_image="([^"]+)"/gi)) imgs.add(fullSize(m[1]));

  for (const m of html.matchAll(/href="(https:\/\/[^"]+\/wp-content\/uploads\/[^"]+\.(?:jpe?g|png|webp))"/gi)) {
    if (!NOISE_RE.test(m[1])) imgs.add(fullSize(m[1]));
  }

  // SKU-matching uploads
  const skuLow = sku.toLowerCase();
  for (const m of html.matchAll(/(?:src|data-src|data-lazy-src)="(https:\/\/[^"]+\/wp-content\/uploads\/[^"]+\.(?:jpe?g|png|webp))"/gi)) {
    const fname = m[1].split("/").pop()?.toLowerCase() ?? "";
    if (fname.includes(skuLow) && !NOISE_RE.test(m[1])) imgs.add(fullSize(m[1]));
  }

  return [...imgs].filter((u) => /^https?:\/\//.test(u));
}

function parseDescription(html: string): string {
  const m = html.match(/<div[^>]+class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (m) return m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
  const desc = html.match(/<div[^>]+id="tab-description"[^>]*>([\s\S]*?)<\/div>/i);
  if (desc) return desc[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
  return "";
}

function parseModelFromName(name: string): string | null {
  // Domicile cladding model numbers like F608, F901175, F1106
  const m = name.match(/\bF\d{3,7}\b/i);
  return m ? m[0].toUpperCase() : null;
}

async function downloadImage(url: string, dest: string): Promise<number> {
  const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  const cladCat = await db.category.upsert({
    where: { slug: "cladding" },
    update: { name: "לוח גמיש לחיפוי" },
    create: {
      slug: "cladding",
      name: "לוח גמיש לחיפוי",
      sortOrder: 11,
    },
  });
  console.log(`Cladding category: ${cladCat.id}`);

  let domicileSupplier = await db.supplier.findFirst({ where: { name: "Domicile" } });
  if (!domicileSupplier) {
    domicileSupplier = await db.supplier.create({ data: { name: "Domicile", website: "https://www.domicile.co.il" } });
  }

  console.log(`Fetching listing: ${CATEGORY_URL.slice(0, 70)}...`);
  const listingHtml = await fetchHtml(CATEGORY_URL);
  const listings = parseListing(listingHtml);
  console.log(`Parsed ${listings.length} products from listing\n`);

  if (listings.length === 0) {
    console.error("No products parsed — markup may have changed.");
    return;
  }

  const outRoot = path.join(process.cwd(), "public", "images", "domicile", "cladding");
  mkdirSync(outRoot, { recursive: true });

  let created = 0;
  let updated = 0;

  for (let i = 0; i < listings.length; i++) {
    const item = listings[i];

    try {
      const productHtml = await fetchHtml(item.url);

      // Extract name from <h1 class="product_title"> or og:title
      let name = item.name;
      if (!name) {
        const titleMatch = productHtml.match(/<h1[^>]+class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
                        || productHtml.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
        if (titleMatch) name = titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      }

      const model = parseModelFromName(name) || parseModelFromName(decodeURIComponent(item.url)) || `CLAD-${i + 1}`;
      process.stdout.write(`[${i + 1}/${listings.length}] ${name || item.url.slice(40, 80)} (${model})...\n`);

      if (!name) {
        // Build name from URL path tail
        try {
          const decoded = decodeURIComponent(item.url.match(/\/product\/([^/]+)/)?.[1] ?? "");
          name = decoded.replace(/-/g, " ").replace(/flex cnc/i, "FLEX CNC").trim();
        } catch {
          name = `FLEX CNC ${model}`;
        }
      }

      const images = parseProductImages(productHtml, model);
      const description = parseDescription(productHtml);

      console.log(`  ${images.length} images found`);

      // Build slug from URL
      const urlSlug = item.url.match(/\/product\/([^/?]+)/)?.[1] ?? "";
      const slug = `cladding-${model.toLowerCase()}-${i + 1}`.slice(0, 180);

      const existing = await db.product.findUnique({ where: { slug } });
      let product;
      if (existing) {
        product = await db.product.update({
          where: { id: existing.id },
          data: {
            name,
            categoryId: cladCat.id,
            supplierId: domicileSupplier.id,
            supplierUrl: item.url,
            supplierSku: model,
            description: description || existing.description,
            status: "ACTIVE",
          },
        });
        updated++;
      } else {
        product = await db.product.create({
          data: {
            name,
            slug,
            categoryId: cladCat.id,
            supplierId: domicileSupplier.id,
            supplierUrl: item.url,
            supplierSku: model,
            description,
            basePrice: 0, // Yarin will set
            status: "ACTIVE",
            sortOrder: i,
          },
        });
        // Default variant
        await db.variant.create({
          data: {
            productId: product.id,
            name: "1200×2700 מ\"מ",
            sku: `${model}-DEFAULT`.slice(0, 50),
            isDefault: true,
            stockStatus: "AT_SUPPLIER",
          },
        });
        created++;
      }

      // Download images
      const productDir = path.join(outRoot, product.id);
      mkdirSync(productDir, { recursive: true });

      // Wipe existing image records first
      await db.productImage.deleteMany({ where: { productId: product.id } });

      let sortOrder = 0;
      for (const imgUrl of images.slice(0, 5)) {
        const cleanUrl = imgUrl.replace(/\?.*/, "");
        const ext = cleanUrl.match(/\.(jpe?g|png|webp)/i)?.[1]?.toLowerCase() ?? "jpg";
        const fname = `${sortOrder + 1}.${ext}`;
        const dest = path.join(productDir, fname);
        if (!existsSync(dest)) {
          try {
            const size = await downloadImage(cleanUrl, dest);
            console.log(`    ✓ ${fname} (${(size / 1024).toFixed(1)} KB)`);
          } catch (e) {
            console.log(`    ✗ ${fname}: ${(e as Error).message}`);
            continue;
          }
        }
        await db.productImage.create({
          data: {
            productId: product.id,
            url: `/images/domicile/cladding/${product.id}/${fname}`,
            sourceUrl: imgUrl,
            altText: name,
            sortOrder,
          },
        });
        sortOrder++;
      }
    } catch (e) {
      console.log(`  ✗ error: ${(e as Error).message}`);
    }

    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\nDone. Created ${created}, updated ${updated}`);
  await db.$disconnect();
}

main().catch(console.error);
