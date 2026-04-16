export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PAID: "שולמה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  DELIVERED: "הגיעה",
  CANCELLED: "בוטלה",
  REFUNDED: "הוחזרה",
};

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    totalCustomers,
    todayOrders,
    weekOrders,
    pendingOrders,
    abandonedCarts,
    recentOrders,
    categoryBreakdown,
  ] = await Promise.all([
    db.product.count({ where: { status: "ACTIVE" } }),
    db.customer.count(),
    db.order.findMany({
      where: { createdAt: { gte: today } },
      select: { total: true, status: true },
    }),
    db.order.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { total: true, status: true },
    }),
    db.order.count({ where: { status: "PENDING" } }),
    db.cart.count({ where: { abandonedAt: { not: null }, convertedAt: null } }),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: { include: { user: true } } },
    }),
    db.category.findMany({
      select: { name: true, slug: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const todayRevenue = todayOrders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const weekRevenue = weekOrders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">לוח בקרה</h1>
        <p className="text-sm text-gray-500">
          ברוך הבא, {session.user.name || session.user.email}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="הזמנות היום" value={todayOrders.length} />
        <Kpi label="הכנסה היום" value={`₪${todayRevenue.toLocaleString()}`} />
        <Kpi label="שבוע אחרון" value={`${weekOrders.length} · ₪${weekRevenue.toLocaleString()}`} />
        <Kpi label="עגלות נטושות" value={abandonedCarts} warning={abandonedCarts > 0} />
        <Kpi label="מוצרים פעילים" value={totalProducts} />
        <Kpi label="לקוחות רשומים" value={totalCustomers} />
        <Kpi label="הזמנות ממתינות" value={pendingOrders} warning={pendingOrders > 0} />
        <Kpi label="קטגוריות" value={categoryBreakdown.length} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">הזמנות אחרונות</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
            כל ההזמנות →
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">אין הזמנות עדיין</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-right">מס׳</th>
                  <th className="px-4 py-3 text-right">לקוח</th>
                  <th className="px-4 py-3 text-right">סכום</th>
                  <th className="px-4 py-3 text-right">סטטוס</th>
                  <th className="px-4 py-3 text-right">תאריך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="text-blue-600 hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.customer?.user?.name || o.customer?.user?.email || "—"}</td>
                    <td className="px-4 py-3 font-medium">₪{o.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100">
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("he-IL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">מוצרים לפי קטגוריה</h2>
          <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
            לקטלוג מוצרים →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {categoryBreakdown.map((c) => (
            <Link
              key={c.slug}
              href={`/admin/products?category=${c.slug}`}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <div className="text-xs text-gray-500">{c.name}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{c._count.products}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, warning }: { label: string; value: string | number; warning?: boolean }) {
  return (
    <div className={`bg-white border rounded-lg p-4 ${warning ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}>
      <div className="text-xs text-gray-500 tracking-wide uppercase">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${warning ? "text-amber-700" : "text-gray-900"}`}>{value}</div>
    </div>
  );
}
