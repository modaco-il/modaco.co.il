/**
 * Cleanup names of FLEX CNC cladding products imported from Domicile.
 * - Decode HTML entities
 * - Strip trailing "- דומיסיל | DOMICILE" branding
 * - Shorten to a usable display name
 */
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

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function cleanName(raw: string): string {
  let s = decodeEntities(raw);
  // Strip trailing supplier brand: " - דומיסיל | DOMICILE" or just "| DOMICILE"
  s = s.replace(/\s*[-|–]\s*דומיסיל\s*\|?\s*DOMICILE\s*$/i, "");
  s = s.replace(/\s*\|\s*DOMICILE\s*$/i, "");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

async function main() {
  const products = await db.product.findMany({
    where: { category: { slug: "cladding" } },
    select: { id: true, name: true },
  });

  let updated = 0;
  for (const p of products) {
    const cleaned = cleanName(p.name);
    if (cleaned !== p.name && cleaned.length > 5) {
      await db.product.update({ where: { id: p.id }, data: { name: cleaned } });
      console.log(`✓ ${p.name.slice(0, 50)}... → ${cleaned}`);
      updated++;
    }
  }

  console.log(`\nUpdated ${updated}/${products.length} names`);
  await db.$disconnect();
}
main().catch(console.error);
