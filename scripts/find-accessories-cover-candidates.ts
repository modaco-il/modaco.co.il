/**
 * Pick the prettiest accessory product images to propose as the new cover
 * for the /categories/accessories page. Yarin asked to swap out the shop
 * photo for something curated from our actual inventory.
 *
 * Strategy: Floralis accessories are visually the strongest in our catalog.
 * Pull the top-priced ones with at least one image, group by visual style
 * (planters, vases, decorative books, etc.) so the human picker gets
 * variety not 5 vases of the same color.
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

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const accCat = await db.category.findFirst({ where: { slug: "accessories" } });
  if (!accCat) throw new Error("not found");

  // Top 25 by price (skewed toward the high-end pieces Yarin would showcase),
  // limited to ones with an image
  const candidates = await db.product.findMany({
    where: {
      categoryId: accCat.id,
      status: "ACTIVE",
      images: { some: {} },
      basePrice: { gte: 300 },
    },
    select: {
      id: true,
      name: true,
      basePrice: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { basePrice: "desc" },
    take: 30,
  });

  console.log(`Found ${candidates.length} candidates (₪300+ with image):\n`);
  candidates.forEach((c) => {
    console.log(`₪${String(c.basePrice).padStart(5)} | ${c.name}`);
    console.log(`         ${c.images[0]?.url}`);
  });

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
