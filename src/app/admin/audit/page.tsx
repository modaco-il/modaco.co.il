export const dynamic = "force-dynamic";

/**
 * /admin/audit — append-only log of admin actions.
 *
 * Writes come from: order status changes, message status changes,
 * payment-link generation, product CRUD (when product code starts to
 * write them too). The schema is permissive (free-form action +
 * entityType strings) so adding new writers doesn't need a migration.
 *
 * Filters: by entityType, by actor, by date range (defaults to 14d).
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ entity?: string; actor?: string; days?: string }>;
}

const actionLabels: Record<string, string> = {
  "order.status_changed": "שינוי סטטוס הזמנה",
  "contact_message.status_changed": "שינוי סטטוס הודעה",
  "payment_link_generated": "נוצר קישור תשלום",
  "payment_link_failed": "כשל ביצירת קישור תשלום",
};

const entityHrefs: Record<string, (id: string) => string> = {
  Order: (id) => `/admin/orders/${id}`,
  ContactMessage: (id) => `/admin/messages/${id}`,
  Product: (id) => `/admin/products/${id}`,
  Customer: (id) => `/admin/customers/${id}`,
};

export default async function AuditPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { entity = "", actor = "", days = "14" } = await searchParams;
  const sinceDays = parseInt(days, 10) || 14;
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);

  const where: any = { createdAt: { gte: since } };
  if (entity) where.entityType = entity;
  if (actor) where.actor = { contains: actor, mode: "insensitive" };

  const [logs, entityTypes, actors] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.auditLog
      .groupBy({ by: ["entityType"], _count: { entityType: true } })
      .then((rows) =>
        rows
          .sort((a, b) => b._count.entityType - a._count.entityType)
          .map((r) => ({ name: r.entityType, count: r._count.entityType })),
      ),
    db.auditLog
      .groupBy({ by: ["actor"], _count: { actor: true } })
      .then((rows) =>
        rows
          .sort((a, b) => b._count.actor - a._count.actor)
          .slice(0, 20)
          .map((r) => ({ name: r.actor, count: r._count.actor })),
      ),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">היסטוריית פעולות</h1>
        <div className="text-sm text-gray-500">
          {logs.length} רשומות{logs.length === 200 && " (200 אחרונות)"}
        </div>
      </div>

      <form method="GET" className="flex gap-2 flex-wrap items-end">
        <label className="flex-1 min-w-[150px]">
          <span className="block text-xs text-gray-500 mb-1">סוג ישות</span>
          <select
            name="entity"
            defaultValue={entity}
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">הכל</option>
            {entityTypes.map((e) => (
              <option key={e.name} value={e.name}>
                {e.name} ({e.count})
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 min-w-[150px]">
          <span className="block text-xs text-gray-500 mb-1">מבצע</span>
          <input
            name="actor"
            defaultValue={actor}
            placeholder="email / system / yarin"
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm"
          />
        </label>
        <label className="min-w-[90px]">
          <span className="block text-xs text-gray-500 mb-1">חזרה</span>
          <select
            name="days"
            defaultValue={days}
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm"
          >
            <option value="1">יום</option>
            <option value="7">7 ימים</option>
            <option value="14">14 ימים</option>
            <option value="30">30 ימים</option>
            <option value="90">90 ימים</option>
          </select>
        </label>
        <button className="h-9 px-5 bg-blue-600 text-white text-sm rounded-lg">
          סנן
        </button>
        {(entity || actor || days !== "14") && (
          <Link
            href="/admin/audit"
            className="h-9 px-3 text-sm text-gray-500 hover:text-gray-900 flex items-center"
          >
            נקה
          </Link>
        )}
      </form>

      {actors.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 flex gap-2 flex-wrap text-xs">
          <span className="text-gray-500">מבצעים נפוצים:</span>
          {actors.map((a) => (
            <Link
              key={a.name}
              href={`/admin/audit?actor=${encodeURIComponent(a.name)}&days=${days}`}
              className={`px-2 py-0.5 rounded font-mono ${
                actor === a.name
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white border border-gray-200 hover:border-blue-300"
              }`}
              dir="ltr"
            >
              {a.name} ({a.count})
            </Link>
          ))}
        </div>
      )}

      {/* Log */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            אין רשומות בטווח הזה
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.map((log) => {
              const href = entityHrefs[log.entityType]?.(log.entityId);
              const data =
                log.data && typeof log.data === "object"
                  ? (log.data as Record<string, unknown>)
                  : null;
              return (
                <li key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {actionLabels[log.action] || log.action}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                          {log.entityType}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="font-mono" dir="ltr">
                          {log.actor}
                        </span>
                        {href && (
                          <>
                            {" · "}
                            <Link
                              href={href}
                              className="text-blue-600 hover:underline"
                            >
                              לצפייה →
                            </Link>
                          </>
                        )}
                      </div>
                      {data && Object.keys(data).length > 0 && (
                        <div className="text-xs text-gray-600 mt-2 font-mono bg-gray-50 rounded p-2 break-all" dir="ltr">
                          {JSON.stringify(data, null, 0)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("he-IL")}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
