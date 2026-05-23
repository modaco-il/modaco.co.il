/**
 * Second pass — specifically hunt for items in accessories that Yarin
 * flagged as misclassified: mirrors / bins / legs. Looks at the Hebrew
 * NAME (not just URL) since suppliers like Floralis don't encode the
 * category in their URL path.
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

const SIGNALS: Array<{ bucket: string; rx: RegExp[] }> = [
  {
    bucket: "MIRRORS (mirrors / ראי / מראה)",
    rx: [/מראה/i, /\bראי\b/i, /\bראיה\b/i, /mirror/i],
  },
  {
    bucket: "BINS (trash / פח / מערכת מיון)",
    rx: [/\bפח\b/i, /\bפחי\b/i, /\bפחים\b/i, /מערכת מיון/i, /\bbin\b/i, /trash/i, /waste/i],
  },
  {
    bucket: "LEGS (רגליים / רגלי)",
    rx: [/\bרגל\b/i, /רגלי/i, /\bleg\b/i],
  },
  {
    bucket: "HANDLES (ידית / handles)",
    rx: [/\bידית\b/i, /ידיות/i, /\bhandle\b/i],
  },
  {
    bucket: "RAILS / SLIDES",
    rx: [/מסילה/i, /מסילות/i, /\bslide\b/i, /\brail\b/i],
  },
  {
    bucket: "HINGES (ציר / צירים)",
    rx: [/ציר\b/i, /צירים/i, /\bhinge\b/i],
  },
  {
    bucket: "FAUCETS (ברז / מקלחת)",
    rx: [/\bברז\b/i, /ברזי/i, /ראש מקלחת/i, /faucet/i, /tap\b/i],
  },
];

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const accCat = await db.category.findFirst({ where: { slug: "accessories" }, select: { id: true } });
  if (!accCat) throw new Error("accessories category not found");

  const products = await db.product.findMany({
    where: { categoryId: accCat.id },
    select: { id: true, name: true, basePrice: true, supplierUrl: true, status: true },
    orderBy: { name: "asc" },
  });

  console.log(`Scanning ${products.length} accessory products for misclassification signals…\n`);

  let foundAny = false;
  for (const sig of SIGNALS) {
    const hits = products.filter((p) => sig.rx.some((r) => r.test(p.name)));
    if (hits.length === 0) continue;
    foundAny = true;
    console.log("─".repeat(70));
    console.log(`${sig.bucket} — ${hits.length} hits`);
    console.log("─".repeat(70));
    hits.forEach((p) => {
      const u = p.supplierUrl ? p.supplierUrl.replace(/^https?:\/\//, "").slice(0, 60) : "—";
      console.log(`  ₪${String(p.basePrice).padStart(5)} | ${p.name}`);
      console.log(`        ${u}`);
    });
    console.log();
  }
  if (!foundAny) {
    console.log("No misclassification signals detected on the NAME field.");
    console.log("This suggests Yarin's mirrors/legs/bins observation might refer to");
    console.log("items in another category — let's also check sibling categories.\n");
  }

  // Also: are there mirrors/legs/bins sitting in OTHER categories already?
  // (so we know where to MOVE them, if found)
  console.log("=".repeat(70));
  console.log("Sibling categories — where these item types LIVE today");
  console.log("=".repeat(70));
  const allCats = await db.category.findMany({
    select: { id: true, slug: true, name: true, _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
  allCats.forEach((c) =>
    console.log(`  ${c.slug.padEnd(20)} ${c.name.padEnd(28)} (${c._count.products} products)`),
  );

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
