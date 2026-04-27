/**
 * Quick override: products in categories where lifestyle imagery is the norm
 * get isLifestyle=true on ALL their images, without per-image pixel analysis.
 *
 * This catches cases where products are stored on Supabase remote URLs and
 * the per-image classifier hasn't gotten to them yet (or where the heuristic
 * misclassifies textured/light-bg lifestyle photos as cutouts).
 */
import { readFileSync } from "fs";
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

// Categories where the imagery is overwhelmingly atmospheric/lifestyle.
const LIFESTYLE_CATEGORIES = ["decorative", "mirrors", "cladding", "accessories"];

async function main() {
  const cats = await db.category.findMany({
    where: { slug: { in: LIFESTYLE_CATEGORIES } },
    select: { id: true, slug: true, name: true },
  });

  for (const cat of cats) {
    const result = await db.productImage.updateMany({
      where: {
        product: { categoryId: cat.id },
        isLifestyle: false,
      },
      data: { isLifestyle: true },
    });
    console.log(`${cat.slug.padEnd(15)} ${cat.name.padEnd(20)} → flipped ${result.count} images to lifestyle`);
  }

  await db.$disconnect();
}
main().catch(console.error);
