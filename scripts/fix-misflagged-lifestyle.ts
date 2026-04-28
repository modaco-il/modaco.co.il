/**
 * Fix images that were force-flipped to lifestyle by category override
 * (decorative/accessories/mirrors) but actually have white margins baked
 * into the source — those should be cutout so the card padding masks the
 * white border.
 *
 * Strategy: for every image currently isLifestyle=true, fetch + sample
 * its 4 edges. If >=85% of edge pixels are near-white, flip back to
 * cutout. Reports each flip so we can verify.
 */
import { readFileSync } from "fs";
import * as path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import sharp from "sharp";

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
const PUBLIC_DIR = path.join(process.cwd(), "public");

const WHITE_THRESHOLD = 240;
const ALPHA_TRANSPARENT = 30;
const CUTOUT_RATIO = 0.85;

async function fetchBuffer(url: string): Promise<Buffer> {
  const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}

async function isCutout(source: string | Buffer): Promise<{ isCutout: boolean; ratio: number }> {
  const img = sharp(source).resize(200, 200, { fit: "inside" });
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const stride = info.width * channels;

  let whiteEdge = 0;
  let totalEdge = 0;
  const isWhite = (idx: number) => {
    const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
    if (a <= ALPHA_TRANSPARENT) return true;
    return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
  };
  for (let x = 0; x < info.width; x++) {
    if (isWhite(x * channels)) whiteEdge++;
    if (isWhite((info.height - 1) * stride + x * channels)) whiteEdge++;
    totalEdge += 2;
  }
  for (let y = 1; y < info.height - 1; y++) {
    if (isWhite(y * stride)) whiteEdge++;
    if (isWhite(y * stride + (info.width - 1) * channels)) whiteEdge++;
    totalEdge += 2;
  }

  const ratio = whiteEdge / totalEdge;
  return { isCutout: ratio >= CUTOUT_RATIO, ratio };
}

async function main() {
  const imgs = await db.productImage.findMany({
    where: { isLifestyle: true },
    select: { id: true, url: true, productId: true, product: { select: { name: true } } },
    orderBy: { id: "asc" },
  });
  console.log(`Examining ${imgs.length} currently-lifestyle images...`);

  let processed = 0;
  let flipped = 0;
  let errors = 0;

  for (const img of imgs) {
    try {
      const source: string | Buffer = img.url.startsWith("/images/")
        ? path.join(PUBLIC_DIR, img.url)
        : await fetchBuffer(img.url);
      const verdict = await isCutout(source);
      processed++;

      if (verdict.isCutout) {
        await db.productImage.update({
          where: { id: img.id },
          data: { isLifestyle: false },
        });
        flipped++;
        if (flipped <= 20) {
          console.log(`  [${flipped}] ${(verdict.ratio * 100).toFixed(0)}% white edges → cutout: ${img.product?.name?.slice(0, 60)}`);
        }
      }

      if (processed % 100 === 0) {
        console.log(`  progress: ${processed}/${imgs.length}, flipped ${flipped}`);
      }
    } catch (e) {
      errors++;
      if (errors < 5) console.warn(`  ✗ ${img.url.slice(0, 80)}: ${(e as Error).message.slice(0, 60)}`);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Flipped to cutout: ${flipped}`);
  console.log(`  Errors: ${errors}`);

  await db.$disconnect();
}
main().catch(console.error);
