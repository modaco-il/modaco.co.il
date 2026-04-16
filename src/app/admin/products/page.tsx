export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "טיוטה", className: "bg-gray-100 text-gray-700" },
  ACTIVE: { label: "פעיל", className: "bg-green-100 text-green-700" },
  ARCHIVED: { label: "ארכיון", className: "bg-red-100 text-red-700" },
};

export default async function ProductsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { q = "", category = "", status = "" } = await searchParams;

  const where: any = {};
  if (q.trim()) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { supplierSku: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = { slug: category };
  if (status) where.status = status;

  const [products, cats] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        variants: { take: 1, where: { isDefault: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.category.findMany({
      select: { slug: true, name: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">מוצרים</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700"
        >
          <span>+</span>
          מוצר חדש
        </Link>
      </div>

      <form method="GET" className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="חיפוש לפי שם או מק״ט..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
        />
        <div className="flex gap-3 flex-wrap">
          <select name="category" defaultValue={category} className="px-3 py-2 border border-gray-200 rounded text-sm">
            <option value="">כל הקטגוריות</option>
            {cats.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name} ({c._count.products})</option>
            ))}
          </select>
          <select name="status" defaultValue={status} className="px-3 py-2 border border-gray-200 rounded text-sm">
            <option value="">כל הסטטוסים</option>
            <option value="ACTIVE">פעיל</option>
            <option value="DRAFT">טיוטה</option>
            <option value="ARCHIVED">ארכיון</option>
          </select>
          <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-sm rounded">
            סנן
          </button>
          {(q || category || status) && (
            <Link href="/admin/products" className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900">
              נקה
            </Link>
          )}
        </div>
      </form>

      <div className="text-sm text-gray-500">
        {products.length === 100 ? "מציג 100 ראשונים" : `נמצאו ${products.length} מוצרים`}
      </div>

      <div className="space-y-3">
        {products.map((p) => {
          const price = p.variants[0]?.priceOverride ?? p.basePrice;
          return (
            <Link
              key={p.id}
              href={`/admin/products/${p.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                  {p.images[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                      ללא
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-3 mt-0.5">
                    <span>{p.category?.name || "—"}</span>
                    {p.supplierSku && <span className="text-xs">{p.supplierSku}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusConfig[p.status].className}`}>
                      {statusConfig[p.status].label}
                    </span>
                  </div>
                </div>
                <div className="text-left font-bold">₪{price.toLocaleString()}</div>
              </div>
            </Link>
          );
        })}
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">אין מוצרים תואמים</div>
        )}
      </div>
    </div>
  );
}
