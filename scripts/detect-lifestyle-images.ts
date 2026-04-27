/**
 * Classifies each ProductImage as "lifestyle" (full-bleed photo with content
 * to the edges) or "cutout" (product on white/transparent background).
 *
 * Heuristic: sample a 1px-thick band around all 4 edges of the image. If the
 * band is >85% near-white, it's a cutout. Otherwise it's lifestyle.
 *
 * Why this matters: ProductCard adds white padding around object-contain
 * images. Cutouts blend perfectly (white-on-white). Lifestyle photos look
 * "framed" by the white margin — Yarin specifically called this out for
 * decorative wine racks (WRS) on 2026-04-27.
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
const WHITE_THRESHOLD = 240; // pixel components ≥240 = "near-white"
const ALPHA_TRANSPARENT = 30; // alpha ≤30 = "transparent"
const NEAR_WHITE_RATIO_FOR_CUTOUT = 0.85; // ≥85% edge pixels white/transparent → cutout

interface Verdict {
  isLifestyle: boolean;
  whiteRatio: number;
  reason: string;
}

async function classify(source: string | Buffer): Promise<Verdict> {
  // Resize to a small bounded size for speed; preserve aspect.
  const img = sharp(source).resize(200, 200, { fit: "inside" });

  // Get raw RGBA buffer
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels; // 4
  const stride = info.width * channels;

  let whiteEdge = 0;
  let totalEdge = 0;

  function isNearWhite(idx: number): boolean {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a <= ALPHA_TRANSPARENT) return true;
    return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
  }

  // Top + bottom rows
  for (let x = 0; x < info.width; x++) {
    if (isNearWhite(x * channels)) whiteEdge++;
    if (isNearWhite((info.height - 1) * stride + x * channels)) whiteEdge++;
    totalEdge += 2;
  }
  // Left + right columns (excluding corners already counted)
  for (let y = 1; y < info.height - 1; y++) {
    if (isNearWhite(y * stride)) whiteEdge++;
    if (isNearWhite(y * stride + (info.width - 1) * channels)) whiteEdge++;
    totalEdge += 2;
  }

  const ratio = whiteEdge / totalEdge;
  const isLifestyle = ratio < NEAR_WHITE_RATIO_FOR_CUTOUT;
  const reason = isLifestyle
    ? `${(ratio * 100).toFixed(1)}% white edges → lifestyle`
    : `${(ratio * 100).toFixed(1)}% white edges → cutout`;

  return { isLifestyle, whiteRatio: ratio, reason };
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}

async function main() {
  const onlyMissing = !process.argv.includes("--all");
  const includeRemote = !process.argv.includes("--local-only");
  const dryRun = process.argv.includes("--dry");

  const where = onlyMissing ? { isLifestyle: false } : {};
  const allImages = await db.productImage.findMany({
    where,
    select: { id: true, url: true, isLifestyle: true },
  });

  const localImages = allImages.filter((i) => i.url.startsWith("/images/"));
  const remoteImages = allImages.filter((i) => i.url.startsWith("http"));

  const queue = includeRemote ? [...localImages, ...remoteImages] : localImages;
  console.log(`Found ${queue.length} images (local=${localImages.length}, remote=${includeRemote ? remoteImages.length : 0})`);

  let analyzed = 0;
  let lifestyle = 0;
  let cutout = 0;
  let errors = 0;

  for (const img of queue) {
    try {
      let source: string | Buffer;
      if (img.url.startsWith("/images/")) {
        source = path.join(PUBLIC_DIR, img.url);
      } else {
        source = await fetchBuffer(img.url);
      }

      const verdict = await classify(source);
      analyzed++;
      if (verdict.isLifestyle) lifestyle++;
      else cutout++;

      if (analyzed % 100 === 0) {
        console.log(`  ${analyzed}/${queue.length} (lifestyle=${lifestyle}, cutout=${cutout})`);
      }

      if (!dryRun && verdict.isLifestyle !== img.isLifestyle) {
        await db.productImage.update({
          where: { id: img.id },
          data: { isLifestyle: verdict.isLifestyle },
        });
      }
    } catch (e) {
      errors++;
      if (errors < 10) console.warn(`  ✗ ${img.url.slice(0, 80)}: ${(e as Error).message.slice(0, 80)}`);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Analyzed: ${analyzed}`);
  console.log(`  Lifestyle (full-bleed): ${lifestyle}`);
  console.log(`  Cutout (white bg): ${cutout}`);
  console.log(`  Errors: ${errors}`);

  await db.$disconnect();
}

main().catch(console.error);
