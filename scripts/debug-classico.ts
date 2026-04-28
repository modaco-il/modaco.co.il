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
    where: {
      OR: [
        { name: { contains: "CLASSICO" } },
        { name: { contains: "CLBL" } },
        { name: { contains: "CLXL" } },
        { name: { contains: "CLASXL" } },
        { name: { contains: "AGF" } },
        { name: { contains: "VSAS" } },
        { name: { contains: "חלוק" } },
      ],
    },
    include: {
      images: { select: { url: true, isLifestyle: true }, take: 1, orderBy: { sortOrder: "asc" } },
      category: { select: { slug: true, name: true } },
    },
  });

  console.log(`Found ${products.length} matching products:\n`);
  for (const p of products) {
    const img = p.images[0];
    console.log(`[${p.category?.slug ?? "?"}] ${p.name}`);
    console.log(`  isLifestyle: ${img?.isLifestyle}`);
    console.log(`  url: ${img?.url?.slice(0, 80) ?? "(no image)"}`);
    console.log();
  }

  // Also count per slug
  const counts = await db.productImage.groupBy({
    by: ["isLifestyle"],
    _count: true,
    where: {
      product: {
        OR: [{ name: { contains: "CLASSICO" } }, { name: { contains: "חלוק" } }],
      },
    },
  });
  console.log("Aggregate isLifestyle for matching:", counts);

  await db.$disconnect();
}
main().catch(console.error);
