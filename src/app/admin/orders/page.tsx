export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PAID: "שולמה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  DELIVERED: "הגיעה",
  CANCELLED: "בוטלה",
  REFUNDED: "הוחזרה",
};

export default async function OrdersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { status = "" } = await searchParams;
  const where = status ? { status: status as any } : {};

  const orders = await db.order.findMany({
    where,
    include: {
      customer: { include: { user: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const tabs = [
    { value: "", label: "הכל" },
    { value: "PENDING", label: "ממתינות" },
    { value: "PAID", label: "שולמו" },
    { value: "PROCESSING", label: "בטיפול" },
    { value: "SHIPPED", label: "נשלחו" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">הזמנות</h1>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value ? `/admin/orders?status=${t.value}` : "/admin/orders"}
            className={`px-4 py-2 text-sm border-b-2 transition-colors whitespace-nowrap ${
              status === t.value
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">אין הזמנות להצגה</div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-bold">{order.orderNumber}</div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {order.customer?.user?.name || order.customer?.user?.email || "—"}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString("he-IL")} · {order.items.length} פריטים
                  </div>
                </div>
                <div className="text-left">
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColors[order.status]}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  <div className="font-bold mt-1">₪{order.total.toLocaleString()}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
