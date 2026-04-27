import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import * as path from "path";
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

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

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

/** Strip Wordpress resize suffix: LG40-60-2-382x340.jpg → LG40-60-2.jpg */
function fullSize(u: string): string {
  return u.replace(/-\d+x\d+(\.[a-z]+)$/i, "$1");
}

const NOISE_RE = /\b(new_logo|DOMICILE-?\d|shade_\d+|cropped-|placeholder|logo)\b/i;

/**
 * Extract product images from Domicile product page.
 * Strategy: og:image first (the canonical product shot), then any uploads URL
 * whose filename contains the product SKU (e.g. LG40, LGT5).
 */
function parseGalleryImages(html: string, sku: string | null): string[] {
  const imgs = new Set<string>();

  // 1. og:image (always present, points to canonical)
  const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
  if (og) imgs.add(fullSize(og[1]));

  // 2. data-large_image (WooCommerce gallery)
  for (const m of html.matchAll(/data-large_image="([^"]+)"/gi)) imgs.add(fullSize(m[1]));

  // 3. Anchor hrefs to full-size .jpg/png/webp inside any product gallery widget
  for (const m of html.matchAll(/href="(https:\/\/[^"]+\/wp-content\/uploads\/[^"]+\.(?:jpe?g|png|webp))"/gi)) {
    if (!NOISE_RE.test(m[1])) imgs.add(fullSize(m[1]));
  }

  // 4. data-src + src on <img> — filter to product images by SKU match in filename when possible
  const allRe = /(?:src|data-src|data-lazy-src)="(https:\/\/[^"]+\/wp-content\/uploads\/[^"]+\.(?:jpe?g|png|webp))"/gi;
  const allUploads = [...html.matchAll(allRe)].map((m) => m[1]);

  if (sku) {
    const skuLow = sku.toLowerCase();
    for (const u of allUploads) {
      const fname = u.split("/").pop()?.toLowerCase() ?? "";
      if (fname.includes(skuLow) && !NOISE_RE.test(u)) imgs.add(fullSize(u));
    }
  }

  // If still empty, fall back to first 3 non-noise uploads
  if (imgs.size === 0) {
    for (const u of allUploads) {
      if (!NOISE_RE.test(u)) imgs.add(fullSize(u));
      if (imgs.size >= 3) break;
    }
  }

  return [...imgs].filter((u) => /^https?:\/\//.test(u));
}

async function downloadImage(url: string, dest: string): Promise<number> {
  const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

function slugFromUrl(u: string): string {
  const m = u.match(/\/product\/([^/?]+)/);
  if (!m) return "img";
  try {
    return decodeURIComponent(m[1]).slice(0, 80);
  } catch {
    return m[1].slice(0, 80);
  }
}

async function main() {
  const legsCat = await db.category.findUnique({ where: { slug: "legs" } });
  if (!legsCat) {
    console.error("legs category missing");
    process.exit(1);
  }
  const products = await db.product.findMany({
    where: { categoryId: legsCat.id, supplierUrl: { not: null } },
    select: { id: true, name: true, supplierUrl: true, supplierSku: true, _count: { select: { images: true } } },
  });
  console.log(`Found ${products.length} legs with URLs`);

  const outRoot = path.join(process.cwd(), "public", "images", "domicile", "legs");
  mkdirSync(outRoot, { recursive: true });

  let processed = 0;
  let scraped = 0;
  let imgsAdded = 0;

  for (const p of products) {
    if (!p.supplierUrl) continue;
    if (p._count.images > 0) {
      console.log(`[skip] ${p.name} already has images`);
      processed++;
      continue;
    }

    const sku = (p.supplierSku || slugFromUrl(p.supplierUrl)).toLowerCase().replace(/[^a-z0-9-]/g, "-");
    process.stdout.write(`[${++processed}/${products.length}] ${p.name} (${sku})...\n`);

    try {
      const html = await fetchHtml(p.supplierUrl);
      const gallery = parseGalleryImages(html, p.supplierSku || null);
      console.log(`  found ${gallery.length} images`);

      if (gallery.length === 0) continue;
      scraped++;

      // Download up to 5 images per product
      const productDir = path.join(outRoot, sku);
      mkdirSync(productDir, { recursive: true });

      let sortOrder = 0;
      for (const imgUrl of gallery.slice(0, 5)) {
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
        // Save to DB — relative path
        const dbPath = `/images/domicile/legs/${sku}/${fname}`;
        await db.productImage.create({
          data: {
            productId: p.id,
            url: dbPath,
            sourceUrl: imgUrl,
            altText: p.name,
            sortOrder,
          },
        });
        imgsAdded++;
        sortOrder++;
      }
    } catch (e) {
      console.log(`  ✗ error: ${(e as Error).message}`);
    }

    // Polite delay
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\nDone. Processed ${processed}, scraped ${scraped}, added ${imgsAdded} images`);
  await db.$disconnect();
}
main().catch(console.error);
