/**
 * Adds display-metadata columns to the categories table so the storefront
 * can read everything from DB instead of the static src/lib/categories.ts file.
 *
 * Bypasses prisma config issues by hitting Postgres directly via pg, same as
 * scripts/add-lifestyle-column.ts did for the ProductImage migration.
 */
import { readFileSync } from "fs";
import { Pool } from "pg";

const env = readFileSync(".env.local", "utf8");
for (const l of env.split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) {
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const checks = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'categories'
      AND column_name IN ('brand','tagline','shortDesc','description','cover','indexLabel','featured','bentoSize');
  `);
  const existing = new Set(checks.rows.map((r) => r.column_name));

  const adds: string[] = [];
  if (!existing.has("brand")) adds.push(`ADD COLUMN "brand" TEXT`);
  if (!existing.has("tagline")) adds.push(`ADD COLUMN "tagline" TEXT`);
  if (!existing.has("shortDesc")) adds.push(`ADD COLUMN "shortDesc" TEXT`);
  if (!existing.has("description")) adds.push(`ADD COLUMN "description" TEXT`);
  if (!existing.has("cover")) adds.push(`ADD COLUMN "cover" TEXT`);
  if (!existing.has("indexLabel")) adds.push(`ADD COLUMN "indexLabel" TEXT`);
  if (!existing.has("featured")) adds.push(`ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT FALSE`);
  if (!existing.has("bentoSize")) adds.push(`ADD COLUMN "bentoSize" TEXT`);

  if (adds.length === 0) {
    console.log("All columns already present.");
  } else {
    const sql = `ALTER TABLE categories ${adds.join(", ")};`;
    await pool.query(sql);
    console.log(`Added ${adds.length} columns to categories.`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
