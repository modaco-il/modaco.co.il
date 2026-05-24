export const dynamic = "force-dynamic";

/**
 * /admin/reports — operational analytics in plain Hebrew.
 *
 * Three lenses, all default to last-30-days but switchable:
 *   1. Revenue — total + by day + by status (PAID/PENDING/CANCELLED)
 *   2. Products — top 10 by units sold + by revenue
 *   3. Customers — top 10 by spend (LTV)
 *
 * No charting lib — all visualisations are CSS bar graphs so the
 * report renders fast and prints cleanly.
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ range?: string }>;
}

type RangeKey = "7" | "30" | "90" | "365";
const RANGE_LABELS: Record<RangeKey, string> = {
  "7": "7 ימים",
  "30": "30 ימים",
  "90": "90 ימים",
  "365": "שנה",
};

export default async function ReportsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { range = "30" } = await searchParams;
  const days = parseInt(range, 10) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [orders, customers] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: since } },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { id: true, name: true } } },
            },
          },
        },
        customer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Customers created in the period (for "new vs returning" signal)
    db.customer.count({ where: { createdAt: { gte: since } } }),
  ]);

  const paidOrders = orders.filter((o) =>
    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status),
  );
  const cancelledOrders = orders.filter((o) =>
    ["CANCELLED", "REFUNDED"].includes(o.status),
  );
  const pendingOrders = orders.filter((o) => o.status === "PENDING");

  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = paidOrders.length
    ? totalRevenue / paidOrders.length
    : 0;

  // ── Revenue by day (paid orders only) ────────────────────────────────
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of paidOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + o.total);
  }
  const dailyEntries = [...dailyMap.entries()].sort();
  const maxDaily = Math.max(1, ...dailyEntries.map((e) => e[1]));

  // ── Top products by units + revenue ──────────────────────────────────
  const productStats = new Map<
    string,
    { id: string; name: string; units: number; revenue: number }
  >();
  for (const o of paidOrders) {
    for (const it of o.items) {
      const p = it.variant.product;
      const prev = productStats.get(p.id) || {
        id: p.id,
        name: p.name,
        units: 0,
        revenue: 0,
      };
      prev.units += it.quantity;
      prev.revenue += it.total;
      productStats.set(p.id, prev);
    }
  }
  const topByUnits = [...productStats.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, 10);
  const topByRevenue = [...productStats.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ── Top customers by spend ───────────────────────────────────────────
  const customerStats = new Map<
    string,
    { id: string; name: string; orderCount: number; spend: number }
  >();
  for (const o of paidOrders) {
    if (!o.customer) continue;
    const key = o.customer.id;
    const name =
      o.customer.user?.name ||
      o.customer.user?.email ||
      "ללא שם";
    const prev = customerStats.get(key) || {
      id: key,
      name,
      orderCount: 0,
      spend: 0,
    };
    prev.orderCount += 1;
    prev.spend += o.total;
    customerStats.set(key, prev);
  }
  const topCustomers = [...customerStats.values()]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">דוחות</h1>
        <div className="flex gap-1 border border-gray-200 rounded-lg p-1 bg-white">
          {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
            <Link
              key={k}
              href={`/admin/reports?range=${k}`}
              className={`px-3 py-1.5 text-xs rounded ${
                range === k
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {RANGE_LABELS[k]}
            </Link>
          ))}
        </div>
      </div>

      {/* Top-line KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          label="הכנסה"
          value={`₪${totalRevenue.toLocaleString()}`}
          accent
        />
        <Kpi label="הזמנות שולמו" value={paidOrders.length} />
        <Kpi
          label="ערך הזמנה ממוצע"
          value={`₪${Math.round(avgOrderValue).toLocaleString()}`}
        />
        <Kpi label="לקוחות חדשים" value={customers} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Kpi label="ממתינות" value={pendingOrders.length} warning={pendingOrders.length > 0} />
        <Kpi label="בוטלו" value={cancelledOrders.length} />
        <Kpi
          label="סה״כ הזמנות"
          value={orders.length}
        />
      </div>

      {/* Daily revenue */}
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">
          הכנסה יומית ({RANGE_LABELS[range as RangeKey] || `${days} ימים`})
        </div>
        {totalRevenue === 0 ? (
          <div className="text-center py-8 text-sm text-gray-400">
            אין הכנסות בטווח הזה
          </div>
        ) : (
          <div className="space-y-1">
            {dailyEntries.slice(-30).map(([date, amount]) => (
              <div key={date} className="flex items-center gap-2 text-xs">
                <div className="w-20 text-gray-500 font-mono" dir="ltr">
                  {date.slice(5)}
                </div>
                <div className="flex-1 bg-gray-100 rounded h-5 overflow-hidden relative">
                  <div
                    className="absolute inset-y-0 right-0 bg-gradient-to-l from-blue-500 to-blue-400"
                    style={{ width: `${(amount / maxDaily) * 100}%` }}
                  />
                </div>
                <div className="w-20 text-left tabular-nums">
                  {amount > 0 ? `₪${amount.toLocaleString()}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top products — 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankList
          title="מוצרים מובילים לפי יחידות"
          empty="אין נתוני מכירות"
          items={topByUnits.map((p) => ({
            id: p.id,
            href: `/admin/products/${p.id}`,
            primary: p.name,
            secondary: `₪${p.revenue.toLocaleString()} הכנסה`,
            value: `${p.units}`,
            valueLabel: "יח׳",
          }))}
        />
        <RankList
          title="מוצרים מובילים לפי הכנסה"
          empty="אין נתוני מכירות"
          items={topByRevenue.map((p) => ({
            id: p.id,
            href: `/admin/products/${p.id}`,
            primary: p.name,
            secondary: `${p.units} יח׳ נמכרו`,
            value: `₪${p.revenue.toLocaleString()}`,
          }))}
        />
      </div>

      {/* Top customers */}
      <RankList
        title="לקוחות מובילים"
        empty="אין לקוחות בטווח הזה"
        items={topCustomers.map((c) => ({
          id: c.id,
          href: `/admin/customers/${c.id}`,
          primary: c.name,
          secondary: `${c.orderCount} הזמנות`,
          value: `₪${c.spend.toLocaleString()}`,
        }))}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
  warning,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-lg p-4 ${
        warning
          ? "border-amber-300 bg-amber-50"
          : accent
            ? "border-blue-200 bg-blue-50/40"
            : "border-gray-200"
      }`}
    >
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div
        className={`text-2xl font-bold mt-1 ${
          warning
            ? "text-amber-700"
            : accent
              ? "text-blue-700"
              : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

interface RankItem {
  id: string;
  href: string;
  primary: string;
  secondary: string;
  value: string;
  valueLabel?: string;
}

function RankList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: RankItem[];
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        {title}
      </div>
      {items.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-400">{empty}</div>
      ) : (
        <ol className="space-y-1">
          {items.map((it, idx) => (
            <li key={it.id}>
              <Link
                href={it.href}
                className="flex items-center justify-between gap-3 py-2 hover:bg-gray-50 -mx-2 px-2 rounded"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs text-gray-400 font-mono w-5">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {it.primary}
                    </div>
                    <div className="text-xs text-gray-500">{it.secondary}</div>
                  </div>
                </div>
                <div className="text-left text-sm font-bold whitespace-nowrap">
                  {it.value}
                  {it.valueLabel && (
                    <span className="text-xs text-gray-400 font-normal mr-1">
                      {it.valueLabel}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
