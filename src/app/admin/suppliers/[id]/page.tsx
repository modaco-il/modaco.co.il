export const dynamic = "force-dynamic";

/**
 * /admin/suppliers/[id] — products from a single supplier.
 *
 * Two main uses:
 *   1. Audit — which products came from where, is there a stale price
 *      or a missing image, is the supplier slug consistent.
 *   2. Bulk action shortcut — get a quick view before drafting an
 *      update sync via the agent.
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

const productStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT: "bg-gray-100 text-gray-700",
  ARCHIVED: "bg-red-100 text-red-700",
};

const productStatusLabels: Record<string, string> = {
  ACTIVE: "פעיל",
  DRAFT: "טיוטה",
  ARCHIVED: "ארכיון",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const supplier = await db.supplier.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          category: { select: { name: true, slug: true } },
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!supplier) notFound();

  const byStatus = supplier.products.reduce<Record<string, number>>(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/admin/suppliers"
          className="text-gray-500 hover:text-gray-900"
        >
          ← ספקים
        </Link>
      </div>

      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          {supplier.website && (
            <a
              href={supplier.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline font-mono break-all"
              dir="ltr"
            >
              {supplier.website}
            </a>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {supplier.products.length} מוצרים
          {supplier.lastSyncedAt && (
            <> · עודכן {new Date(supplier.lastSyncedAt).toLocaleDateString("he-IL")}</>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">פעילים</div>
          <div className="text-xl font-bold text-green-700">
            {byStatus.ACTIVE || 0}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">טיוטות</div>
          <div className="text-xl font-bold text-gray-700">
            {byStatus.DRAFT || 0}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">ארכיון</div>
          <div className="text-xl font-bold text-red-700">
            {byStatus.ARCHIVED || 0}
          </div>
        </div>
      </div>

      {supplier.contactInfo && (
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            פרטי קשר
          </div>
          <div className="whitespace-pre-wrap">{supplier.contactInfo}</div>
        </section>
      )}

      <section>
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          מוצרים
        </div>
        {supplier.products.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            אין מוצרים שמשויכים לספק הזה
          </div>
        ) : (
          <div className="space-y-2">
            {supplier.products.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-500"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded flex-shrink-0 overflow-hidden">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {p.category?.name || "—"}
                      {p.supplierSku && (
                        <span className="font-mono mr-2"> · {p.supplierSku}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${productStatusColors[p.status]}`}
                    >
                      {productStatusLabels[p.status]}
                    </span>
                    <div className="text-sm font-medium mt-1">
                      ₪{p.basePrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
