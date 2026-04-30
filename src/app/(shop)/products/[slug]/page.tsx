import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/shop/product-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

// decodeURIComponent throws on malformed UTF-8 (e.g. raw Hebrew bytes from
// clients that don't pre-encode). A 500 from the renderer is the worst
// possible UX — the user just sees a blank error. Treat any decode failure
// as "not found" instead. Browsers always send pre-encoded URLs, so this
// only affects misbehaving scrapers/curl/server-to-server callers.
function safeDecode(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = safeDecode(raw);
  if (!slug) return {};
  const product = await db.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  if (!product) return {};

  const image = product.images[0]?.url;
  return {
    title: product.seoTitle || product.name,
    description:
      product.seoDescription ||
      product.description?.slice(0, 160) ||
      `${product.name} — פרזול ואקססוריז לבית מהמותגים המובילים בעולם | Modaco`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: image ? [{ url: image, alt: product.name }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = safeDecode(raw);
  if (!slug) notFound();

  const product = await db.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
      supplier: true,
      variants: {
        orderBy: { sortOrder: "asc" },
      },
      images: { orderBy: { sortOrder: "asc" } },
      crossSellFrom: {
        include: {
          relatedProduct: {
            include: {
              images: { take: 1 },
              variants: { where: { isDefault: true }, take: 1 },
            },
          },
        },
        take: 6,
      },
    },
  });

  if (!product) notFound();

  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const price = defaultVariant?.priceOverride ?? product.basePrice;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images.map((i) => i.url).filter(Boolean),
    sku: defaultVariant?.sku,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: "ILS",
      availability:
        defaultVariant?.stockStatus === "OUT_OF_STOCK"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `https://modaco.co.il/products/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "Modaco",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
