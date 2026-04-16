import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function fixBroken404() {
  console.log("\n=== 1. Remove the broken 404 image row ===");
  const brokenUrl =
    "https://flvwtyqlfisznivqvque.supabase.co/storage/v1/object/public/product-images/cmo0goa9o00oaagpfbgi4itra/cmo1a6z0k003y0kpfa30n6p4i.gif";
  const deleted = await db.productImage.deleteMany({ where: { url: brokenUrl } });
  console.log(`Deleted ${deleted.count} row(s).`);
}

async function reparentOrphans() {
  console.log("\n=== 2. Reparent orphan categories under accessories ===");
  const accessories = await db.category.findUnique({ where: { slug: "accessories" } });
  if (!accessories) {
    console.log("accessories category not found!");
    return;
  }
  const orphanSlugs = ["mirrors", "bins", "legs", "decorative"];
  for (const slug of orphanSlugs) {
    const before = await db.category.findUnique({ where: { slug } });
    if (!before) {
      console.log(`  ${slug}: not found, skipping`);
      continue;
    }
    if (before.parentId === accessories.id) {
      console.log(`  ${slug}: already child of accessories, skipping`);
      continue;
    }
    await db.category.update({
      where: { id: before.id },
      data: { parentId: accessories.id },
    });
    console.log(`  ${slug}: parentId set to accessories (${accessories.id})`);
  }
}

async function main() {
  await fixBroken404();
  await reparentOrphans();

  console.log("\n=== Verification ===");
  const orphanSlugs = ["mirrors", "bins", "legs", "decorative", "faucets"];
  for (const slug of orphanSlugs) {
    const cat = await db.category.findUnique({
      where: { slug },
      include: { parent: { select: { slug: true } } },
    });
    console.log(`  ${slug.padEnd(12)} parent=${cat?.parent?.slug || "ROOT"}`);
  }
  const accessoriesTotal = await db.product.count({
    where: {
      category: {
        OR: [
          { slug: "accessories" },
          { parent: { slug: "accessories" } },
        ],
      },
      status: "ACTIVE",
    },
  });
  console.log(`\n/categories/accessories rollup count: ${accessoriesTotal} (includes subcategories)`);

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
