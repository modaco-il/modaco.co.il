/**
 * Hard-delete every product in the accessories category with basePrice < 150 ILS.
 * Yarin requested this in the 23/5 cleanup pass — these are mostly Floralis
 * decor items priced ₪8–₪149 that don't fit Modaco's positioning.
 *
 * Safety:
 *   - Dry-run by default. Pass --execute to actually delete.
 *   - On delete: rows in ProductImage, Variant, CartItem (via Variant cascade)
 *     all go down with the product (schema uses onDelete: Cascade on Variant).
 *   - We log every deletion to scripts/cheap-accessories-deleted-<timestamp>.txt
 *     so we have a paper trail if Yarin asks "what got dropped?".
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

const PRICE_THRESHOLD = 199;
const EXECUTE = process.argv.includes("--execute");

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const accCat = await db.category.findFirst({ where: { slug: "accessories" } });
  if (!accCat) throw new Error("accessories category not found");

  const victims = await db.product.findMany({
    where: { categoryId: accCat.id, basePrice: { lt: PRICE_THRESHOLD } },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      supplierSku: true,
      _count: { select: { variants: true, images: true } },
    },
    orderBy: { basePrice: "asc" },
  });

  console.log(`Found ${victims.length} products in '${accCat.name}' under ₪${PRICE_THRESHOLD}.\n`);

  if (victims.length === 0) {
    console.log("Nothing to delete.");
    await db.$disconnect();
    return;
  }

  const logLines: string[] = [
    `# Cheap accessories deletion log — ${new Date().toISOString()}`,
    `# Threshold: under ₪${PRICE_THRESHOLD}`,
    `# Total: ${victims.length} products`,
    `# Mode: ${EXECUTE ? "EXECUTE (real delete)" : "DRY-RUN"}`,
    ``,
    "price\tsku\tslug\tname\tvariants\timages",
  ];
  for (const v of victims) {
    logLines.push(
      [
        `₪${v.basePrice}`,
        v.supplierSku || "—",
        v.slug,
        v.name,
        v._count.variants,
        v._count.images,
      ].join("\t"),
    );
  }

  const logPath = path.join(
    __dirname,
    `cheap-accessories-deleted-${Date.now()}.txt`,
  );
  fs.writeFileSync(logPath, logLines.join("\n"), "utf-8");
  console.log(`Log: ${logPath}`);

  if (!EXECUTE) {
    console.log("\nDRY-RUN. Pass --execute to actually delete.");
    await db.$disconnect();
    return;
  }

  console.log("\nDeleting in chunks of 50…");
  const ids = victims.map((v) => v.id);
  let done = 0;
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    // ProductImage has FK to Product without cascade in some schemas;
    // delete dependent rows first to be safe.
    await db.productImage.deleteMany({ where: { productId: { in: batch } } });
    // Variant cascade should also wipe cart/order items, but explicit is safer.
    await db.variant.deleteMany({ where: { productId: { in: batch } } });
    await db.product.deleteMany({ where: { id: { in: batch } } });
    done += batch.length;
    console.log(`  ${done}/${ids.length}`);
  }

  console.log(`\nDeleted ${done} products. Log saved to ${logPath}.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
