import { readFileSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function loadEnv(): void {
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

const COLOR_WORDS = [
  "ניקל מוברש", "ניקל", "כרום ניקל", "כרום", "נירוסטה מט", "נירוסטה",
  "שחור מט", "שחור מוברש", "שחור",
  "גרפיט", "אפור", "לבן מט", "לבן",
  "זהב מט", "זהב", "רוז גולד", "שמפניה",
  "ברונזה", "פליז כהה", "פליז", "נחושת", "טיטניום", "אנתרציט",
  "קשמיר", "עץ", "עור", "אלומיניום", "אלומניום",
];

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractSizes(html: string): string[] {
  const text = decodeEntities(html);
  // Accept any quote variant between מ and מ, or just plain mm
  const re = /(?<!\d)(\d{2,4})\s*(?:מ["'״”“‟″]?מ|mm)(?![a-z0-9])/gi;
  const found = new Set<number>();
  for (const m of text.matchAll(re)) {
    const n = parseInt(m[1]);
    if (n >= 30 && n <= 2500) found.add(n);
  }
  return [...found].sort((a, b) => a - b).map(String);
}

function extractColors(html: string): string[] {
  // Look at decoded text-ish content: strip tags, collapse whitespace
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8221;|&#8220;|&#8222;|&#8243;/g, '"')
    .replace(/\s+/g, " ");

  const found = new Set<string>();
  // Longer colors first to avoid substring matches
  const sorted = [...COLOR_WORDS].sort((a, b) => b.length - a.length);
  for (const cw of sorted) {
    // Match as whole-word-ish boundary
    const re = new RegExp(`(?:^|[\\s,/·\\-\\|])${cw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[\\s,/·\\-\\|])`, "g");
    if (re.test(stripped)) found.add(cw);
  }
  return [...found];
}

async function fetchHtml(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "he-IL,he;q=0.9,en;q=0.6",
    },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

async function main() {
  const dryRun = process.argv.includes("--dry");
  const handles = await db.product.findMany({
    where: {
      category: { slug: "handles" },
      variants: { some: { name: { contains: "גודל" } } },
    },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  console.log(`Handles needing fix: ${handles.length} ${dryRun ? "(DRY)" : ""}\n`);

  let updated = 0;
  let partial = 0;
  let skipped = 0;
  const report: string[] = [];

  for (let i = 0; i < handles.length; i++) {
    const p = handles[i];
    const url = p.supplierUrl;
    if (!url || !/domicile\.co\.il\/product\//.test(url)) {
      skipped++;
      report.push(`SKIP(no-domicile-url) ${p.slug}`);
      continue;
    }
    try {
      const html = await fetchHtml(url);
      const sizes = extractSizes(html);
      const colors = extractColors(html);
      const sku = p.slug.match(/(al\d+|\d{3,6}[a-z]*|c\d+)/i)?.[1]?.toUpperCase() || p.slug;

      if (sizes.length >= p.variants.length) {
        if (!dryRun) {
          for (let j = 0; j < p.variants.length; j++) {
            await db.variant.update({ where: { id: p.variants[j].id }, data: { name: `${sizes[j]} מ"מ` } });
          }
        }
        updated++;
        report.push(`OK ${sku.padEnd(10)} ${p.variants.length}v → [${sizes.slice(0, p.variants.length).join(", ")}] | colors: ${colors.join(", ")}`);
      } else if (sizes.length > 0) {
        if (!dryRun) {
          for (let j = 0; j < sizes.length && j < p.variants.length; j++) {
            await db.variant.update({ where: { id: p.variants[j].id }, data: { name: `${sizes[j]} מ"מ` } });
          }
        }
        partial++;
        report.push(`PARTIAL ${sku.padEnd(10)} ${p.variants.length}v → ${sizes.length}sz [${sizes.join(", ")}] | colors: ${colors.join(", ")}`);
      } else {
        skipped++;
        report.push(`NO-SIZES ${sku.padEnd(10)} | colors: ${colors.join(", ")}`);
      }
    } catch (e: any) {
      skipped++;
      report.push(`ERR ${p.slug} ${String(e).slice(0, 80)}`);
    }
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${handles.length} ok:${updated} partial:${partial} skip:${skipped}`);
  }

  console.log(`\n=== Report ===`);
  console.log(report.join("\n"));
  console.log(`\nDone. ok:${updated} partial:${partial} skip:${skipped}`);
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
