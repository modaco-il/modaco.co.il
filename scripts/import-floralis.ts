import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const COLLECTIONS = [
  { slug: "vases", targetCat: "accessories", tag: "אגרטלים" },
  { slug: "ornamental-tools", targetCat: "accessories", tag: "כלי נוי" },
  { slug: "pots-houses", targetCat: "accessories", tag: "אדניות" },
  { slug: "designed-mirrors", targetCat: "mirrors", tag: "מראות" },
  { slug: "storage", targetCat: "accessories", tag: "אחסון" },
  { slug: "cookware", targetCat: "accessories", tag: "כלי בישול" },
];

async function fetchCollection(slug: string) {
  const res = await fetch(
    `https://www.floralis.co.il/collections/${slug}/products.json?limit=250`
  );
  if (!res.ok) throw new Error(`${slug}: ${res.status}`);
  const data = await res.json();
  return data.products as any[];
}

function slugify(s: string, idx: number): string {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9א-ת\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return base ? `${base}-fl-${idx}` : `floralis-${idx}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  // Get categories
  const cats = await db.category.findMany({ select: { id: true, slug: true } });
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // Get/create Floralis supplier
  const floralis = await db.supplier.upsert({
    where: { name: "Floralis" },
    update: {},
    create: { name: "Floralis", website: "https://www.floralis.co.il" },
  });

  // Remove existing Floralis-sourced products (clean re-import)
  await db.product.deleteMany({ where: { supplierId: floralis.id } });

  let total = 0;
  let skipped = 0;
  let startIdx = 10000; // separate namespace to avoid sortOrder collisions

  for (const col of COLLECTIONS) {
    const products = await fetchCollection(col.slug);
    console.log(`\n${col.slug}: ${products.length} products`);

    for (const p of products) {
      const firstImage = p.images?.[0]?.src;
      const description = stripHtml(p.body_html || "").slice(0, 1500);
      const variants = p.variants || [];
      const basePrice = variants[0]?.price ? parseFloat(variants[0].price) : 0;

      if (!basePrice || !p.title) {
        skipped++;
        continue;
      }

      startIdx++;
      const slug = slugify(`${p.handle}-${col.tag}`, startIdx);
      const seriesName = col.tag;

      try {
        const product = await db.product.create({
          data: {
            name: p.title.trim(),
            slug,
            description: description || null,
            categoryId: catMap[col.targetCat] || null,
            supplierId: floralis.id,
            supplierUrl: `https://www.floralis.co.il/products/${p.handle}`,
            supplierSku: p.variants?.[0]?.sku || String(p.id),
            basePrice,
            status: "ACTIVE",
            sortOrder: startIdx,
            featured: false,
          },
        });

        // Variants
        if (variants.length > 1) {
          for (let v = 0; v < variants.length; v++) {
            const vv = variants[v];
            const vName = vv.title && vv.title !== "Default Title"
              ? vv.title
              : [vv.option1, vv.option2, vv.option3].filter((x) => x && x !== "Default Title").join(" / ") || "סטנדרט";
            const vPrice = parseFloat(vv.price || "0");
            const sku = (vv.sku || `FL-${p.id}-${v}`).slice(0, 50);
            try {
              await db.variant.create({
                data: {
                  productId: product.id,
                  name: vName.slice(0, 40),
                  sku,
                  priceOverride: vPrice !== basePrice ? vPrice : null,
                  isDefault: v === 0,
                  stockStatus: "AT_SUPPLIER",
                  sortOrder: v,
                },
              });
            } catch {
              // sku collision — append idx
              await db.variant.create({
                data: {
                  productId: product.id,
                  name: vName.slice(0, 40),
                  sku: `${sku}-${v}`.slice(0, 50),
                  priceOverride: vPrice !== basePrice ? vPrice : null,
                  isDefault: v === 0,
                  stockStatus: "AT_SUPPLIER",
                  sortOrder: v,
                },
              });
            }
          }
        } else {
          await db.variant.create({
            data: {
              productId: product.id,
              name: "סטנדרט",
              sku: (variants[0]?.sku || `FL-${p.id}`).slice(0, 50),
              isDefault: true,
              stockStatus: "AT_SUPPLIER",
            },
          });
        }

        // Images (up to 4)
        const images = (p.images || []).slice(0, 4);
        for (let i = 0; i < images.length; i++) {
          await db.productImage.create({
            data: {
              productId: product.id,
              url: images[i].src,
              sourceUrl: `https://www.floralis.co.il/products/${p.handle}`,
              altText: p.title,
              sortOrder: i,
            },
          });
        }

        total++;
      } catch (e: any) {
        skipped++;
        console.warn(`  skip ${p.title?.slice(0, 40)}: ${e.message?.slice(0, 80)}`);
      }
    }
  }

  console.log(`\nImported ${total}, skipped ${skipped}`);

  const counts = await db.product.groupBy({
    by: ["categoryId"],
    _count: { _all: true },
    where: { supplierId: floralis.id },
  });
  for (const c of counts) {
    const cat = cats.find((x) => x.id === c.categoryId);
    console.log(`  ${cat?.slug}: ${c._count._all}`);
  }

  await db.$disconnect();
}
main();
