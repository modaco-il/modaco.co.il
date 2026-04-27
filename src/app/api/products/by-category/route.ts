import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const category = await db.category.findUnique({
    where: { slug },
    include: { children: { select: { id: true } } },
  });
  if (!category) {
    return NextResponse.json({ error: "category not found" }, { status: 404 });
  }

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const where = {
    categoryId: { in: categoryIds },
    status: "ACTIVE" as const,
    images: { some: {} },
  };

  const [totalCount, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: { select: { name: true, slug: true } },
        variants: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const items = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price:
      p.variants.find((v) => v.isDefault)?.priceOverride ??
      p.basePrice,
    image: p.images[0]?.url || null,
    category: p.category?.name || "",
    categorySlug: p.category?.slug,
    colors: p.variants.map((v) => v.name),
  }));

  return NextResponse.json({
    items,
    page,
    totalCount,
    hasMore: page * PAGE_SIZE < totalCount,
  });
}
