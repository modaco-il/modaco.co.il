import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {}
}
loadEnv();

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (c !== "\r") field += c;
    }
  }
  if (field || cur.length) { cur.push(field); rows.push(cur); }
  return rows;
}

const LEG_SECTIONS = new Set([
  "רגליים לשולחנות",
  "רגליי דלפק",
  "רגליים נמוכות לריהוט",
  "גלגלים לריהוט",
]);

async function main() {
  const text = readFileSync("C:/Users/ozkab/modaco-prices.csv", "utf8");
  const rows = parseCSV(text);

  // Collect: model -> { url, colorsText, notes, section }
  const legCsv = new Map<string, { url: string; colors: string; notes: string; section: string }>();
  let section = "";
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const [col1 = "", col2 = "", col3 = "", col4 = "", col5 = ""] = row;
    const c1 = col1.trim();
    if (!c1) continue;
    if (!col2.trim()) {
      section = c1;
      continue;
    }
    if (!LEG_SECTIONS.has(section)) continue;
    const model = c1;
    // URL might be in col3, col4, or col5 — depends on whether there's a colors and/or sizes column
    const isUrl = (s: string) => /^https?:\/\//.test(s.trim());
    let url = "";
    let colorsText = "";
    let notes = "";
    if (isUrl(col3)) { url = col3.trim(); }
    else if (isUrl(col4)) { url = col4.trim(); colorsText = col3.trim(); }
    else if (isUrl(col5)) { url = col5.trim(); colorsText = col3.trim(); notes = col4.trim(); }
    else { colorsText = col3.trim(); notes = col4.trim(); }
    legCsv.set(model.toUpperCase(), {
      url,
      colors: colorsText,
      notes,
      section,
    });
  }

  console.log(`CSV has ${legCsv.size} leg models with URLs`);

  // Now find legs in DB
  const legsCat = await db.category.findUnique({ where: { slug: "legs" } });
  if (!legsCat) {
    console.error("No legs category in DB");
    process.exit(1);
  }

  const dbLegs = await db.product.findMany({
    where: { categoryId: legsCat.id },
    select: { id: true, name: true, supplierUrl: true, supplierSku: true },
  });
  console.log(`DB has ${dbLegs.length} legs`);

  // Match: extract model from product.name (e.g. "רגליים לשולחנות FT501" → FT501)
  // Or use supplierSku if set
  let matched = 0;
  let updated = 0;
  let missing = 0;
  const stillNoUrl: string[] = [];

  for (const p of dbLegs) {
    // Try supplierSku first
    let model: string | null = null;
    if (p.supplierSku) model = p.supplierSku.toUpperCase();
    else {
      // Extract last token that's all-caps + digits (e.g. FT501, LG40, LGT5)
      const m = p.name.match(/\b([A-Z]+\d+[A-Z]?)\b/);
      if (m) model = m[1].toUpperCase();
    }

    if (!model) {
      stillNoUrl.push(`${p.name} (no model parsed)`);
      missing++;
      continue;
    }

    const csv = legCsv.get(model);
    if (!csv) {
      stillNoUrl.push(`${p.name} (model ${model} not in CSV)`);
      missing++;
      continue;
    }

    matched++;

    // Always overwrite if existing URL is missing OR not http(s) (e.g. garbage like "סבב")
    const existingIsValid = p.supplierUrl && /^https?:\/\//.test(p.supplierUrl);
    if (csv.url && !existingIsValid) {
      await db.product.update({
        where: { id: p.id },
        data: {
          supplierUrl: csv.url,
          supplierSku: model,
          ...(csv.notes ? { description: csv.notes } : {}),
        },
      });
      updated++;
    } else if (!p.supplierSku) {
      await db.product.update({ where: { id: p.id }, data: { supplierSku: model } });
    }
  }

  console.log(`\nMatched: ${matched}/${dbLegs.length}`);
  console.log(`Updated URLs: ${updated}`);
  console.log(`Could not match: ${missing}`);
  if (stillNoUrl.length > 0) {
    console.log("\nUnmatched products:");
    stillNoUrl.forEach((s) => console.log(`  - ${s}`));
  }

  // Also check: any CSV legs that have no DB product?
  const dbModels = new Set(
    dbLegs
      .map((p) => p.supplierSku?.toUpperCase() || p.name.match(/\b([A-Z]+\d+[A-Z]?)\b/)?.[1]?.toUpperCase())
      .filter(Boolean) as string[]
  );
  const missingFromDb = [...legCsv.keys()].filter((m) => !dbModels.has(m));
  if (missingFromDb.length > 0) {
    console.log(`\n${missingFromDb.length} CSV legs missing from DB entirely (need to create):`);
    missingFromDb.forEach((m) => {
      const csv = legCsv.get(m)!;
      console.log(`  - ${m} (${csv.section})`);
    });
  }

  await db.$disconnect();
}
main().catch(console.error);
