export const dynamic = "force-dynamic";

/**
 * /admin/settings — operational settings for the storefront.
 *
 * Three sections:
 *   1. עסק   — read-only summary of business details (legal name, tax id,
 *              bank, phone). Sourced from env so they're consistent with
 *              what Morning sees.
 *   2. משלוחים — read-only display of the current B2C shipping policy
 *              (free over ₪500, ₪39 below). Editing it requires changing
 *              `src/lib/actions/checkout.ts` for now — there's no
 *              settings table yet, intentionally.
 *   3. קבוצות לקוחות — full CRUD on B2B customer groups (architect,
 *              contractor, VIP). Each group has a default discount that
 *              the pricing engine applies.
 *   4. ערוצי שילוט — Resend, Morning, Anthropic, Inngest health flags.
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerGroupsManager } from "./customer-groups-manager";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const groups = await db.customerGroup.findMany({
    include: { _count: { select: { customers: true } } },
    orderBy: { name: "asc" },
  });

  const env = {
    morning: !!(process.env.MORNING_API_KEY_ID && process.env.MORNING_API_SECRET),
    resend: !!process.env.RESEND_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    inngest: !!(process.env.INNGEST_EVENT_KEY || process.env.INNGEST_SIGNING_KEY),
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-2xl font-bold">הגדרות</h1>

      {/* Business */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <div className="text-xs uppercase tracking-wider text-gray-500">
          פרטי עסק
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Field label="שם משפטי" value="מודקו - יעקב מויאל" />
          <Field label="ע.מ" value="058886243" />
          <Field label="טלפון" value="052-680-4945" mono />
          <Field label="אימייל" value="yarin@modaco.co.il" mono />
          <Field label="כתובת" value="האומן 1, בית שמש" />
          <Field label="בנק" value="פועלים 12 / סניף 692 / חשבון 557318" mono />
        </dl>
        <p className="text-xs text-gray-500 leading-relaxed mt-2">
          הפרטים האלה מסונכרנים עם החשבונית של Morning. שינוי דורש עדכון
          גם ב-Morning וגם ב-env vars של הפרויקט.
        </p>
      </section>

      {/* Shipping */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <div className="text-xs uppercase tracking-wider text-gray-500">
          מדיניות משלוחים (B2C)
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Field label="עלות משלוח" value="₪39" />
          <Field label="משלוח חינם מעל" value="₪500" />
          <Field label="B2B (הצעת מחיר)" value="לקביעה בהצעה" />
        </dl>
        <p className="text-xs text-gray-500 leading-relaxed mt-2">
          המספרים האלה מקודדים כרגע ב-
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
            src/lib/actions/checkout.ts
          </code>
          . כשהאתר יצמח לאזורי משלוח שונים נקים טבלת ShippingZone.
        </p>
      </section>

      {/* Customer groups */}
      <CustomerGroupsManager initialGroups={groups} />

      {/* Integrations */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-gray-500">
            אינטגרציות חיצוניות
          </div>
          <Link
            href="/admin/dashboard"
            className="text-xs text-blue-600 hover:underline"
          >
            בדיקת בריאות חיה →
          </Link>
        </div>
        <ul className="space-y-2 text-sm">
          <IntegrationRow
            label="Morning (חשבוניות + סליקה)"
            ok={env.morning}
            note="MORNING_API_KEY_ID + MORNING_API_SECRET"
          />
          <IntegrationRow
            label="Resend (מיילים)"
            ok={env.resend}
            note="RESEND_API_KEY · from=orders@modaco.co.il"
          />
          <IntegrationRow
            label="Anthropic (סוכן AI)"
            ok={env.anthropic}
            note="ANTHROPIC_API_KEY"
          />
          <IntegrationRow
            label="Inngest (אוטומציות)"
            ok={env.inngest}
            note="INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY"
          />
        </ul>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={`text-gray-900 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function IntegrationRow({
  label,
  ok,
  note,
}: {
  label: string;
  ok: boolean;
  note: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-1.5 inline-block w-2 h-2 rounded-full flex-shrink-0 ${
          ok ? "bg-emerald-500" : "bg-red-500"
        }`}
        aria-hidden
      />
      <div className="flex-1">
        <div className="text-gray-900">{label}</div>
        <div className="text-xs text-gray-500 font-mono">{note}</div>
      </div>
      <span
        className={`text-xs ${ok ? "text-emerald-700" : "text-red-700"} mt-0.5`}
      >
        {ok ? "מוגדר" : "חסר"}
      </span>
    </li>
  );
}
