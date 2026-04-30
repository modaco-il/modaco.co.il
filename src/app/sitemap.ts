export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import type { MetadataRoute } from "next";

const BASE_URL = "https://modaco.co.il";

// sitemaps.org spec requires URL-encoding non-ASCII chars in <loc>. Hebrew
// slugs serialized raw cause two problems: (1) Googlebot may handle them
// inconsistently, (2) basic HTTP clients that don't auto-encode hit the
// site with raw UTF-8 bytes — which produced 500s on /products/[slug]
// because decodeURIComponent rejects malformed sequences.
const encodeSlug = (slug: string): string =>
  slug.split("/").map(encodeURIComponent).join("/");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/catalog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/register`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/accessibility`, changeFrequency: "yearly", priority: 0.4 },
  ];

  // Categories — only those that'll render non-empty after image filter
  const categories = await db.category.findMany({
    select: {
      slug: true,
      _count: {
        select: { products: { where: { status: "ACTIVE", images: { some: {} } } } },
      },
      children: {
        select: {
          _count: {
            select: { products: { where: { status: "ACTIVE", images: { some: {} } } } },
          },
        },
      },
    },
  });
  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((cat) => {
      const ownCount = cat._count.products;
      const childCount = cat.children.reduce((sum, c) => sum + c._count.products, 0);
      return ownCount + childCount > 0 || ["aluminum", "carpentry"].includes(cat.slug);
    })
    .map((cat) => ({
      url: `${BASE_URL}/categories/${cat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Products — only those with images (Google dislikes thin/empty pages)
  const products = await db.product.findMany({
    where: { status: "ACTIVE", images: { some: {} } },
    select: { slug: true, updatedAt: true },
  });
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${encodeSlug(product.slug)}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
