/**
 * One-shot backfill: copy the curated metadata from src/lib/categories.ts
 * (brand, tagline, shortDesc, description, cover, indexLabel, featured,
 * bentoSize) into the DB rows that already exist for those slugs.
 *
 * After this, the storefront chrome (bento, footer, header, /catalog) can
 * read everything from DB and the agent's add_category tool can populate
 * the same fields when Yarin says "צור קטגוריה חדשה".
 */
import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATEGORIES } from "../src/lib/categories";

const env = readFileSync(".env.local", "utf8");
for (const l of env.split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) {
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  let updated = 0;
  let created = 0;
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const existing = await db.category.findUnique({ where: { slug: c.slug } });
    const data = {
      name: c.name,
      brand: c.brand,
      tagline: c.tagline,
      shortDesc: c.shortDesc,
      description: c.description,
      cover: c.cover,
      indexLabel: c.index,
      featured: c.featured ?? true,
      bentoSize: c.bentoSize ?? null,
      sortOrder: i + 1,
    };
    if (existing) {
      await db.category.update({ where: { slug: c.slug }, data });
      updated++;
      console.log(`  ↻ ${c.slug.padEnd(15)} ${c.name}`);
    } else {
      await db.category.create({ data: { slug: c.slug, ...data } });
      created++;
      console.log(`  + ${c.slug.padEnd(15)} ${c.name}`);
    }
  }
  console.log(`\nDone. Updated ${updated}, created ${created}.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
