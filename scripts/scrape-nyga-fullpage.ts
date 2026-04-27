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

function fullSize(u: string): string {
  return u.replace(/-\d+x\d+(\.[a-z]+)$/i, "$1");
}

const NOISE_RE = /\b(logo|placeholder|pixel|spacer|nyga[\s_-]?logo|cropped-)\b/i;

/** Parse Nyga product images. Primary = og:image (1000x1000 high-res). */
function parseNygaGallery(html: string): string[] {
  const imgs = new Set<string>();

  // 1. og:image (primary)
  const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
  if (og && /\.(jpe?g|png|webp)$/i.test(og[1])) imgs.add(fullSize(og[1]));

  // 2. data-large_image (if WC gallery exposes it)
  for (const m of html.matchAll(/data-large_image="([^"]+)"/gi)) imgs.add(fullSize(m[1]));

  // 3. Anchor hrefs to full-size in product gallery
  for (const m of html.matchAll(/<a[^>]+href="(https:\/\/www\.nyga\.co\.il\/wp-content\/uploads\/[^"]+\.(?:jpe?g|png|webp))"/gi)) {
    if (!NOISE_RE.test(m[1])) imgs.add(fullSize(m[1]));
  }

  // 4. attachment-shop_single src (WC theme)
  for (const m of html.matchAll(/<img[^>]+class="[^"]*attachment-shop_single[^"]*"[^>]+(?:src|data-src)="([^"]+)"/gi)) {
    imgs.add(fullSize(m[1]));
  }

  // 5. wp-post-image
  for (const m of html.matchAll(/<img[^>]+class="[^"]*wp-post-image[^"]*"[^>]+(?:src|data-src|data-lazy-src)="([^"]+)"/gi)) {
    imgs.add(fullSize(m[1]));
  }

  return [...imgs]
    .filter((u) => /^https?:\/\//.test(u))
    .filter((u) => !NOISE_RE.test(u));
}

async function downloadImage(url: string, dest: string): Promise<number> {
  const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  writeFileSync(dest, buf);
  return buf.length;
}

/** Stable folder name = product id (cuid). Guarantees no collision with non-Latin slugs. */
function folderForProduct(productId: string): string {
  return productId;
}

async function main() {
  const faucetCats = await db.category.findMany({
    where: { slug: { in: ["faucets-blanco", "faucets-delta"] } },
    select: { id: true, slug: true },
  });
  const ids = faucetCats.map((c) => c.id);

  const products = await db.product.findMany({
    where: { categoryId: { in: ids }, supplierUrl: { not: null } },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  console.log(`Found ${products.length} faucets`);

  const outRoot = path.join(process.cwd(), "public", "images", "nyga", "faucets");
  mkdirSync(outRoot, { recursive: true });

  let processed = 0;
  let scraped = 0;
  let imgsAdded = 0;

  for (const p of products) {
    if (!p.supplierUrl) continue;
    process.stdout.write(`[${++processed}/${products.length}] ${p.name.slice(0, 40)}...\n`);

    try {
      const html = await fetchHtml(p.supplierUrl);
      const gallery = parseNygaGallery(html);
      console.log(`  found ${gallery.length} full-size images`);

      if (gallery.length === 0) continue;
      scraped++;

      const folder = folderForProduct(p.id);
      const productDir = path.join(outRoot, folder);
      mkdirSync(productDir, { recursive: true });

      // Wipe ALL existing images for this product — folder collisions in earlier
      // run produced shared paths across multiple products. Re-creating from scratch.
      if (p.images.length > 0) {
        await db.productImage.deleteMany({ where: { productId: p.id } });
        console.log(`  removed ${p.images.length} old image records`);
      }

      let sortOrder = 0;
      for (const imgUrl of gallery.slice(0, 6)) {
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
        const dbPath = `/images/nyga/faucets/${folder}/${fname}`;
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

    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\nDone. Processed ${processed}, scraped ${scraped}, added ${imgsAdded} images`);
  await db.$disconnect();
}
main().catch(console.error);
