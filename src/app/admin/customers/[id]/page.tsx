export const dynamic = "force-dynamic";

/**
 * /admin/customers/[id] — full customer profile.
 *
 * The view Yarin opens when a customer calls or messages: contact details,
 * addresses, all past orders, lifetime value, B2B group + tax id, and a
 * notes box he can keep updated.
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CustomerNotesEditor } from "./notes-editor";

const orderStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-orange-100 text-orange-800",
};

const orderStatusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PAID: "שולמה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  DELIVERED: "הגיעה",
  CANCELLED: "בוטלה",
  REFUNDED: "הוחזרה",
};

function toWaPhone(p: string | null | undefined): string | null {
  if (!p) return null;
  const clean = p.replace(/[^\d]/g, "");
  if (!clean) return null;
  return clean.startsWith("0") ? "972" + clean.slice(1) : clean;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      user: true,
      group: true,
      addresses: { orderBy: { isDefault: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          paymentRef: true,
        },
      },
    },
  });
  if (!customer) notFound();

  const totalSpent = customer.orders
    .filter((o) => !["CANCELLED", "REFUNDED"].includes(o.status))
    .reduce((s, o) => s + o.total, 0);
  const paidCount = customer.orders.filter((o) =>
    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status),
  ).length;
  const phone =
    customer.addresses[0]?.phone ||
    customer.user?.phone ||
    null;
  const waPhone = toWaPhone(phone);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/admin/customers"
          className="text-gray-500 hover:text-gray-900"
        >
          ← לקוחות
        </Link>
      </div>

      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">
            {customer.user?.name || customer.user?.email || "ללא שם"}
          </h1>
          <div className="text-sm text-gray-500 mt-1 space-x-2 space-x-reverse">
            {customer.user?.email && <span>{customer.user.email}</span>}
            {phone && <span>· {phone}</span>}
          </div>
          {customer.group && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
              {customer.group.displayName}
              {customer.group.discountPercent > 0 &&
                ` · -${customer.group.discountPercent}%`}
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {waPhone && (
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-2"
            >
              WhatsApp
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="h-10 px-4 bg-gray-800 hover:bg-gray-900 text-white text-sm rounded-lg flex items-center gap-2"
            >
              {phone}
            </a>
          )}
        </div>
      </header>

      {/* Stats — 1col on phone (LTV can be 8+ digits), 3col on tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="הזמנות" value={customer.orders.length} />
        <Stat label="הזמנות שולמו" value={paidCount} />
        <Stat label="ערך לקוח" value={`₪${totalSpent.toLocaleString()}`} accent />
      </div>

      {/* Business */}
      {(customer.company || customer.taxId) && (
        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
            פרטי עסק
          </div>
          <div className="text-sm space-y-1">
            {customer.company && (
              <div><strong>שם העסק:</strong> {customer.company}</div>
            )}
            {customer.taxId && (
              <div><strong>ע.מ / ח.פ:</strong> {customer.taxId}</div>
            )}
          </div>
        </section>
      )}

      {/* Addresses */}
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          כתובות ({customer.addresses.length})
        </div>
        {customer.addresses.length === 0 ? (
          <div className="text-sm text-gray-400">אין כתובות שמורות</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {customer.addresses.map((addr) => (
              <li
                key={addr.id}
                className="flex items-start gap-2 p-2 rounded bg-gray-50"
              >
                {addr.isDefault && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 mt-0.5">
                    ברירת מחדל
                  </span>
                )}
                <div className="flex-1">
                  <div>
                    {addr.fullName}
                    {addr.label && (
                      <span className="text-xs text-gray-400 mr-1">
                        ({addr.label})
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600">
                    {addr.street}, {addr.city}
                    {addr.zipCode && <> {addr.zipCode}</>}
                  </div>
                  {addr.phone && (
                    <div className="text-xs text-gray-500">{addr.phone}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notes — Yarin's personal memo */}
      <CustomerNotesEditor
        customerId={customer.id}
        initialNotes={customer.notes || ""}
      />

      {/* Order history */}
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          היסטוריית הזמנות ({customer.orders.length})
        </div>
        {customer.orders.length === 0 ? (
          <div className="text-sm text-gray-400">עדיין לא בוצעו הזמנות</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {customer.orders.map((o) => (
              <li key={o.id} className="py-3">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                >
                  <div>
                    <div className="font-medium">{o.orderNumber}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleString("he-IL")}
                    </div>
                  </div>
                  <div className="text-left">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${orderStatusColors[o.status]}`}
                    >
                      {orderStatusLabels[o.status] || o.status}
                    </span>
                    <div className="text-sm font-medium mt-1">
                      ₪{o.total.toLocaleString()}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-lg p-4 ${
        accent ? "border-blue-200 bg-blue-50/40" : "border-gray-200"
      }`}
    >
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div
        className={`text-2xl font-bold mt-1 tabular-nums truncate ${accent ? "text-blue-700" : "text-gray-900"}`}
      >
        {value}
      </div>
    </div>
  );
}
