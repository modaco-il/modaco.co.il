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

async function main() {
  const products = await db.product.findMany({
    where: { name: { contains: "MO600" } },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      crossSellFrom: {
        include: {
          relatedProduct: {
            include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  console.log(`Found ${products.length} MO600 products:\n`);
  for (const p of products) {
    console.log(`\n=== ${p.name} (id ${p.id.slice(0, 12)}...) ===`);
    console.log(`  status: ${p.status}, slug: ${p.slug.slice(0, 60)}`);
    console.log(`  Images (${p.images.length}):`);
    p.images.forEach((img, i) => {
      console.log(`    [${i}] sortOrder=${img.sortOrder} isLifestyle=${img.isLifestyle}`);
      console.log(`        url: ${img.url}`);
    });
    console.log(`  Cross-sells (${p.crossSellFrom.length}):`);
    p.crossSellFrom.forEach((rule, i) => {
      const img = rule.relatedProduct.images[0]?.url ?? "(no image)";
      console.log(`    [${i}] → ${rule.relatedProduct.name.slice(0, 50)}`);
      console.log(`        first image: ${img.slice(0, 100)}`);
    });
  }

  await db.$disconnect();
}
main().catch(console.error);
