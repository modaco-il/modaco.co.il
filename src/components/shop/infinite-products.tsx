"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/shop/reveal";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  imageIsLifestyle?: boolean;
  category: string;
  categorySlug?: string;
  colors?: string[];
}

interface Props {
  initialItems: ProductData[];
  totalCount: number;
  categorySlug: string;
  pageSize: number;
}

const featuredEvery = 7;

export function InfiniteProducts({ initialItems, totalCount, categorySlug, pageSize }: Props) {
  const [items, setItems] = useState<ProductData[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length < totalCount);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return;
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
          const next = page + 1;
          const res = await fetch(`/api/products/by-category?slug=${encodeURIComponent(categorySlug)}&page=${next}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: { items: ProductData[]; hasMore: boolean } = await res.json();
          setItems((prev) => [...prev, ...data.items]);
          setPage(next);
          setHasMore(data.hasMore);
        } catch (e) {
          console.error("Failed to load more:", e);
        } finally {
          setLoading(false);
          loadingRef.current = false;
        }
      },
      { rootMargin: "600px" }, // start loading before user reaches bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, page, categorySlug]);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16 auto-rows-auto">
        {items.map((p, i) => {
          const isFeatured = i > 0 && i % featuredEvery === 0 && !!p.image;
          const delay = (i % 4) * 80;
          return (
            <Reveal
              key={p.id}
              delay={Math.min(delay, 240)}
              className={isFeatured ? "lg:col-span-2 lg:row-span-2" : ""}
            >
              <ProductCard featured={isFeatured} product={p} />
            </Reveal>
          );
        })}
      </div>

      {/* Sentinel for IntersectionObserver */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-20 flex items-center justify-center text-ink-soft"
          aria-live="polite"
        >
          {loading ? (
            <div className="flex items-center gap-3 text-sm tracking-wider uppercase">
              <span className="inline-block w-4 h-4 border-2 border-mocha border-t-transparent rounded-full animate-spin" />
              טוען...
            </div>
          ) : (
            <div className="text-xs tracking-[0.25em] uppercase opacity-50">
              עוד מוצרים בדרך
            </div>
          )}
        </div>
      )}

      {!hasMore && items.length >= pageSize && (
        <div className="mt-20 pt-10 border-t border-bone text-center text-xs tracking-[0.25em] uppercase text-ink-soft/60">
          הצגנו את כל {totalCount} המוצרים
        </div>
      )}
    </>
  );
}
