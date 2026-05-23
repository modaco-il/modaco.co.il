/**
 * One-shot: set the accessories category cover to the white primitive jug
 * (Yarin's pick from the 23/5 curation). Was the storefront photo before.
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

const NEW_COVER =
  "https://flvwtyqlfisznivqvque.supabase.co/storage/v1/object/public/product-images/cmo191ihw01n6ropfgt1v60zc/cmo191io901n8ropfc7iejdge.jpg";

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
  const before = await db.category.findUnique({
    where: { slug: "accessories" },
    select: { name: true, cover: true },
  });
  console.log("Before:", before);
  const updated = await db.category.update({
    where: { slug: "accessories" },
    data: { cover: NEW_COVER },
    select: { name: true, cover: true },
  });
  console.log("After: ", updated);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
