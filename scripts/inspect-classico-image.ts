import { readFileSync, writeFileSync } from "fs";
import sharp from "sharp";
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

async function main() {
  const p = await db.product.findFirst({
    where: { name: { contains: "CLBL524" } },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!p || p.images.length === 0) {
    console.log("no product found");
    return;
  }

  for (const img of p.images.slice(0, 2)) {
    console.log(`\n=== ${img.url} ===`);
    console.log(`isLifestyle: ${img.isLifestyle}`);
    const resp = await fetch(img.url);
    const buf = Buffer.from(await resp.arrayBuffer());
    const meta = await sharp(buf).metadata();
    console.log(`Dimensions: ${meta.width}×${meta.height} (${meta.format})`);
    console.log(`Size: ${(buf.length / 1024).toFixed(1)} KB`);

    // Sample edges in detail
    const small = sharp(buf).resize(200, 200, { fit: "inside" });
    const { data, info } = await small.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    const stride = info.width * channels;

    // Check top, bottom, left, right strips separately
    function strip(samples: number[][]): { white: number; total: number; avgColor: string } {
      let w = 0;
      const totals = [0, 0, 0];
      for (const [x, y] of samples) {
        const idx = y * stride + x * channels;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
        if (a <= 30) w++;
        else if (r >= 240 && g >= 240 && b >= 240) w++;
        totals[0] += r; totals[1] += g; totals[2] += b;
      }
      return {
        white: w,
        total: samples.length,
        avgColor: `rgb(${(totals[0] / samples.length).toFixed(0)},${(totals[1] / samples.length).toFixed(0)},${(totals[2] / samples.length).toFixed(0)})`,
      };
    }

    // Top row (y=0 across x), Bottom row, Left col, Right col
    const topRow = Array.from({ length: info.width }, (_, x) => [x, 0]);
    const bottomRow = Array.from({ length: info.width }, (_, x) => [x, info.height - 1]);
    const leftCol = Array.from({ length: info.height }, (_, y) => [0, y]);
    const rightCol = Array.from({ length: info.height }, (_, y) => [info.width - 1, y]);

    console.log(`Top edge:    ${JSON.stringify(strip(topRow))}`);
    console.log(`Bottom edge: ${JSON.stringify(strip(bottomRow))}`);
    console.log(`Left edge:   ${JSON.stringify(strip(leftCol))}`);
    console.log(`Right edge:  ${JSON.stringify(strip(rightCol))}`);

    // Save thumbnail to inspect visually
    const thumb = `/tmp/classico-${p.images.indexOf(img)}.jpg`;
    writeFileSync(thumb, await sharp(buf).resize(400).jpeg().toBuffer());
    console.log(`Saved thumbnail: ${thumb}`);
  }

  await db.$disconnect();
}
main().catch(console.error);
