import { readFileSync, writeFileSync, mkdirSync } from "fs";
import * as path from "path";

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

/**
 * For each category, a representative Domicile product URL whose first gallery
 * image will become the bento cover. Picked manually from the Sheets catalog
 * for visual variety + strong atmosphere.
 */
const COVERS: Array<{ slug: string; url: string; pickIndex?: number }> = [
  // Validated URLs from CSV (modaco-prices.csv)
  { slug: "handles", url: "https://www.domicile.co.il/product/capsule-%d7%99%d7%93%d7%99%d7%aa-%d7%93%d7%92%d7%9d-6006/" },
  { slug: "hinges", url: "https://www.domicile.co.il/product/%d7%a6%d7%99%d7%a8-%d7%a7%d7%9c%d7%99%d7%a4-esto-%d7%9b%d7%a4%d7%95%d7%a3-105-%d7%a2%d7%9d-%d7%aa%d7%95%d7%a9%d7%91%d7%aa-%d7%95%d7%91%d7%95%d7%9c%d7%9d-%d7%90%d7%99%d7%a0%d7%98%d7%92%d7%a8/" },
  { slug: "slides", url: "https://www.domicile.co.il/product/%d7%9e%d7%a1%d7%99%d7%9c%d7%94-%d7%a1%d7%9e%d7%95%d7%99%d7%94-%d7%a9%d7%9c%d7%99%d7%a4%d7%94-%d7%9e%d7%9c%d7%90%d7%94-%d7%9e%d7%a1%d7%95%d7%a0%d7%9b%d7%a8%d7%a0%d7%95%d7%aa-%d7%a2%d7%9d-%d7%a9%d7%9c/" },
  { slug: "lift-systems", url: "https://www.domicile.co.il/product/%d7%a7%d7%9c%d7%a4%d7%94-%d7%a1%d7%98%d7%98%d7%99%d7%aa-%d7%9e%d7%aa%d7%9b%d7%95%d7%95%d7%a0%d7%a0%d7%aa-%d7%9c%d7%90%d7%a8%d7%95%d7%a0%d7%95%d7%aa-%d7%a2%d7%9c%d7%99%d7%95%d7%a0%d7%99%d7%9d-%d7%93/" },
  { slug: "bath", url: "https://www.domicile.co.il/product/%d7%a7%d7%95%d7%9c%d7%91-%d7%9c%d7%9e%d7%92%d7%91%d7%aa-%d7%a2%d7%9d-%d7%a4%d7%99%d7%9f-%d7%93%d7%92%d7%9d-ro10/" },
  { slug: "mirrors", url: "https://www.domicile.co.il/product/%d7%9e%d7%a8%d7%90%d7%94-%d7%a2%d7%92%d7%95%d7%9c%d7%94-%d7%a2%d7%9d-%d7%9e%d7%a1%d7%92%d7%a8%d7%aa-%d7%9e%d7%a2%d7%a5-%d7%a7%d7%95%d7%98%d7%a8-600-%d7%9e%d7%9e-%d7%93%d7%92%d7%9d-mrw/" },
  { slug: "bins", url: "https://www.domicile.co.il/product/%d7%a4%d7%97-%d7%90%d7%a9%d7%a4%d7%94-%d7%a2%d7%92%d7%95%d7%9c-%d7%9c%d7%9c%d7%90-%d7%9e%d7%9b%d7%a1%d7%94-7l-%d7%93%d7%92%d7%9d-g075/" },
  { slug: "legs", url: "https://www.domicile.co.il/product/%d7%a8%d7%92%d7%9c-%d7%93%d7%9c%d7%a4%d7%a7-%d7%92%d7%99%d7%90%d7%95%d7%9e%d7%98%d7%a8%d7%99%d7%aa-%d7%a2%d7%9d-%d7%9b%d7%99%d7%95%d7%95%d7%a0%d7%95%d7%9f-%d7%93%d7%92%d7%9d-lg101/" },
  { slug: "decorative", url: "https://www.domicile.co.il/product/%d7%9e%d7%aa%d7%9c%d7%94-%d7%9c%d7%91%d7%a7%d7%91%d7%95%d7%a7%d7%99-%d7%99%d7%99%d7%9f-%d7%aa%d7%9c%d7%99%d7%99%d7%94-%d7%9c%d7%90%d7%95%d7%a8%d7%9a-%d7%93%d7%92%d7%9d-wr100/" },
  // Faucets — pick a Blanco product page (full-size product image, not category listing)
  { slug: "faucets", url: "https://www.nyga.co.il/product/%D7%91%D7%A8%D7%96-%D7%9E%D7%98%D7%91%D7%97-%D7%91%D7%9C%D7%A0%D7%A7%D7%95-mida/" },
  // Cladding — Domicile category page (has hero banner)
  { slug: "cladding", url: "https://www.domicile.co.il/product-category/%d7%9c%d7%95%d7%97-%d7%92%d7%9e%d7%99%d7%a9-%d7%9c%d7%97%d7%99%d7%a4%d7%95%d7%99/" },
];

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

/**
 * Pull the largest <img> from the page. WooCommerce galleries typically use
 * data-large_image / src on .wp-post-image / .woocommerce-product-gallery__image.
 */
function pickBestImage(html: string, pickIndex = 0): string | null {
  // 1. Try gallery hero — data-large_image
  const galleryRe = /data-large_image="([^"]+)"/gi;
  const galleryMatches: string[] = [];
  for (const m of html.matchAll(galleryRe)) galleryMatches.push(m[1]);
  if (galleryMatches[pickIndex]) return galleryMatches[pickIndex];
  if (galleryMatches[0]) return galleryMatches[0];

  // 2. WooCommerce product gallery — src on figure links
  const figRe = /<a[^>]+class="[^"]*woocommerce-product-gallery__image[^"]*"[^>]+href="([^"]+\.(?:jpg|jpeg|png|webp))"/gi;
  for (const m of html.matchAll(figRe)) {
    return m[1];
  }

  // 3. og:image meta
  const ogRe = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i;
  const og = html.match(ogRe);
  if (og) return og[1];

  // 4. First wp-post-image
  const postRe = /<img[^>]+class="[^"]*wp-post-image[^"]*"[^>]+(?:src|data-src|data-lazy-src)="([^"]+)"/i;
  const post = html.match(postRe);
  if (post) return post[1];

  return null;
}

async function downloadImage(url: string, dest: string): Promise<void> {
  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!resp.ok) throw new Error(`Image fetch ${resp.status} on ${url}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  writeFileSync(dest, buf);
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "images", "domicile", "categories");
  mkdirSync(outDir, { recursive: true });

  for (const { slug, url, pickIndex } of COVERS) {
    process.stdout.write(`[${slug}] fetching ${url.slice(0, 70)}...\n`);
    try {
      const html = await fetchHtml(url);
      const imgUrl = pickBestImage(html, pickIndex);
      if (!imgUrl) {
        console.log(`  ✗ no image found`);
        continue;
      }
      // Strip ?query and resize tokens like -300x300
      const cleanUrl = imgUrl.replace(/\?.*/, "");
      const ext = cleanUrl.match(/\.(jpe?g|png|webp)/i)?.[1] ?? "jpg";
      const dest = path.join(outDir, `${slug}.${ext.toLowerCase()}`);
      await downloadImage(cleanUrl, dest);
      console.log(`  ✓ saved ${path.basename(dest)} (${imgUrl.slice(0, 70)}...)`);
    } catch (e) {
      console.log(`  ✗ error: ${(e as Error).message}`);
    }
    // Be polite
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\nDone. Files in ${outDir}`);
}

main().catch(console.error);
