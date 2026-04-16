import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { readFileSync } from "node:fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function investigateMissingImages() {
  console.log("\n=== Products without images ===");
  const products = await db.product.findMany({
    where: { images: { none: {} }, status: "ACTIVE" },
    include: { category: { select: { slug: true, name: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });
  console.log(`Total: ${products.length}`);
  const byCategory: Record<string, Array<{ slug: string; name: string }>> = {};
  for (const p of products) {
    const key = p.category?.slug || "uncategorized";
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push({ slug: p.slug, name: p.name });
  }
  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(`\n${cat} (${items.length}):`);
    items.slice(0, 5).forEach((p) => console.log(`  ${p.slug.padEnd(40)} ${p.name}`));
    if (items.length > 5) console.log(`  ... and ${items.length - 5} more`);
  }
}

async function investigate404() {
  const failedUrl = "https://flvwtyqlfisznivqvque.supabase.co/storage/v1/object/public/product-images/cmo0goa9o00oaagpfbgi4itra/cmo1a6z0k003y0kpfa30n6p4i.gif";
  console.log("\n=== The one 404 image ===");
  const img = await db.productImage.findFirst({
    where: { url: failedUrl },
    include: { product: { include: { category: true } } },
  });
  if (img) {
    console.log(`Product: ${img.product?.name}`);
    console.log(`Category: ${img.product?.category?.slug}`);
    console.log(`Image ID: ${img.id}`);
    console.log(`URL:      ${img.url}`);
  } else {
    console.log("Image row not found!");
  }
}

async function csvFuzzyMatch() {
  console.log("\n=== CSV fuzzy SKU match ===");
  const csv = readFileSync("C:/Users/ozkab/modaco-prices.csv", "utf-8");
  const lines = csv.split(/\r?\n/);

  // Pull SKU-looking tokens from CSV (short alpha+digit)
  const csvSkus = new Set<string>();
  for (const line of lines) {
    for (const col of line.split(",")) {
      const t = col.trim().replace(/^"|"$/g, "");
      if (/^[A-Z]{2,5}\d{1,5}$/i.test(t)) csvSkus.add(t.toUpperCase());
    }
  }
  const csvList = Array.from(csvSkus);
  console.log(`CSV SKU tokens (short form, e.g. RR10): ${csvList.length}`);

  const dbVariants = await db.variant.findMany({ select: { sku: true, product: { select: { name: true, slug: true } } } });
  const dbSkus = dbVariants.filter((v) => v.sku).map((v) => ({ sku: v.sku!, name: v.product.name, slug: v.product.slug }));

  // For each CSV SKU, find DB variants that START WITH it
  let matched = 0;
  let unmatched: string[] = [];
  for (const csvSku of csvList.slice(0, 20)) {
    const hits = dbSkus.filter((d) => d.sku.toUpperCase().startsWith(csvSku) || d.sku.toUpperCase() === csvSku);
    if (hits.length) {
      matched++;
      console.log(`  ${csvSku.padEnd(8)} → ${hits.length} DB variants  (e.g. ${hits[0].sku}, ${hits[0].name})`);
    } else {
      unmatched.push(csvSku);
    }
  }

  // Full check
  let totalMatched = 0;
  for (const csvSku of csvList) {
    if (dbSkus.some((d) => d.sku.toUpperCase().startsWith(csvSku))) totalMatched++;
  }
  console.log(`\nFull scan: ${totalMatched}/${csvList.length} CSV SKUs have matching DB variants (prefix match)`);
}

async function categoryCoverage() {
  console.log("\n=== /categories/{slug} routing map ===");
  const navSlugs = ["handles", "hinges", "slides", "lift-systems", "bath", "accessories", "aluminum", "carpentry"];
  const dbCats = await db.category.findMany({ select: { slug: true, parentId: true } });
  const dbSlugs = new Set(dbCats.map((c) => c.slug));
  for (const slug of navSlugs) {
    const inDb = dbSlugs.has(slug);
    const isStatic = ["aluminum", "carpentry"].includes(slug);
    console.log(`  ${slug.padEnd(15)} in-db=${inDb}  static-page=${isStatic}`);
  }

  // Orphan category URLs (in DB but not in nav)
  console.log("\n=== Categories in DB but NOT in site nav ===");
  for (const cat of dbCats) {
    if (!navSlugs.includes(cat.slug) && !cat.parentId) {
      const count = await db.product.count({ where: { categoryId: { in: [cat.slug] } } }).catch(() => 0);
      console.log(`  ${cat.slug.padEnd(20)} (parent=${cat.parentId || "ROOT"})`);
    }
  }
}

async function main() {
  await investigateMissingImages();
  await investigate404();
  await csvFuzzyMatch();
  await categoryCoverage();
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
