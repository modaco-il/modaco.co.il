import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  // Find the gas piston product
  const p = await db.product.findFirst({
    where: { name: { contains: "בוכנת גז" } },
    include: { variants: true },
  });
  if (!p) {
    console.log("not found");
    return;
  }
  console.log("Found:", p.name, "id:", p.id, "variants:", p.variants.length);

  // Rename
  await db.product.update({ where: { id: p.id }, data: { name: "בוכנת גז" } });

  // Replace variants with strength options
  await db.variant.deleteMany({ where: { productId: p.id } });
  const opts = ["80N", "100N", "120N", "150N", "180N"];
  for (let i = 0; i < opts.length; i++) {
    await db.variant.create({
      data: {
        productId: p.id,
        name: opts[i],
        sku: `BUCHNAT-${opts[i]}`,
        isDefault: i === 0,
        stockStatus: "AT_SUPPLIER",
        sortOrder: i,
      },
    });
  }
  console.log("Updated to בוכנת גז with 5 variants:", opts.join(", "));
  await db.$disconnect();
}
main();
