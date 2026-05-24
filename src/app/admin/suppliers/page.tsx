export const dynamic = "force-dynamic";

/**
 * /admin/suppliers — supplier directory.
 *
 * Each supplier is the source of one or more products (Domicile, Blum,
 * etc.). The Add-from-URL wizard auto-creates suppliers on first import.
 *
 * The list view shows: name, product count, last sync timestamp,
 * website. Click → detail page with all products from that supplier.
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SuppliersPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const suppliers = await db.supplier.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">ספקים</h1>
        <div className="text-sm text-gray-500">
          {suppliers.length} ספקים · {suppliers.reduce((s, x) => s + x._count.products, 0)} מוצרים
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        ספקים נוצרים אוטומטית כשמיובא מוצר דרך{" "}
        <Link href="/admin/products/from-url" className="underline">
          הוסף מקישור ספק
        </Link>
        . כרגע אין UI ליצירה ידנית כאן — אם צריך, אפשר להוסיף דרך הסוכן.
      </div>

      <div className="space-y-2">
        {suppliers.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            עדיין לא הוגדרו ספקים
          </div>
        ) : (
          suppliers.map((s) => (
            <Link
              key={s.id}
              href={`/admin/suppliers/${s.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-medium">{s.name}</div>
                  {s.website && (
                    <div
                      className="text-xs text-gray-500 mt-0.5 font-mono break-all"
                      dir="ltr"
                    >
                      {s.website}
                    </div>
                  )}
                </div>
                <div className="text-left text-sm whitespace-nowrap">
                  <div className="font-medium">{s._count.products} מוצרים</div>
                  {s.lastSyncedAt && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      סונכרן {new Date(s.lastSyncedAt).toLocaleDateString("he-IL")}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
