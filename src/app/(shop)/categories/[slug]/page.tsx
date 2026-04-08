import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/product-card";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return {};
  return {
    title: `${category.name} — Modaco`,
    description: `${category.name} — מבחר מוצרים מהמותגים המובילים | Modaco`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!category) notFound();

  // Get products in this category and all child categories
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const products = await db.product.findMany({
    where: {
      categoryId: { in: categoryIds },
      status: "ACTIVE",
    },
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: true,
      variants: { where: { isDefault: true }, take: 1 },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="flex gap-2 mb-8 flex-wrap">
          {category.children.map((child) => (
            <a
              key={child.id}
              href={`/categories/${child.slug}`}
              className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {child.name}
            </a>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price:
                  product.variants[0]?.priceOverride ?? product.basePrice,
                image: product.images[0]?.url || null,
                category: product.category?.name || "",
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">עדיין אין מוצרים בקטגוריה זו</p>
          <p className="text-sm mt-2">מוצרים חדשים מתווספים בקרוב!</p>
        </div>
      )}
    </div>
  );
}
