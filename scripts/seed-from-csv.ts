import "dotenv/config";
import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// ---------- Categories (canonical slugs) ----------
const CATS = [
  { slug: "hinges", name: "צירים", sortOrder: 1 },
  { slug: "slides", name: "מסילות", sortOrder: 2 },
  { slug: "lift-systems", name: "מנגנוני הרמה", sortOrder: 3 },
  { slug: "accessories", name: "אקססוריז ומוצרי אמבטיה", sortOrder: 4 },
  { slug: "faucets", name: "ברזי מטבח", sortOrder: 5 },
  { slug: "handles", name: "ידיות", sortOrder: 6 },
  { slug: "aluminum", name: "אלומיניום וזכוכית", sortOrder: 7 },
  { slug: "carpentry", name: "נגרות", sortOrder: 8 },
];

// Map Hebrew section headers to category slugs
function sectionToCategory(s: string): string {
  const t = s.toLowerCase();
  if (t.includes("ציר") || t.includes("תושב")) return "hinges";
  if (t.includes("מסיל") || t.includes("מובנטו") || t.includes("טנדם") || t.includes("סלי רשת") || t.includes("חלוקות")) return "slides";
  if (t.includes("מנגנוני הרמה") || t.includes("הרמה")) return "lift-systems";
  return "accessories";
}

// Map section to supplier
function sectionToSupplier(s: string): string {
  if (s.includes("Blum") || s.includes("מובנטו") || s.includes("טנדם")) return "Blum";
  if (s.includes("דומיסיל") || /סדרת/.test(s)) return "Domicile";
  return "Other";
}

function slugify(s: string, idx: number): string {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9א-ת\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return base ? `${base}-${idx}` : `product-${idx}`;
}

// Parse first integer/float from price text like "79", "219 כל המידות", "49,55,59"
function parsePrice(s: string): number | null {
  const m = s.match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

function parseColors(s: string): string[] {
  if (!s.trim()) return [];
  return s
    .split(/[,\.]/)
    .map((c) => c.trim())
    .filter((c) => c && !/\d/.test(c) && c.length < 30)
    .slice(0, 8);
}

// Tiny CSV parser with quoted-field support
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQ = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") {
        cur.push(field);
        field = "";
      } else if (c === "\n") {
        cur.push(field);
        rows.push(cur);
        cur = [];
        field = "";
      } else if (c === "\r") {
        // skip
      } else {
        field += c;
      }
    }
  }
  if (field || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  return rows;
}

async function main() {
  const csvPath = "C:/Users/ozkab/modaco-prices.csv";
  const text = readFileSync(csvPath, "utf8");
  const rows = parseCSV(text);

  console.log(`Parsed ${rows.length} CSV rows`);

  // Wipe existing seed data (idempotent)
  await db.productImage.deleteMany();
  await db.variant.deleteMany();
  await db.groupPrice.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.supplier.deleteMany();
  await db.customerGroup.deleteMany();

  // Customer groups
  await db.customerGroup.createMany({
    data: [
      { name: "retail", displayName: "קמעונאי", discountPercent: 0 },
      { name: "architect", displayName: "אדריכל", discountPercent: 15, paymentTerms: "שוטף+30" },
      { name: "contractor", displayName: "קבלן", discountPercent: 15, paymentTerms: "שוטף+30" },
      { name: "vip", displayName: "VIP", discountPercent: 20 },
    ],
  });

  // Suppliers
  const [domicile, blum, other] = await Promise.all([
    db.supplier.create({ data: { name: "Domicile", website: "https://www.domicile.co.il" } }),
    db.supplier.create({ data: { name: "Blum", website: "https://www.blum.com" } }),
    db.supplier.create({ data: { name: "Other" } }),
  ]);
  const supMap: Record<string, string> = {
    Domicile: domicile.id,
    Blum: blum.id,
    Other: other.id,
  };

  // Categories
  const catIds: Record<string, string> = {};
  for (const c of CATS) {
    const row = await db.category.create({ data: c });
    catIds[c.slug] = row.id;
  }

  // Parse products
  let currentSection = "";
  let currentCat = "accessories";
  let currentSupplier = "Other";
  let idx = 0;
  let created = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const [col1 = "", col2 = "", col3 = "", col4 = "", col5 = ""] = row;

    // Header row that's also the first section
    if (col1.trim().startsWith("סדרת רודיום") && col2.trim() === "מחיר") {
      currentSection = col1.trim();
      currentCat = sectionToCategory(currentSection);
      currentSupplier = sectionToSupplier(currentSection);
      continue;
    }

    // Empty row separator
    if (!col1.trim()) continue;

    // Section header: first col has text, col2 (price) is empty
    if (!col2.trim()) {
      currentSection = col1.trim();
      currentCat = sectionToCategory(currentSection);
      currentSupplier = sectionToSupplier(currentSection);
      continue;
    }

    // Product row
    idx++;
    const model = col1.trim();
    const price = parsePrice(col2);
    if (price === null) continue;

    const colorsText = col3.trim();
    const url = col4.trim();
    const notes = col5.trim();

    // col3 might be URL instead of colors (for hinges section where col3 is image)
    const col3IsUrl = /^https?:\/\//.test(colorsText) || /^data:/.test(colorsText);
    const actualColors = col3IsUrl ? [] : parseColors(colorsText);
    const actualUrl = col3IsUrl ? colorsText : url;

    // Product name: prefer descriptive (model contains Hebrew) or "series + SKU"
    const seriesName = currentSection.replace(/^סדרת\s*/, "").trim();
    const isDescriptive = /[א-ת]/.test(model);
    const name = isDescriptive
      ? `${seriesName ? seriesName + " " : ""}${model}`.trim()
      : `${seriesName} ${model}`.trim();
    const slug = slugify(`${model}-${seriesName || currentSection}`, idx);

    try {
      const product = await db.product.create({
        data: {
          name,
          slug,
          description: notes || null,
          categoryId: catIds[currentCat],
          supplierId: supMap[currentSupplier],
          supplierUrl: actualUrl || null,
          supplierSku: model,
          basePrice: price,
          status: "ACTIVE",
          sortOrder: idx,
        },
      });

      // Variants: one per color, or a single default if no colors
      if (actualColors.length > 0) {
        for (let v = 0; v < actualColors.length; v++) {
          await db.variant.create({
            data: {
              productId: product.id,
              name: actualColors[v],
              sku: `${model}-${v + 1}`,
              isDefault: v === 0,
              stockStatus: "AT_SUPPLIER",
              sortOrder: v,
            },
          });
        }
      } else {
        await db.variant.create({
          data: {
            productId: product.id,
            name: "סטנדרט",
            sku: `${model}-1`,
            isDefault: true,
            stockStatus: "AT_SUPPLIER",
          },
        });
      }

      // Image (if URL is an actual image, not product page)
      if (actualUrl && /\.(jpg|jpeg|png|webp|gif)/i.test(actualUrl)) {
        await db.productImage.create({
          data: {
            productId: product.id,
            url: actualUrl,
            sourceUrl: actualUrl,
            altText: name,
          },
        });
      }

      created++;
    } catch (e: any) {
      console.warn(`Skip ${model}: ${e.message?.slice(0, 100)}`);
    }
  }

  console.log(`Created ${created} products across ${CATS.length} categories`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
