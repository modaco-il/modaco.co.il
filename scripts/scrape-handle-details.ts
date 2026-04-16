import "dotenv/config";
import { chromium } from "playwright";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const handles = await db.product.findMany({
    where: {
      category: { slug: "handles" },
      supplierUrl: { contains: "domicile.co.il/product/" },
      OR: [
        { variants: { some: { name: { contains: "גודל" } } } },
        { images: { none: {} } },
      ],
    },
    include: { variants: { orderBy: { sortOrder: "asc" } }, images: true },
  });
  console.log(`Scraping details for ${handles.length} handles`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    locale: "he-IL",
    viewport: { width: 1280, height: 800 },
  });

  let updated = 0;
  let skipped = 0;
  for (let i = 0; i < handles.length; i++) {
    const p = handles[i];
    if (!p.supplierUrl) continue;
    const page = await ctx.newPage();
    try {
      await page.goto(p.supplierUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(400);

      const data = await page.evaluate(() => {
        const body = document.body.innerText;
        const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
        // Sizes in mm
        const sizes = lines
          .filter((l) => /^\d+\s*מ["״]מ$|^\d+\s*mm$/i.test(l))
          .map((l) => l.match(/\d+/)?.[0])
          .filter((x): x is string => !!x);
        const uniqSizes = [...new Set(sizes)].slice(0, 8);
        // Colors with optional numeric prefix (03 ניקל מוברש)
        const colors = lines
          .filter((l) =>
            /^(0\d|1\d)?\s*(ניקל|פליז|שחור|זהב|כרום|לבן|אפור|גרפיט|רוז|שמפניה|נירוסטה|ברונזה|פלדה|עץ|עור)/.test(l) &&
            l.length < 50
          )
          .map((l) => l.replace(/^0?\d+\s*/, "").trim());
        const uniqColors = [...new Set(colors)].slice(0, 8);
        // og image for image update if missing
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
        const h1 = document.querySelector("h1")?.textContent?.trim().replace(/\s+/g, " ");
        return { sizes: uniqSizes, colors: uniqColors, ogImage, h1 };
      });

      // Improve product name from h1 if richer
      if (data.h1 && data.h1.length > (p.name || "").length && data.h1.length < 120) {
        await db.product.update({ where: { id: p.id }, data: { name: data.h1 } });
      }

      // Add image if missing
      if (p.images.length === 0 && data.ogImage) {
        await db.productImage.create({
          data: {
            productId: p.id,
            url: data.ogImage,
            sourceUrl: p.supplierUrl,
            altText: data.h1 || p.name,
            sortOrder: 0,
          },
        });
      }

      // Rebuild variants with actual sizes (if found) and colors
      if (data.sizes.length > 0 || data.colors.length > 0) {
        const sizeCount = Math.max(p.variants.filter(v => /גודל 1/.test(v.name)).length ?
          new Set(p.variants.map(v => v.name.match(/גודל (\d+)/)?.[1]).filter(Boolean)).size : 1, 1);

        // Just relabel existing variants
        const actualSizes = data.sizes.length >= sizeCount ? data.sizes.slice(0, sizeCount) : null;
        if (actualSizes) {
          for (const v of p.variants) {
            const m = v.name.match(/גודל (\d+)(?:\s*·\s*(.+))?/);
            if (m) {
              const sIdx = parseInt(m[1]) - 1;
              const color = m[2];
              const mm = actualSizes[sIdx];
              if (mm) {
                const newName = color ? `${mm} מ"מ · ${color}` : `${mm} מ"מ`;
                await db.variant.update({
                  where: { id: v.id },
                  data: { name: newName.slice(0, 40) },
                });
              }
            }
          }
        }
      }

      updated++;
    } catch (e: any) {
      skipped++;
      // swallow timeouts
    } finally {
      await page.close();
    }

    if ((i + 1) % 20 === 0) {
      console.log(`  ${i + 1}/${handles.length}  updated:${updated} skip:${skipped}`);
    }
  }

  console.log(`\nDone. updated:${updated} skip:${skipped}`);
  await browser.close();
  await db.$disconnect();
}
main();
