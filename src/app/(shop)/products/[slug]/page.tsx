import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/shop/product-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const product = await db.product.findUnique({
    where: { slug, status: "ACTIVE" },
  });

  if (!product) return {};

  return {
    title: product.seoTitle || `${product.name} — Modaco`,
    description:
      product.seoDescription ||
      product.description?.slice(0, 160) ||
      `${product.name} — פרזול ואקססוריז לבית | Modaco`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  const product = await db.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
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

  return <ProductDetail product={product} />;
}
