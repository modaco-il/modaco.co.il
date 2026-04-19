import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function loadEnv(): void {
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

async function main() {
  const categories = await db.category.findMany({
    select: { id: true, slug: true, name: true, parentId: true, _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
  console.log("=== Categories ===");
  for (const c of categories) {
    console.log(`${c.slug.padEnd(28)} | ${c.name.padEnd(25)} | products: ${c._count.products}`);
  }

  const genericSize = await db.variant.findMany({
    where: { name: { contains: "גודל" } },
    include: { product: { select: { slug: true, name: true, supplierUrl: true, category: { select: { slug: true } } } } },
    take: 500,
  });
  console.log(`\n=== Variants with generic 'גודל' label: ${genericSize.length} ===`);
  const byProduct = new Map<string, { name: string; slug: string; url: string | null; cat: string; variants: string[] }>();
  for (const v of genericSize) {
    const key = v.product.slug;
    if (!byProduct.has(key)) {
      byProduct.set(key, {
        name: v.product.name,
        slug: v.product.slug,
        url: v.product.supplierUrl,
        cat: v.product.category?.slug || "",
        variants: [],
      });
    }
    byProduct.get(key)!.variants.push(v.name);
  }
  console.log(`Unique products affected: ${byProduct.size}`);
  for (const p of Array.from(byProduct.values()).slice(0, 15)) {
    console.log(`- [${p.cat}] ${p.name} (${p.slug}) — ${p.variants.length} variants → ${p.url?.slice(0, 60) || "no url"}`);
  }

  const noVariants = await db.product.count({
    where: {
      status: "ACTIVE",
      category: { slug: "handles" },
      variants: { none: {} },
    },
  });
  const handlesTotal = await db.product.count({
    where: { status: "ACTIVE", category: { slug: "handles" } },
  });
  console.log(`\n=== Handles without any variants: ${noVariants}/${handlesTotal} ===`);
}

main().catch(console.error).finally(async () => { await db.$disconnect(); });
