export const dynamic = "force-dynamic";

/**
 * /admin/messages — inbox for the public contact form.
 *
 * The form lives at /contact (and footer); each submission writes a
 * ContactMessage row with status NEW. Yarin works the inbox by
 * promoting NEW → IN_PROGRESS once he's reached out, then → RESOLVED.
 *
 * Filter tabs default to NEW + IN_PROGRESS combined ("פתוחות") because
 * that's the work-queue. RESOLVED / SPAM are review-only.
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

const statusLabels: Record<string, string> = {
  NEW: "חדשה",
  IN_PROGRESS: "בטיפול",
  RESOLVED: "טופלה",
  SPAM: "ספאם",
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 border-blue-300",
  IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-300",
  RESOLVED: "bg-gray-100 text-gray-700 border-gray-200",
  SPAM: "bg-red-50 text-red-600 border-red-200",
};

export default async function MessagesPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { status = "open", q = "" } = await searchParams;

  // Default view ("open") is NEW + IN_PROGRESS — that's the work queue.
  const where: any = {};
  if (status === "open") {
    where.status = { in: ["NEW", "IN_PROGRESS"] };
  } else if (status) {
    where.status = status;
  }
  if (q.trim()) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ];
  }

  const [messages, counts] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.contactMessage.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const countBy = Object.fromEntries(
    counts.map((c) => [c.status, c._count.status]),
  ) as Record<string, number>;
  const openCount = (countBy.NEW || 0) + (countBy.IN_PROGRESS || 0);

  const tabs = [
    { value: "open", label: "פתוחות", count: openCount },
    { value: "NEW", label: "חדשות", count: countBy.NEW || 0 },
    { value: "IN_PROGRESS", label: "בטיפול", count: countBy.IN_PROGRESS || 0 },
    { value: "RESOLVED", label: "טופלו", count: countBy.RESOLVED || 0 },
    { value: "SPAM", label: "ספאם", count: countBy.SPAM || 0 },
    { value: "", label: "הכל" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">הודעות יצירת קשר</h1>
        <div className="text-sm text-gray-500">
          {openCount > 0 ? (
            <span className="text-amber-700 font-medium">
              {openCount} פתוחות לטיפול
            </span>
          ) : (
            <span>כל ההודעות טופלו ✓</span>
          )}
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2">
        <input type="hidden" name="status" value={status} />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="חיפוש לפי שם / טלפון / מייל / טקסט..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
        />
        {q && (
          <Link
            href={`/admin/messages${status ? `?status=${status}` : ""}`}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            נקה
          </Link>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg"
        >
          חפש
        </button>
      </form>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={
              t.value
                ? `/admin/messages?status=${t.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`
                : `/admin/messages${q ? `?q=${encodeURIComponent(q)}` : ""}`
            }
            className={`px-4 py-2 text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              status === t.value
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  status === t.value
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {q ? "אין הודעות תואמות" : "אין הודעות בקטגוריה הזו"}
          </div>
        ) : (
          messages.map((m) => (
            <Link
              key={m.id}
              href={`/admin/messages/${m.id}`}
              className={`block bg-white border rounded-lg p-4 hover:border-blue-500 transition-colors ${
                m.status === "NEW" ? "border-blue-300" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{m.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs border ${statusColors[m.status]}`}
                    >
                      {statusLabels[m.status]}
                    </span>
                    {m.source !== "contact_form" && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">
                        {m.source}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {m.phone}
                    {m.email && <> · {m.email}</>}
                  </div>
                  {m.subject && (
                    <div className="text-sm font-medium text-gray-800 mt-1">
                      {m.subject}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {m.message}
                  </div>
                </div>
                <div className="text-left text-xs text-gray-400 whitespace-nowrap">
                  {new Date(m.createdAt).toLocaleDateString("he-IL")}
                  <br />
                  {new Date(m.createdAt).toLocaleTimeString("he-IL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </Link>
          ))
        )}
        {messages.length === 100 && (
          <div className="text-center py-3 text-xs text-gray-400">
            מציג 100 ראשונות · חפש כדי לצמצם
          </div>
        )}
      </div>
    </div>
  );
}
