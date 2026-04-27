import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Reveal } from "@/components/shop/reveal";
import { InfiniteProducts } from "@/components/shop/infinite-products";

interface Props {
  params: Promise<{ slug: string }>;
}

const PAGE_SIZE = 24;

const categoryMeta: Record<string, { og: string; tagline: string }> = {
  handles: { og: "/images/domicile/categories/handles.jpg", tagline: "ידיות Domicile לארונות ומטבחים — לב החנות" },
  hinges: { og: "/images/domicile/categories/hinges.jpg", tagline: "צירי Blum ו-Domicile באיכות שווייצרית" },
  slides: { og: "/images/domicile/categories/slides.jpg", tagline: "מסילות Movento, Tandem ו-Blumotion" },
  "lift-systems": { og: "/images/domicile/categories/lift-systems.jpg", tagline: "מנגנוני הרמה Aventos לחזיתות עליונות" },
  bath: { og: "/images/domicile/categories/bath.jpg", tagline: "סדרות מלאות לחדרי רחצה מ-Domicile" },
  faucets: { og: "/images/domicile/categories/faucets.jpg", tagline: "ברזי מטבח Blanco ו-Delta — מים ששופכים עיצוב" },
  "faucets-blanco": { og: "/images/domicile/categories/faucets.jpg", tagline: "ברזי מטבח Blanco — איכות גרמנית" },
  "faucets-delta": { og: "/images/domicile/categories/faucets.jpg", tagline: "ברזי מטבח Delta — עיצוב אמריקאי" },
  legs: { og: "/images/domicile/categories/legs.jpg", tagline: "רגליים לריהוט, שולחנות ודלפקים" },
  mirrors: { og: "/images/domicile/categories/mirrors.jpg", tagline: "מראות מעוצבות לאמבטיה וסלון" },
  bins: { og: "/images/domicile/categories/bins.jpg", tagline: "פחי אשפה למטבח ולאמבטיה" },
  decorative: { og: "/images/domicile/categories/decorative.jpg", tagline: "פריטים דקורטיביים לבית — מתלי יין, חלוקות, מארגנים" },
  accessories: { og: "/images/modaco/5F7A9697.webp", tagline: "אקססוריז לבית מ-Floralis" },
  cladding: { og: "/images/domicile/categories/cladding.jpg", tagline: "לוחות גמישים לחיפוי קירות וחזיתות" },
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

export default async function CategoryPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: {
              products: {
                where: { status: "ACTIVE", images: { some: {} } },
              },
            },
          },
        },
      },
    },
  });

  if (!category) notFound();

  // Only show subcategory pills that have products (with images) in them
  const visibleChildren = category.children.filter((c) => c._count.products > 0);
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  // Only show products that actually have images — avoids "תמונה חסרה" cards
  // leaking into public browsing until Yarin uploads replacements.
  const productWhere = {
    categoryId: { in: categoryIds },
    status: "ACTIVE" as const,
    images: { some: {} },
  };

  const [totalCount, products] = await Promise.all([
    db.product.count({ where: productWhere }),
    db.product.findMany({
      where: productWhere,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: true,
        variants: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      take: PAGE_SIZE,
    }),
  ]);

  const initialItems = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price:
      p.variants.find((v) => v.isDefault)?.priceOverride ??
      p.basePrice,
    image: p.images[0]?.url || null,
    imageIsLifestyle: p.images[0]?.isLifestyle ?? false,
    category: p.category?.name || "",
    categorySlug: p.category?.slug,
    colors: p.variants.map((v) => v.name),
  }));

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
              ? `${totalCount} מוצרים בקטלוג`
              : "אין מוצרים בקטגוריה"}
          </p>
        </Reveal>
      </div>

      {/* Subcategories — only those with products */}
      {visibleChildren.length > 0 && (
        <div className="flex gap-3 mb-12 flex-wrap">
          {visibleChildren.map((child) => (
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

      {totalCount > 0 ? (
        <InfiniteProducts
          initialItems={initialItems}
          totalCount={totalCount}
          categorySlug={slug}
          pageSize={PAGE_SIZE}
        />
      ) : (
        <div className="text-center py-32 text-ink-soft font-light">
          <p className="text-lg">עדיין אין מוצרים בקטגוריה זו</p>
          <p className="text-sm mt-2">מוצרים חדשים מתווספים בקרוב</p>
        </div>
      )}
    </div>
  );
}

