import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  const images = await db.productImage.findMany({
    select: { url: true, productId: true },
  });

  console.log(`Total productImage rows: ${images.length}`);

  const byHost: Record<string, number> = {};
  for (const img of images) {
    try {
      const url = new URL(img.url);
      byHost[url.host] = (byHost[url.host] || 0) + 1;
    } catch {
      byHost["__invalid__"] = (byHost["__invalid__"] || 0) + 1;
    }
  }

  console.log("\nBy host:");
  for (const [host, count] of Object.entries(byHost).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${host}: ${count}`);
  }

  // Sample URLs
  console.log("\nSample URLs:");
  images.slice(0, 10).forEach((img) => console.log(`  ${img.url}`));

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
