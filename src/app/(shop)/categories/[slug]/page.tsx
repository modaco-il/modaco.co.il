import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/shop/reveal";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 24;

const categoryMeta: Record<string, { og: string; tagline: string }> = {
  hinges: { og: "/images/blum/blum-hinges.jpg", tagline: "צירי Blum ו-Domicile באיכות שווייצרית" },
  slides: { og: "/images/blum/blum-slides.jpg", tagline: "מסילות Movento, Tandem ו-Blumotion" },
  "lift-systems": { og: "/images/blum/blum-lift.jpg", tagline: "מנגנוני הרמה Aventos לחזיתות עליונות" },
  bath: { og: "/images/domicile/lucy.jpg", tagline: "סדרות מלאות לחדרי רחצה מ-Domicile" },
  handles: { og: "/images/domicile/mood.jpg", tagline: "ידיות Domicile לארונות ומטבחים — לב החנות" },
  accessories: { og: "/images/modaco/5F7A9697.webp", tagline: "אקססוריז לבית מ-Floralis" },
  mirrors: { og: "/images/domicile/mood.jpg", tagline: "מראות מעוצבות לאמבטיה וסלון" },
  bins: { og: "/images/domicile/mood.jpg", tagline: "פחי אשפה למטבח ואמבטיה" },
  legs: { og: "/images/modaco/5F7A9683.webp", tagline: "רגליים לריהוט, שולחנות ודלפקים" },
  decorative: { og: "/images/modaco/5F7A9697.webp", tagline: "פריטים דקורטיביים לבית" },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return {};
  const meta = categoryMeta[slug] || { og: "/images/israelevitz/1-web.jpg", tagline: `${category.name} — מוצרים מהמותגים המובילים` };
  return {
    title: category.name,
    description: `${category.name} — ${meta.tagline}. Modaco — למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית.`,
    openGraph: {
      title: `${category.name} | Modaco`,
      description: meta.tagline,
      images: [{ url: meta.og, alt: category.name }],
      type: "website",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const { page: pageParam } = await searchParams;

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!category) notFound();

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  // Only show products that actually have images — avoids "תמונה חסרה" cards
  // leaking into public browsing until Yarin uploads replacements.
  const productWhere = {
    categoryId: { in: categoryIds },
    status: "ACTIVE" as const,
    images: { some: {} },
  };

  const totalCount = await db.product.count({ where: productWhere });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.max(1, Math.min(totalPages, Number(pageParam) || 1));
  const skip = (page - 1) * PAGE_SIZE;

  const products = await db.product.findMany({
    where: productWhere,
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      category: true,
      variants: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    skip,
    take: PAGE_SIZE,
  });

  // Featured span pattern within page only (index relative to the current page)
  const featuredIndex = (i: number) =>
    i > 0 && i % 7 === 0 && products[i].images.length > 0;

  const firstOnPage = skip + 1;
  const lastOnPage = Math.min(skip + products.length, totalCount);

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
            {totalCount > 0
              ? totalPages > 1
                ? `מציגים ${firstOnPage}–${lastOnPage} מתוך ${totalCount} מוצרים`
                : `${totalCount} מוצרים בקטלוג`
              : "אין מוצרים בקטגוריה"}
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

      {/* Editorial grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16 auto-rows-auto">
          {products.map((product, i) => {
            const isFeatured = featuredIndex(i);
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          slug={slug}
          page={page}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}

function Pagination({
  slug,
  page,
  totalPages,
}: {
  slug: string;
  page: number;
  totalPages: number;
}) {
  const linkFor = (p: number) =>
    p === 1 ? `/categories/${slug}` : `/categories/${slug}?page=${p}`;

  // Build page numbers: always show 1 and totalPages; show window around current
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let p = page - 2; p <= page + 2; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  return (
    <nav
      className="mt-20 pt-10 border-t border-bone flex items-center justify-between flex-wrap gap-4"
      aria-label="ניווט בין עמודים"
      dir="rtl"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {page > 1 ? (
          <Link
            href={linkFor(page - 1)}
            className="px-4 h-10 flex items-center text-sm text-ink-soft hover:text-mocha transition-colors border border-bone hover:border-mocha"
          >
            → הקודם
          </Link>
        ) : (
          <span className="px-4 h-10 flex items-center text-sm text-ink-soft/40 border border-bone/50 cursor-not-allowed">
            → הקודם
          </span>
        )}

        <div className="flex items-center gap-1">
          {sorted.map((p, i) => {
            const prev = sorted[i - 1];
            const showGap = prev !== undefined && p - prev > 1;
            return (
              <span key={p} className="flex items-center gap-1">
                {showGap && <span className="text-ink-soft/40 px-1">…</span>}
                {p === page ? (
                  <span
                    className="w-10 h-10 flex items-center justify-center text-sm font-medium bg-ink text-cream"
                    aria-current="page"
                  >
                    {p}
                  </span>
                ) : (
                  <Link
                    href={linkFor(p)}
                    className="w-10 h-10 flex items-center justify-center text-sm text-ink-soft hover:text-mocha hover:bg-cream-deep transition-colors"
                  >
                    {p}
                  </Link>
                )}
              </span>
            );
          })}
        </div>

        {page < totalPages ? (
          <Link
            href={linkFor(page + 1)}
            className="px-4 h-10 flex items-center text-sm text-ink-soft hover:text-mocha transition-colors border border-bone hover:border-mocha"
          >
            הבא ←
          </Link>
        ) : (
          <span className="px-4 h-10 flex items-center text-sm text-ink-soft/40 border border-bone/50 cursor-not-allowed">
            הבא ←
          </span>
        )}
      </div>

      <div className="text-xs tracking-[0.2em] uppercase text-ink-soft">
        עמוד {page} מתוך {totalPages}
      </div>
    </nav>
  );
}
