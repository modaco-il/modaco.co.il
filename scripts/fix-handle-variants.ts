import "dotenv/config";
import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function parsePrices(s: string): number[] {
  // "21,25" → [21, 25]; "79,129,179" → [79, 129, 179]; "15" → [15]
  const cleaned = s.replace(/[^\d,.\s]/g, " ");
  return cleaned
    .split(/[,\s]+/)
    .map((x) => parseFloat(x))
    .filter((x) => !Number.isNaN(x) && x > 0);
}

function parseColors(s: string): string[] {
  if (!s.trim()) return [];
  // split by comma, period, or Hebrew enumerator
  return s
    .split(/[,.]/)
    .map((c) => c.trim())
    .filter((c) => c && !/^https?:/.test(c) && c.length < 30 && !/\d{3,}/.test(c));
}

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

async function main() {
  const csvPath = "C:/Users/ozkab/modaco-prices.csv";
  const text = readFileSync(csvPath, "utf8");
  const rows = parseCSV(text);

  // Find handle section start
  let inHandles = false;
  const handleRows: string[][] = [];
  for (const row of rows) {
    const [col1 = ""] = row;
    if (col1.trim() === "ידיות למטבחים וארונות") {
      inHandles = true;
      continue;
    }
    if (inHandles) handleRows.push(row);
  }
  console.log(`Found ${handleRows.length} handle rows`);

  // Get handles products from DB by SKU
  const products = await db.product.findMany({
    where: { category: { slug: "handles" } },
    include: { variants: true },
  });
  console.log(`DB has ${products.length} handles`);
  const bySku: Record<string, typeof products[0]> = {};
  for (const p of products) {
    if (p.supplierSku) bySku[p.supplierSku.trim()] = p;
  }

  let updated = 0;
  let noMatch = 0;

  for (const row of handleRows) {
    const [col1 = "", col2 = "", col3 = "", col4 = ""] = row;
    const sku = col1.trim();
    if (!sku || !col2.trim()) continue;

    const product = bySku[sku];
    if (!product) {
      noMatch++;
      continue;
    }

    const prices = parsePrices(col2);
    if (prices.length === 0) continue;
    const colorsText = col3.trim();
    const colors = /^https?:/.test(colorsText) ? [] : parseColors(colorsText);

    // Wipe existing variants
    await db.variant.deleteMany({ where: { productId: product.id } });

    // Generate variants
    // If multiple prices → sizes, each with optional colors
    // If only colors, one "size" per color with the same price
    const sizeCount = prices.length;
    const colorCount = Math.max(colors.length, 1);

    let variantIdx = 0;
    for (let s = 0; s < sizeCount; s++) {
      for (let c = 0; c < colorCount; c++) {
        const sizeLabel =
          sizeCount > 1 ? `גודל ${s + 1}` : null;
        const colorLabel = colors[c] || null;
        let name = "";
        if (sizeLabel && colorLabel) name = `${sizeLabel} · ${colorLabel}`;
        else if (sizeLabel) name = sizeLabel;
        else if (colorLabel) name = colorLabel;
        else name = "סטנדרט";

        const baseSku = `${sku}-${s + 1}${colorCount > 1 ? `-${c + 1}` : ""}`.replace(/\s+/g, "");
        try {
          await db.variant.create({
            data: {
              productId: product.id,
              name: name.slice(0, 40),
              sku: baseSku.slice(0, 50),
              priceOverride: prices[s] !== product.basePrice ? prices[s] : null,
              isDefault: variantIdx === 0,
              stockStatus: "AT_SUPPLIER",
              sortOrder: variantIdx,
            },
          });
          variantIdx++;
        } catch {
          // sku collision
          await db.variant.create({
            data: {
              productId: product.id,
              name: name.slice(0, 40),
              sku: `${baseSku}-${Math.random().toString(36).slice(2, 6)}`.slice(0, 50),
              priceOverride: prices[s] !== product.basePrice ? prices[s] : null,
              isDefault: variantIdx === 0,
              stockStatus: "AT_SUPPLIER",
              sortOrder: variantIdx,
            },
          });
          variantIdx++;
        }
      }
    }

    // Update product basePrice to first price
    if (prices[0] !== product.basePrice) {
      await db.product.update({
        where: { id: product.id },
        data: { basePrice: prices[0] },
      });
    }

    updated++;
    if (updated % 50 === 0) console.log(`  ${updated} handles updated…`);
  }

  console.log(`\nUpdated ${updated} handles, no match for ${noMatch}`);
  await db.$disconnect();
}
main();
