export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/shop/product-card";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  return {
    title: query ? `חיפוש: ${query}` : "חיפוש",
    robots: { index: false, follow: true },
  };
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const products = query
    ? await db.product.findMany({
        where: {
          status: "ACTIVE",
          images: { some: {} },
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
          variants: { orderBy: { sortOrder: "asc" } },
        },
        take: 40,
        orderBy: { featured: "desc" },
      })
    : [];

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
      <div className="max-w-3xl mb-12">
        <div className="eyebrow mb-5">חיפוש</div>
        <h1 className="font-display font-bold text-4xl lg:text-6xl text-ink leading-[1.05]">
          {query ? (
            <>
              תוצאות עבור
              <br />
              <span className="text-mocha font-display-light">&quot;{query}&quot;</span>
            </>
          ) : (
            "מה תרצו למצוא?"
          )}
        </h1>
      </div>

      <form action="/search" method="GET" className="mb-12 max-w-2xl">
        <div className="relative">
          <SearchIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            name="q"
            defaultValue={query}
            placeholder="שם מוצר, קטגוריה, מותג, מק״ט…"
            className="w-full h-14 pr-14 pl-5 bg-cream-deep border border-bone text-ink placeholder:text-ink-soft/50 outline-none focus:border-mocha transition-colors font-light text-base"
            autoFocus
          />
        </div>
      </form>

      {query && (
        <p className="text-sm text-ink-soft mb-8 font-light">
          {products.length > 0
            ? `נמצאו ${products.length} תוצאות עבור "${query}"`
            : `לא נמצאו תוצאות עבור "${query}"`}
        </p>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-x-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
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
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-24 text-ink-soft">
          <SearchIcon className="w-12 h-12 mx-auto mb-6 opacity-40" />
          <p className="text-lg">לא מצאנו מוצרים תואמים</p>
          <p className="text-sm mt-2 opacity-70">נסו מילות חיפוש אחרות</p>
        </div>
      ) : null}
    </div>
  );
}
