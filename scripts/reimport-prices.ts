import "dotenv/config";
import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Section header → category slug mapping
function sectionToCategory(s: string): string {
  if (/^סדרת\s+/.test(s) && !/מברשות/.test(s)) return "bath";
  if (/מברשות אסלה|מחממי מגבות|שרפרפים/.test(s)) return "bath";
  if (/^מראה|מראות תלויות/.test(s)) return "mirrors";
  if (/פחי אשפה|פח אשפה/.test(s)) return "bins";
  if (/בקבוקי יין/.test(s)) return "decorative";
  if (/חלוקות|חלוקת/.test(s)) return "decorative";
  if (/^רגלי|רגליים|גלגלים/.test(s)) return "legs";
  if (/ידיות/.test(s)) return "handles";
  if (/הרמה/.test(s)) return "lift-systems";
  if (/ציר|תושב/.test(s)) return "hinges";
  if (/מסיל|מובנטו|טנדם|לאגר|סלי רשת/.test(s)) return "slides";
  return "decorative";
}

function sectionToSupplier(s: string): string {
  if (/Blum/i.test(s) || /מובנטו/.test(s) || /טנדם/.test(s) || /אבנטוס/.test(s)) return "Blum";
  if (/דומיסיל|רודיום|SHELL|RIVIERA|BINOVA|RONDO|EDGE|LUCY|SANDRA|PICCOLO/.test(s)) return "Domicile";
  return "Other";
}

function slugify(s: string, idx: number): string {
  const base = s.toLowerCase().replace(/[^a-z0-9א-ת\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  return base ? `${base}-${idx}` : `product-${idx}`;
}

function parsePrice(s: string): number | null {
  const m = s.match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

function parseColors(s: string): string[] {
  if (!s.trim()) return [];
  return s.split(/[,\.]/).map((c) => c.trim()).filter((c) => c && !/\d/.test(c) && c.length < 30).slice(0, 8);
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
  const csvPath = process.argv[2] || "C:/Users/ozkab/modaco-prices.csv";
  const text = readFileSync(csvPath, "utf8");
  const rows = parseCSV(text);
  console.log(`Parsed ${rows.length} CSV rows`);

  // Wipe products + variants + images (keep categories!)
  await db.productImage.deleteMany();
  await db.variant.deleteMany();
  await db.groupPrice.deleteMany();
  await db.product.deleteMany();
  console.log("Wiped existing products");

  // Get categories + suppliers
  const cats = await db.category.findMany({ select: { id: true, slug: true } });
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  let suppliers = await db.supplier.findMany({ select: { id: true, name: true } });
  if (suppliers.length === 0) {
    await db.supplier.createMany({
      data: [
        { name: "Domicile", website: "https://www.domicile.co.il" },
        { name: "Blum", website: "https://www.blum.com" },
        { name: "Other" },
      ],
    });
    suppliers = await db.supplier.findMany({ select: { id: true, name: true } });
  }
  const supMap: Record<string, string> = Object.fromEntries(suppliers.map((s) => [s.name, s.id]));

  // Parse rows
  let currentSection = "";
  let currentCat = "decorative";
  let currentSupplier = "Other";
  let idx = 0;
  let created = 0;
  const counts: Record<string, number> = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const [col1 = "", col2 = "", col3 = "", col4 = "", col5 = ""] = row;

    if (col1.trim().startsWith("סדרת רודיום") && col2.trim() === "מחיר") {
      currentSection = col1.trim();
      currentCat = sectionToCategory(currentSection);
      currentSupplier = sectionToSupplier(currentSection);
      continue;
    }
    if (!col1.trim()) continue;
    if (!col2.trim()) {
      currentSection = col1.trim();
      currentCat = sectionToCategory(currentSection);
      currentSupplier = sectionToSupplier(currentSection);
      continue;
    }

    idx++;
    const model = col1.trim();
    const price = parsePrice(col2);
    if (price === null) continue;

    const colorsText = col3.trim();
    const url = col4.trim();
    const notes = col5.trim();
    const col3IsUrl = /^https?:\/\//.test(colorsText) || /^data:/.test(colorsText);
    const actualColors = col3IsUrl ? [] : parseColors(colorsText);
    const actualUrl = col3IsUrl ? colorsText : url;

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
          categoryId: catMap[currentCat] || null,
          supplierId: supMap[currentSupplier] || null,
          supplierUrl: actualUrl || null,
          supplierSku: model,
          basePrice: price,
          status: "ACTIVE",
          sortOrder: idx,
        },
      });

      if (actualColors.length > 0) {
        for (let v = 0; v < actualColors.length; v++) {
          await db.variant.create({
            data: {
              productId: product.id,
              name: actualColors[v],
              sku: `${model}-${v + 1}`.slice(0, 50),
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
            sku: `${model}-1`.slice(0, 50),
            isDefault: true,
            stockStatus: "AT_SUPPLIER",
          },
        });
      }

      if (actualUrl && /\.(jpg|jpeg|png|webp|gif)/i.test(actualUrl)) {
        await db.productImage.create({
          data: { productId: product.id, url: actualUrl, sourceUrl: actualUrl, altText: name },
        });
      }
      counts[currentCat] = (counts[currentCat] || 0) + 1;
      created++;
    } catch (e: any) {
      console.warn(`Skip ${model}: ${e.message?.slice(0, 100)}`);
    }
  }

  console.log(`\nCreated ${created} products`);
  console.log("By category:");
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  await db.$disconnect();
}
main();
