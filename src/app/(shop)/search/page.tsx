export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { ProductCard } from "@/components/shop/product-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const products = query
    ? await db.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            {
              variants: {
                some: { sku: { contains: query, mode: "insensitive" } },
              },
            },
            {
              category: {
                name: { contains: query, mode: "insensitive" },
              },
            },
          ],
        },
        include: {
          images: { take: 1 },
          category: true,
          variants: { where: { isDefault: true }, take: 1 },
        },
        take: 40,
        orderBy: { featured: "desc" },
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">חיפוש</h1>

      {/* Search box */}
      <form action="/search" method="GET" className="mb-8">
        <div className="relative max-w-lg">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="חפש מוצרים, קטגוריות, מותגים..."
            className="pr-11 h-12 text-lg"
            autoFocus
          />
        </div>
      </form>

      {/* Results */}
      {query && (
        <p className="text-sm text-gray-500 mb-4">
          {products.length > 0
            ? `נמצאו ${products.length} תוצאות עבור "${query}"`
            : `לא נמצאו תוצאות עבור "${query}"`}
        </p>
      )}

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
      ) : query ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-4" />
          <p>לא מצאנו מוצרים תואמים</p>
          <p className="text-sm mt-1">נסו מילות חיפוש אחרות</p>
        </div>
      ) : null}
    </div>
  );
}
