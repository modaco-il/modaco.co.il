/**
 * Detach the 'legs' category from being a child of 'accessories'.
 * Yarin asked for legs to be its own top-level category — it was previously
 * a subcategory under accessories, so /categories/accessories aggregated
 * the leg products into its listing alongside mirrors/bins/decorative.
 *
 * Read-only by default — pass `--apply` to actually update the DB.
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

const APPLY = process.argv.includes("--apply");

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const legs = await db.category.findUnique({
    where: { slug: "legs" },
    select: { id: true, name: true, parentId: true, sortOrder: true },
  });
  const accessories = await db.category.findUnique({
    where: { slug: "accessories" },
    select: { id: true, name: true },
  });
  console.log(`legs: ${JSON.stringify(legs)}`);
  console.log(`accessories: ${JSON.stringify(accessories)}`);

  if (!legs || !accessories) {
    console.error("required categories missing");
    process.exit(1);
  }
  if (legs.parentId === null) {
    console.log("\nlegs is already top-level. Nothing to do.");
    await db.$disconnect();
    return;
  }
  if (legs.parentId !== accessories.id) {
    console.warn(
      `\nWARNING: legs.parentId (${legs.parentId}) is not accessories.id (${accessories.id}). Will still null it out.`,
    );
  }

  if (!APPLY) {
    console.log("\n[dry-run] Pass --apply to actually update.");
    await db.$disconnect();
    return;
  }

  await db.category.update({
    where: { id: legs.id },
    data: { parentId: null },
  });
  await db.auditLog.create({
    data: {
      actor: "script:migrate-legs",
      action: "category.detached_from_parent",
      entityType: "category",
      entityId: legs.id,
      data: { previousParentId: legs.parentId, slug: "legs" },
    },
  });
  console.log(
    `\nDetached 'legs' from parent. /categories/accessories will no longer aggregate leg products.`,
  );
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
