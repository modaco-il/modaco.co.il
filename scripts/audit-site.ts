/**
 * Pre-handoff audit: image integrity + DB stats + CSV cross-reference.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { readFileSync, existsSync } from "node:fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const HEAD_CONCURRENCY = 20;
const SAMPLE_SIZE = 100; // sample, not all 2,475 (faster)

async function headOk(url: string): Promise<{ ok: boolean; status: number }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function auditImageIntegrity() {
  console.log("\n=== 1. IMAGE INTEGRITY ===");
  const allImages = await db.productImage.findMany({ select: { id: true, url: true } });
  console.log(`Total image rows: ${allImages.length}`);

  // Sample random 100
  const sample = [...allImages].sort(() => Math.random() - 0.5).slice(0, SAMPLE_SIZE);
  console.log(`Checking ${sample.length} random samples...`);

  const results = { ok: 0, failed: 0, failures: [] as Array<{ url: string; status: number }> };
  const queue = [...sample];
  const workers = Array.from({ length: HEAD_CONCURRENCY }, async () => {
    while (queue.length) {
      const img = queue.shift();
      if (!img) break;
      const { ok, status } = await headOk(img.url);
      if (ok) results.ok++;
      else {
        results.failed++;
        results.failures.push({ url: img.url, status });
      }
    }
  });
  await Promise.all(workers);

  console.log(`OK: ${results.ok}/${sample.length}`);
  if (results.failures.length) {
    console.log(`Failures:`);
    results.failures.slice(0, 10).forEach((f) => console.log(`  [${f.status}] ${f.url}`));
  }
}

async function auditDbStats() {
  console.log("\n=== 2. DB STATS BY CATEGORY ===");
  const cats = await db.category.findMany({
    where: { parentId: null },
    include: {
      children: { select: { id: true, slug: true, name: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  for (const cat of cats) {
    const catIds = [cat.id, ...cat.children.map((c) => c.id)];
    const [total, active, noImage, zeroPrice, noVariants] = await Promise.all([
      db.product.count({ where: { categoryId: { in: catIds } } }),
      db.product.count({ where: { categoryId: { in: catIds }, status: "ACTIVE" } }),
      db.product.count({
        where: { categoryId: { in: catIds }, images: { none: {} } },
      }),
      db.product.count({ where: { categoryId: { in: catIds }, basePrice: 0 } }),
      db.product.count({
        where: { categoryId: { in: catIds }, variants: { none: {} } },
      }),
    ]);
    console.log(
      `${cat.slug.padEnd(18)} total=${total.toString().padStart(4)}  active=${active.toString().padStart(4)}  no-image=${noImage.toString().padStart(3)}  price=0=${zeroPrice.toString().padStart(3)}  no-variants=${noVariants.toString().padStart(3)}`
    );
  }

  // Site-wide
  const [totalProducts, totalActive, totalNoImage, totalZeroPrice] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.product.count({ where: { images: { none: {} } } }),
    db.product.count({ where: { basePrice: 0 } }),
  ]);
  console.log(
    `\nSITE-WIDE: total=${totalProducts} active=${totalActive} no-image=${totalNoImage} price=0=${totalZeroPrice}`
  );
}

async function auditCsvCrossReference() {
  console.log("\n=== 3. CSV CROSS-REFERENCE ===");
  const csvPath = "C:/Users/ozkab/modaco-prices.csv";
  if (!existsSync(csvPath)) {
    console.log(`CSV not found at ${csvPath} — skipping`);
    return;
  }
  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  console.log(`CSV rows: ${lines.length}`);

  // Extract SKUs from CSV — look for patterns like RR10, SH33, HK2500, 462600, etc.
  const csvSkus = new Set<string>();
  for (const line of lines) {
    const cols = line.split(",");
    for (const col of cols) {
      const trimmed = col.trim().replace(/^"|"$/g, "");
      if (/^[A-Z0-9.-]{3,25}$/i.test(trimmed) && /[A-Z]/i.test(trimmed) && /\d/.test(trimmed)) {
        csvSkus.add(trimmed);
      }
    }
  }
  console.log(`Unique SKU-like tokens in CSV: ${csvSkus.size}`);

  const dbVariants = await db.variant.findMany({ select: { sku: true, productId: true } });
  const dbSkus = new Set(dbVariants.filter((v) => v.sku).map((v) => v.sku!));
  console.log(`Unique SKUs in DB: ${dbSkus.size}`);

  // CSV has but DB missing
  const missingInDb: string[] = [];
  for (const csvSku of csvSkus) {
    if (!dbSkus.has(csvSku)) missingInDb.push(csvSku);
  }
  console.log(`\nSKUs in CSV but NOT in DB (first 30): ${missingInDb.length} total`);
  missingInDb.slice(0, 30).forEach((s) => console.log(`  ${s}`));

  // DB has but CSV missing (sanity)
  const missingInCsv: string[] = [];
  for (const dbSku of dbSkus) {
    if (!csvSkus.has(dbSku)) missingInCsv.push(dbSku);
  }
  console.log(`\nSKUs in DB but NOT in CSV (first 10, sanity): ${missingInCsv.length} total`);
  missingInCsv.slice(0, 10).forEach((s) => console.log(`  ${s}`));
}

async function auditOrphans() {
  console.log("\n=== 4. ORPHAN CHECKS ===");
  // Use raw SQL since productId/categoryId may be non-nullable in schema but null in legacy rows
  const orphanImages = await db.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM product_images WHERE "productId" IS NULL
  `;
  const productsWithoutCategory = await db.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM products WHERE "categoryId" IS NULL
  `;
  console.log(`Orphan images (no product): ${orphanImages[0].count}`);
  console.log(`Products without category:  ${productsWithoutCategory[0].count}`);
}

async function main() {
  await auditImageIntegrity();
  await auditDbStats();
  await auditCsvCrossReference();
  await auditOrphans();
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
