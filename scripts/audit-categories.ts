import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(__dirname, "..", ".env.local");
const env = fs.readFileSync(envPath, "utf-8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m) process.env[m[1]] = m[2];
}

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

  const all = await db.category.findMany({
    select: { slug: true, name: true, sortOrder: true, _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  console.log("Categories in DB:");
  all.forEach((c) =>
    console.log(`  ${String(c.sortOrder ?? "").padStart(2)} | ${c.slug.padEnd(15)} | ${c.name.padEnd(28)} | products: ${c._count.products}`)
  );
  console.log("Total:", all.length, "categories,", all.reduce((s, c) => s + c._count.products, 0), "products");

  // Audit categories that look broken: legs + faucets
  for (const slug of ["legs", "faucets-blanco", "faucets-delta"]) {
    const products = await db.product.findMany({
      where: { category: { slug } },
      select: { name: true, supplierUrl: true, images: { take: 1, select: { url: true } } },
      take: 50,
    });
    const withUrl = products.filter((p) => p.supplierUrl).length;
    const withImages = products.filter((p) => p.images.length > 0).length;
    const remoteImages = products.filter((p) => p.images[0]?.url.startsWith("http")).length;
    console.log(`\n[${slug}] ${products.length} products | ${withUrl} with URL | ${withImages} with images | ${remoteImages} remote URLs`);
    if (products[0]?.images[0]) {
      console.log(`  sample image url: ${products[0].images[0].url.slice(0, 100)}`);
    }
  }

  await db.$disconnect();
}
main().catch(console.error);
