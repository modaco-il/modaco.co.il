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
    select: { name: true, supplierUrl: true },
    take: 5,
  });
  ps.forEach((p) => console.log(p.name, "|", p.supplierUrl));
  await db.$disconnect();
}
main().catch(console.error);
