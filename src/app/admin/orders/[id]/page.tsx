export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { OrderActions } from "./order-actions";

interface Props {
  params: Promise<{ id: string }>;
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
  PENDING: "ממתינה לתשלום",
  PAID: "שולמה — לטיפול",
  PROCESSING: "בליקוט",
  SHIPPED: "נשלחה",
  DELIVERED: "התקבלה",
  CANCELLED: "בוטלה",
  REFUNDED: "הוחזרה",
};

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      customer: { include: { user: true } },
      address: true,
      items: {
        include: {
          variant: {
            include: { product: { include: { images: { take: 1 } } } },
          },
        },
      },
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const customerName =
    order.address?.fullName || order.customer?.user?.name || order.customer?.user?.email || "—";
  const customerPhone = order.address?.phone || order.customer?.user?.phone || "";
  const cleanPhone = customerPhone.replace(/[^\d]/g, "");
  const waPhone = cleanPhone.startsWith("0") ? "972" + cleanPhone.slice(1) : cleanPhone;

  const fullAddress = order.address
    ? `${order.address.street}, ${order.address.city}${order.address.zipCode ? " " + order.address.zipCode : ""}`
    : "";

  const itemsText = order.items
    .map((i) => `• ${i.variant.product.name} (${i.variant.name}) × ${i.quantity}`)
    .join("\n");

  const waMessage = encodeURIComponent(
    `שלום ${customerName.split(" ")[0]},\n\nתודה על ההזמנה ${order.orderNumber} ב-Modaco!\n\nאנחנו בתהליך ההכנה ונחזור אליך בהקדם עם פרטי משלוח.\n\nאם יש שאלות — אני כאן.\nירין | Modaco`
  );
  const wazeUrl = order.address
    ? `https://waze.com/ul?q=${encodeURIComponent(fullAddress)}&navigate=yes`
    : "#";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-900">
          ← הזמנות
        </Link>
        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
        <span className={`px-3 py-1 rounded text-sm ${statusColors[order.status]}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      {/* Action buttons — the meeting's primary use case */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {customerPhone && (
          <a
            href={`https://wa.me/${waPhone}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-14 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            WhatsApp ללקוח
          </a>
        )}
        {order.address && (
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            ניווט ב-Waze
          </a>
        )}
        {customerPhone && (
          <a
            href={`tel:${customerPhone}`}
            className="flex items-center justify-center gap-2 h-14 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            שיחה ללקוח
          </a>
        )}
      </div>

      <OrderActions
        orderId={order.id}
        currentStatus={order.status}
        currentTracking={order.trackingNumber}
      />

      {/* Customer card */}
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">פרטי לקוח</div>
        <div className="space-y-1 text-sm">
          <div><strong>שם:</strong> {customerName}</div>
          {order.customer?.user?.email && <div><strong>אימייל:</strong> {order.customer.user.email}</div>}
          {customerPhone && <div><strong>טלפון:</strong> {customerPhone}</div>}
          {order.address && (
            <div>
              <strong>כתובת:</strong> {fullAddress}
            </div>
          )}
        </div>
      </section>

      {/* Items — print-friendly picking list */}
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          פריטים ללקיטה ({order.items.length})
        </div>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item.id} className="py-3 flex gap-3 items-start">
              {item.variant.product.images[0] ? (
                <img
                  src={item.variant.product.images[0].url}
                  alt={item.variant.product.name}
                  className="w-14 h-14 object-cover rounded border border-gray-100"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded" />
              )}
              <div className="flex-1">
                <div className="font-medium text-sm">{item.variant.product.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {item.variant.name}
                  {item.variant.sku && <> · מק"ט {item.variant.sku}</>}
                </div>
              </div>
              <div className="text-left text-sm">
                <div className="font-bold">×{item.quantity}</div>
                <div className="text-xs text-gray-500">₪{item.total.toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Totals */}
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>סכום ביניים</span><span>₪{order.subtotal.toLocaleString()}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700"><span>הנחה</span><span>-₪{order.discount.toLocaleString()}</span></div>
          )}
          {order.shippingCost > 0 && (
            <div className="flex justify-between"><span>משלוח</span><span>₪{order.shippingCost.toLocaleString()}</span></div>
          )}
          <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
            <span>סה"כ</span><span>₪{order.total.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Print summary text — for quick copy-paste to WhatsApp */}
      <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
        <div className="text-xs uppercase tracking-wider text-yellow-800 mb-2">
          טקסט מוכן להעתקה (לעצמך)
        </div>
        <pre className="whitespace-pre-wrap text-xs font-mono text-gray-800">
{`הזמנה ${order.orderNumber}
${customerName}${customerPhone ? ` · ${customerPhone}` : ""}
${fullAddress}

פריטים:
${itemsText}

סה"כ: ₪${order.total.toLocaleString()}`}
        </pre>
      </section>

      {/* Event log */}
      {order.events.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">היסטוריה</div>
          <ul className="space-y-2 text-sm">
            {order.events.map((e) => (
              <li key={e.id} className="flex justify-between text-gray-600">
                <span>{e.type}</span>
                <span className="text-xs text-gray-400">
                  {new Date(e.createdAt).toLocaleString("he-IL")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
