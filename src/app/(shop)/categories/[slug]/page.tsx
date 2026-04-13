import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/shop/reveal";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return {};
  return {
    title: `${category.name} — Modaco`,
    description: `${category.name} — מבחר מוצרים מהמותגים המובילים | Modaco`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!category) notFound();

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const products = await db.product.findMany({
    where: {
      categoryId: { in: categoryIds },
      status: "ACTIVE",
    },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: true,
      variants: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  // Mark every 7th product as featured (only if it has an image)
  const featuredIndex = (i: number) =>
    i > 0 && i % 7 === 0 && products[i].images.length > 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
      {/* Category header */}
      <div className="mb-16 lg:mb-20">
        <Reveal>
          <div className="eyebrow mb-5">קטגוריה</div>
          <h1 className="font-display font-bold text-5xl lg:text-7xl text-ink mb-4">
            {category.name}
          </h1>
          <p className="text-ink-soft font-light text-base">
            {products.length} מוצרים בקטלוג
          </p>
        </Reveal>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="flex gap-3 mb-12 flex-wrap">
          {category.children.map((child) => (
            <a
              key={child.id}
              href={`/categories/${child.slug}`}
              className="px-5 py-2 border border-bone text-sm text-ink-soft hover:border-mocha hover:text-mocha transition-colors"
            >
              {child.name}
            </a>
          ))}
        </div>
      )}

      {/* Editorial grid — featured items break rhythm */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16 auto-rows-auto">
          {products.map((product, i) => {
            const isFeatured = featuredIndex(i);
            // stagger delay per row of 4
            const delay = (i % 4) * 80;
            return (
              <Reveal
                key={product.id}
                delay={delay}
                className={isFeatured ? "lg:col-span-2 lg:row-span-2" : ""}
              >
                <ProductCard
                  featured={isFeatured}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price:
                      product.variants.find((v) => v.isDefault)?.priceOverride ??
                      product.basePrice,
                    image: product.images[0]?.url || null,
                    category: product.category?.name || "",
                    colors: product.variants.map((v) => v.name),
                  }}
                />
              </Reveal>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-32 text-ink-soft font-light">
          <p className="text-lg">עדיין אין מוצרים בקטגוריה זו</p>
          <p className="text-sm mt-2">מוצרים חדשים מתווספים בקרוב</p>
        </div>
      )}
    </div>
  );
}
