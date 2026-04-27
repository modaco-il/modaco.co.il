/**
 * Adds isLifestyle Boolean column to product_images table.
 * Bypasses prisma config issues by using raw pg + PrismaPg adapter directly.
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

  // Check if column exists
  const check = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'product_images' AND column_name = 'isLifestyle';
  `);

  if (check.rows.length > 0) {
    console.log("Column isLifestyle already exists.");
    await pool.end();
    return;
  }

  // Add the column with default false
  await pool.query(`
    ALTER TABLE product_images
    ADD COLUMN "isLifestyle" BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  console.log("Added isLifestyle column to product_images.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
