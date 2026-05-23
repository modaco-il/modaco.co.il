/**
 * Triage the "אקססוריז" category per Yarin's 23/5 audit request:
 *   1. List every product, its basePrice, status, supplier URL, supplier SKU.
 *   2. Flag everything under ₪150 for hard-delete.
 *   3. Classify by the supplier URL (Domicile / Nyga / Floralis) — the URL
 *      path typically encodes the supplier's own category, which is a much
 *      more reliable signal than what we initially imported as.
 *
 * Read-only. Outputs a sorted/grouped report to stdout — no DB writes.
 */
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

interface Row {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  status: string;
  supplierUrl: string | null;
  supplierSku: string | null;
  imageCount: number;
}

// Heuristic: which supplier category does this URL pattern look like?
function classifyFromUrl(url: string | null, name: string): string {
  if (!url) return "no-url";
  const u = url.toLowerCase();
  const n = name.toLowerCase();

  // mirrors
  if (u.includes("mirror") || u.includes("/mirrors") || n.includes("מראה") || n.includes("מראות"))
    return "mirrors";
  // trash bins
  if (
    u.includes("bin") ||
    u.includes("trash") ||
    u.includes("waste") ||
    u.includes("/bins") ||
    n.includes("פח") ||
    n.includes("פחים") ||
    n.includes("מערכת מיון")
  )
    return "bins";
  // legs
  if (u.includes("/legs") || u.includes("leg-") || n.includes("רגל") || n.includes("רגלי"))
    return "legs";
  // hooks / hangers (still accessories)
  if (u.includes("hook") || n.includes("וו") || n.includes("ווים") || n.includes("מתלה"))
    return "hooks (accessory)";
  // soap dispenser / dispensers
  if (u.includes("dispenser") || n.includes("מתקן") || n.includes("דיספנסר"))
    return "dispensers (accessory)";
  // organizers / dividers
  if (u.includes("organi") || u.includes("divider") || n.includes("מארגן") || n.includes("חוצץ"))
    return "organizers (accessory)";
  // handles (shouldn't be here)
  if (u.includes("handle") || n.includes("ידית"))
    return "handles";
  // shelves
  if (u.includes("shelf") || u.includes("shelv") || n.includes("מדף"))
    return "shelves";
  return "uncategorized";
}

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const accCat = await db.category.findFirst({
    where: { OR: [{ slug: "accessories" }, { name: { contains: "אקססו" } }] },
    select: { id: true, slug: true, name: true },
  });
  if (!accCat) {
    console.error("Couldn't find accessories category. Found these:");
    const all = await db.category.findMany({ select: { slug: true, name: true } });
    console.error(all);
    process.exit(1);
  }
  console.log(`\nCategory: ${accCat.name} (slug=${accCat.slug}, id=${accCat.id})\n`);

  const products: Row[] = await db.product
    .findMany({
      where: { categoryId: accCat.id },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        status: true,
        supplierUrl: true,
        supplierSku: true,
        _count: { select: { images: true } },
      },
      orderBy: [{ basePrice: "asc" }, { name: "asc" }],
    })
    .then((rs) =>
      rs.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        basePrice: r.basePrice,
        status: r.status,
        supplierUrl: r.supplierUrl,
        supplierSku: r.supplierSku,
        imageCount: r._count.images,
      })),
    );

  console.log(`Total products in accessories: ${products.length}\n`);

  // ── 1. Under ₪150 → flagged for hard-delete
  const cheap = products.filter((p) => p.basePrice < 150);
  console.log("=".repeat(72));
  console.log(`UNDER ₪150 → flagged for HARD DELETE (${cheap.length} products)`);
  console.log("=".repeat(72));
  cheap.forEach((p) => {
    console.log(
      `  ₪${String(p.basePrice).padStart(6)} | ${p.status.padEnd(7)} | ${p.supplierSku?.padEnd(14) || "—".padEnd(14)} | ${p.name}`,
    );
  });

  // ── 2. Misclassification by URL
  const grouped: Record<string, Row[]> = {};
  for (const p of products) {
    if (cheap.find((c) => c.id === p.id)) continue; // already in delete pile
    const bucket = classifyFromUrl(p.supplierUrl, p.name);
    (grouped[bucket] = grouped[bucket] || []).push(p);
  }

  console.log("\n" + "=".repeat(72));
  console.log("REMAINING (≥ ₪150) — grouped by URL/name heuristic");
  console.log("=".repeat(72));
  const orderHint = [
    "mirrors",
    "bins",
    "legs",
    "handles",
    "shelves",
    "hooks (accessory)",
    "dispensers (accessory)",
    "organizers (accessory)",
    "uncategorized",
    "no-url",
  ];
  for (const bucket of orderHint) {
    const arr = grouped[bucket];
    if (!arr || arr.length === 0) continue;
    console.log(`\n── ${bucket.toUpperCase()} (${arr.length}) ──`);
    arr.forEach((p) => {
      const u = p.supplierUrl ? p.supplierUrl.slice(0, 70) : "—";
      console.log(`  ₪${String(p.basePrice).padStart(5)} | ${p.name}`);
      console.log(`      ${u}`);
    });
  }

  console.log("\n" + "=".repeat(72));
  console.log("Summary:");
  console.log("=".repeat(72));
  console.log(`  to delete (under ₪150):     ${cheap.length}`);
  for (const bucket of orderHint) {
    const arr = grouped[bucket];
    if (!arr || arr.length === 0) continue;
    console.log(`  ${bucket.padEnd(28)} ${arr.length}`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
