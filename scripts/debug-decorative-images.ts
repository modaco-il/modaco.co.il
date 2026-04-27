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

async function main() {
  // Find the WRS / WR90 / WR270 products
  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: "WRS" } },
        { name: { contains: "WR90" } },
        { name: { contains: "WR270" } },
        { name: { contains: "WR100" } },
      ],
    },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });

  console.log(`Found ${products.length} matching products\n`);

  for (const p of products) {
    console.log(`\n=== ${p.name} (${p.category?.name}) ===`);
    for (const img of p.images) {
      console.log(`  url: ${img.url}`);
      console.log(`  isLifestyle: ${img.isLifestyle}`);

      // Re-analyze locally and report ratio
      if (img.url.startsWith("/images/")) {
        const absPath = path.join(PUBLIC_DIR, img.url);
        try {
          const sharpImg = sharp(absPath).resize(200, 200, { fit: "inside" });
          const { data, info } = await sharpImg.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
          const channels = info.channels;
          const stride = info.width * channels;
          let whiteEdge = 0;
          let totalEdge = 0;
          const isWhite = (idx: number) => {
            const r = data[idx]; const g = data[idx + 1]; const b = data[idx + 2]; const a = data[idx + 3];
            if (a <= 30) return true;
            return r >= 240 && g >= 240 && b >= 240;
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
          console.log(`  white-edge ratio: ${(ratio * 100).toFixed(1)}% (${whiteEdge}/${totalEdge})`);
          console.log(`  decision @85%: ${ratio < 0.85 ? "lifestyle" : "cutout"}`);
        } catch (e) {
          console.log(`  err: ${(e as Error).message}`);
        }
      }
    }
  }

  await db.$disconnect();
}
main().catch(console.error);
