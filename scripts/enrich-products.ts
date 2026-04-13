import "dotenv/config";
import { chromium } from "playwright";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const args = process.argv.slice(2);
  const limit = args.find((a) => a.startsWith("--limit="))
    ? Number(args.find((a) => a.startsWith("--limit="))!.split("=")[1])
    : undefined;
  const force = args.includes("--force");

  const products = await db.product.findMany({
    where: { supplierUrl: { not: null } },
    select: { id: true, name: true, supplierUrl: true, supplierSku: true },
    take: limit,
  });

  console.log(`Scraping ${products.length} products…`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "he-IL",
    viewport: { width: 1280, height: 800 },
  });

  let updatedNames = 0;
  let addedImages = 0;
  let addedDescs = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.supplierUrl) continue;
    const page = await ctx.newPage();
    try {
      await page.goto(p.supplierUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(500);

      const data = await page.evaluate(() => {
        const h1 = document.querySelector("h1")?.textContent?.trim().replace(/\s+/g, " ");
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
        const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute("content");
        const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content");

        // Collect gallery images that contain SKU-like pattern or are from /wp-content/uploads/yyyy/
        const galleryImgs = Array.from(document.querySelectorAll("img"))
          .map((i) => (i as HTMLImageElement).src)
          .filter((u) => /\/wp-content\/uploads\/20\d\d\//.test(u))
          .filter((u) => !u.match(/logo|icon|sprite|placeholder|avatar|shade_|DOMICILE-1\.jpg|B2717|N19|_new/i))
          .filter((u, idx, arr) => arr.indexOf(u) === idx)
          .slice(0, 4);

        return { h1, ogImage, ogDesc, metaDesc, galleryImgs };
      });

      // Build product-specific image list: og:image first, then gallery matching sku
      const imgs: string[] = [];
      if (data.ogImage) imgs.push(data.ogImage);
      if (p.supplierSku) {
        const skuLower = p.supplierSku.toLowerCase().replace(/[^a-z0-9]/g, "");
        const matching = data.galleryImgs.filter((u) => {
          const name = u.toLowerCase().replace(/[^a-z0-9]/g, "");
          return name.includes(skuLower) && !imgs.includes(u);
        });
        imgs.push(...matching);
      }

      // Update name from h1 (more descriptive)
      const newName = data.h1 && data.h1.length > p.name.length && data.h1.length < 120 ? data.h1 : null;
      if (newName) {
        await db.product.update({ where: { id: p.id }, data: { name: newName } });
        updatedNames++;
      }

      // Description from og:description (Israeli WooCommerce usually has one)
      const desc = (data.ogDesc || data.metaDesc || "").trim();
      if (desc && desc.length > 20 && desc.length < 2000) {
        // Skip generic "קנה אונליין" / site tagline patterns
        if (!/ידיות|פרזול|דומיסיל|קנה|חנות/.test(desc) || desc.length > 80) {
          await db.product.update({ where: { id: p.id }, data: { description: desc } });
          addedDescs++;
        }
      }

      // Images — delete placeholders if force, then add
      if (imgs.length > 0) {
        if (force) {
          await db.productImage.deleteMany({ where: { productId: p.id } });
        }
        const existing = await db.productImage.count({ where: { productId: p.id } });
        if (existing === 0) {
          for (let j = 0; j < imgs.length; j++) {
            await db.productImage.create({
              data: {
                productId: p.id,
                url: imgs[j],
                sourceUrl: p.supplierUrl,
                altText: newName || p.name,
                sortOrder: j,
              },
            });
          }
          addedImages += imgs.length;
        }
      }
    } catch (e: any) {
      failed++;
      console.warn(`  fail ${p.supplierSku || p.name}: ${e.message?.slice(0, 80)}`);
    } finally {
      await page.close();
    }

    if ((i + 1) % 10 === 0) {
      console.log(`  ${i + 1}/${products.length}  names:${updatedNames} imgs:${addedImages} descs:${addedDescs} fail:${failed}`);
    }
  }

  console.log(`\nDone. names:${updatedNames} imgs:${addedImages} descs:${addedDescs} fail:${failed}`);

  await browser.close();
  await db.$disconnect();
}

main();
