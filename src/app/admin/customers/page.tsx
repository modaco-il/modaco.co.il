export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ q?: string; group?: string }>;
}

const groupColors: Record<string, string> = {
  retail: "bg-gray-100 text-gray-700",
  architect: "bg-purple-100 text-purple-700",
  contractor: "bg-blue-100 text-blue-700",
  vip: "bg-yellow-100 text-yellow-700",
};

export default async function CustomersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { q = "", group = "" } = await searchParams;

  // Search across the joined User (name/email/phone) and Customer.company.
  // Mode: insensitive so Hebrew/casing both work.
  const where: any = {};
  if (q.trim()) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { phone: { contains: q } } },
      { company: { contains: q, mode: "insensitive" } },
      { taxId: { contains: q } },
    ];
  }
  if (group) {
    where.group = { name: group };
  }

  const [customers, groups] = await Promise.all([
    db.customer.findMany({
      where,
      include: {
        user: true,
        group: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.customerGroup.findMany({
      include: { _count: { select: { customers: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">לקוחות</h1>
        <div className="text-sm text-gray-500">
          {customers.length}
          {customers.length === 100 && " (100 ראשונים)"}
        </div>
      </div>

      {/* Search + group filter */}
      <form method="GET" className="flex gap-2 flex-wrap">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="שם / טלפון / מייל / ע.מ / ח.פ / שם עסק..."
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
        />
        <select
          name="group"
          defaultValue={group}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">כל הקבוצות</option>
          {groups.map((g) => (
            <option key={g.id} value={g.name}>
              {g.displayName} ({g._count.customers})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg"
        >
          חפש
        </button>
        {(q || group) && (
          <Link
            href="/admin/customers"
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            נקה
          </Link>
        )}
      </form>

      {/* List */}
      <div className="space-y-2">
        {customers.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {q || group ? "אין לקוחות תואמים" : "עדיין אין לקוחות רשומים"}
          </div>
        ) : (
          customers.map((c) => (
            <Link
              key={c.id}
              href={`/admin/customers/${c.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">
                      {c.user.name || "ללא שם"}
                    </span>
                    {c.group && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${groupColors[c.group.name] || "bg-gray-100 text-gray-700"}`}
                      >
                        {c.group.displayName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {c.user.phone && <span>{c.user.phone}</span>}
                    {c.user.phone && c.user.email && " · "}
                    {c.user.email && <span>{c.user.email}</span>}
                  </div>
                  {c.company && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {c.company}
                      {c.taxId && ` · ח.פ ${c.taxId}`}
                    </div>
                  )}
                </div>
                <div className="text-left text-sm whitespace-nowrap">
                  <div className="font-medium">{c._count.orders} הזמנות</div>
                  <div className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("he-IL")}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
