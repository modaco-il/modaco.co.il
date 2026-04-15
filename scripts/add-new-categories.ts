import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

  const newCats = [
    { slug: "mirrors", name: "מראות", sortOrder: 6 },
    { slug: "bins", name: "פחים", sortOrder: 7 },
    { slug: "legs", name: "רגליים לריהוט ודלפקים", sortOrder: 8 },
    { slug: "decorative", name: "דקורטיבי", sortOrder: 9 },
  ];

  for (const c of newCats) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    });
    console.log(`upsert ${c.slug}: ${c.name}`);
  }

  const all = await db.category.findMany({
    select: { slug: true, name: true, sortOrder: true, _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
  console.log("\nAll categories:");
  all.forEach((c) => console.log(`  ${c.sortOrder} ${c.slug}: ${c.name} (${c._count.products})`));
  await db.$disconnect();
}
main();
