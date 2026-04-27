import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const env = readFileSync(".env.local", "utf8");
for (const l of env.split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) {
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const ps = await db.product.findMany({
    where: { category: { slug: { in: ["faucets-blanco", "faucets-delta"] } } },
    select: { name: true, images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 2 } },
  });
  // Group by image folder to detect collisions
  const byFolder = new Map<string, string[]>();
  for (const p of ps) {
    const url = p.images[0]?.url || "";
    const folder = url.match(/\/(faucets\/[^/]+)\//)?.[1] || "?";
    if (!byFolder.has(folder)) byFolder.set(folder, []);
    byFolder.get(folder)!.push(p.name);
  }
  console.log(`Total products: ${ps.length}`);
  console.log(`Unique folders: ${byFolder.size}`);
  console.log("\nCollisions (folders with >1 product):");
  for (const [folder, names] of byFolder) {
    if (names.length > 1) {
      console.log(`  ${folder}:`);
      names.forEach((n) => console.log(`    - ${n}`));
    }
  }
  await db.$disconnect();
}
main().catch(console.error);
