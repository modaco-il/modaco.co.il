/**
 * Customer-facing order tracking.
 *
 * URL: /orders/<orderId>?token=<hmac>
 *
 * The token is a deterministic HMAC over the order id (see
 * @/lib/order-token). Without it (or with a wrong one) we render a
 * "not found" page to avoid leaking that the order exists.
 *
 * Shows order header, items, totals, address, status timeline, the
 * tracking number if shipped, and a prominent "השלם תשלום" button
 * if the order is still PENDING and we have a Morning payment link.
 *
 * No login required. Cuid order ids + 64 bits of token entropy gate it.
 */
import { db } from "@/lib/db";
import { verifyOrderToken } from "@/lib/order-token";
import { notFound } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "מעקב הזמנה — Modaco",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה לתשלום",
  PAID: "תשלום אושר",
  PROCESSING: "בליקוט",
  SHIPPED: "נשלחה",
  DELIVERED: "התקבלה",
  CANCELLED: "בוטלה",
  REFUNDED: "הוחזרה",
};

const statusColor: Record<string, string> = {
  PENDING: "border-amber-300 bg-amber-50 text-amber-900",
  PAID: "border-emerald-300 bg-emerald-50 text-emerald-900",
  PROCESSING: "border-blue-300 bg-blue-50 text-blue-900",
  SHIPPED: "border-purple-300 bg-purple-50 text-purple-900",
  DELIVERED: "border-gray-300 bg-gray-50 text-gray-900",
  CANCELLED: "border-red-300 bg-red-50 text-red-900",
  REFUNDED: "border-orange-300 bg-orange-50 text-orange-900",
};

// Order of the linear pipeline for the timeline.
const PIPELINE = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
const PIPELINE_LABEL: Record<string, string> = {
  PENDING: "הזמנה התקבלה",
  PAID: "תשלום אושר",
  PROCESSING: "בליקוט",
  SHIPPED: "נשלחה אליך",
  DELIVERED: "התקבלה",
};

export default async function CustomerOrderTrackingPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { token = "" } = await searchParams;

  if (!verifyOrderToken(id, token)) {
    notFound();
  }

  const order = await db.order.findUnique({
    where: { id },
    include: {
      address: true,
      items: {
        include: {
          variant: {
            include: {
              product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
            },
          },
        },
      },
      events: {
        where: { type: { in: ["created", "paid", "status_changed"] } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!order) notFound();

  const pipelineIdx = PIPELINE.indexOf(order.status);
  const cancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  const fullAddress = order.address
    ? `${order.address.street}, ${order.address.city}${
        order.address.zipCode ? " " + order.address.zipCode : ""
      }`
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16 space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <div className="text-xs tracking-[0.3em] uppercase text-mocha">
          מעקב הזמנה
        </div>
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h1 className="font-display text-3xl lg:text-4xl text-ink font-mono">
            {order.orderNumber}
          </h1>
          <span
            className={`px-3 py-1 rounded text-sm border ${statusColor[order.status]}`}
          >
            {statusLabels[order.status] || order.status}
          </span>
        </div>
        <p className="text-sm text-ink-soft">
          הוזמנה ב-
          {new Date(order.createdAt).toLocaleString("he-IL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </header>

      {/* PENDING + payment link → prominent CTA */}
      {order.status === "PENDING" && order.paymentRef && (
        <section className="border border-amber-300 bg-amber-50 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-amber-900">
                ההזמנה ממתינה לתשלום
              </div>
              <p className="text-sm text-amber-800 mt-1">
                התשלום עבר ל-Morning, ערוץ הסליקה המאובטח של מודקו.
              </p>
            </div>
            <a
              href={order.paymentRef}
              className="inline-flex items-center justify-center h-12 px-8 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors whitespace-nowrap"
            >
              השלם תשלום ←
            </a>
          </div>
        </section>
      )}

      {/* Status timeline (linear pipeline only) */}
      {!cancelled && (
        <section className="border border-bone p-6 lg:p-8 space-y-4">
          <div className="text-xs uppercase tracking-wider text-mocha">
            התקדמות
          </div>
          <ol className="space-y-3">
            {PIPELINE.map((step, idx) => {
              const done = idx <= pipelineIdx;
              const current = idx === pipelineIdx;
              return (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs ${
                      done
                        ? "bg-ink text-cream"
                        : "bg-bone text-mocha"
                    }`}
                  >
                    {done ? "✓" : idx + 1}
                  </span>
                  <span
                    className={`text-sm ${
                      current
                        ? "font-medium text-ink"
                        : done
                          ? "text-ink-soft"
                          : "text-mocha"
                    }`}
                  >
                    {PIPELINE_LABEL[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Items */}
      <section className="border border-bone">
        <div className="px-6 py-4 border-b border-bone text-xs uppercase tracking-wider text-mocha">
          פריטים ({order.items.length})
        </div>
        <ul className="divide-y divide-bone">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-14 h-14 bg-cream-deep border border-bone flex-shrink-0 overflow-hidden">
                {item.variant.product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.variant.product.images[0].url}
                    alt={item.variant.product.name}
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink truncate">
                  {item.variant.product.name}
                </div>
                <div className="text-xs text-mocha mt-0.5">
                  {item.variant.name} · ×{item.quantity}
                </div>
              </div>
              <div className="text-sm font-medium tabular-nums whitespace-nowrap">
                ₪{item.total.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
        <div className="px-6 py-4 border-t border-bone space-y-1 text-sm">
          <div className="flex justify-between">
            <span>סכום ביניים</span>
            <span className="tabular-nums">₪{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>הנחה</span>
              <span className="tabular-nums">-₪{order.discount.toLocaleString()}</span>
            </div>
          )}
          {order.shippingCost > 0 && (
            <div className="flex justify-between">
              <span>משלוח</span>
              <span className="tabular-nums">₪{order.shippingCost.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-base border-t border-bone pt-2 mt-2">
            <span>סה״כ</span>
            <span className="tabular-nums">₪{order.total.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Address + tracking */}
      {fullAddress && (
        <section className="border border-bone p-6 lg:p-8 space-y-3">
          <div className="text-xs uppercase tracking-wider text-mocha">
            כתובת למשלוח
          </div>
          <div className="text-sm text-ink">
            {order.address?.fullName && (
              <div className="font-medium">{order.address.fullName}</div>
            )}
            <div className="text-ink-soft mt-1">{fullAddress}</div>
            {order.address?.phone && (
              <div className="text-xs text-mocha mt-1" dir="ltr">
                {order.address.phone}
              </div>
            )}
          </div>
          {order.trackingNumber && (
            <div className="border-t border-bone pt-3 mt-3">
              <div className="text-xs uppercase tracking-wider text-mocha mb-1">
                מספר מעקב משלוח
              </div>
              <div className="font-mono text-sm" dir="ltr">
                {order.trackingNumber}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Invoice (Morning) */}
      {order.invoiceRef && (
        <section className="border border-bone p-6 lg:p-8">
          <div className="text-xs uppercase tracking-wider text-mocha mb-2">
            חשבונית
          </div>
          <a
            href={`https://app.greeninvoice.co.il/documents/${order.invoiceRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink underline hover:text-mocha"
          >
            צפה / הורד חשבונית →
          </a>
        </section>
      )}

      {/* Help footer */}
      <footer className="text-center pt-4 space-y-3">
        <p className="text-sm text-ink-soft">יש שאלה לגבי ההזמנה?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/972526804945"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
          >
            וואטסאפ למודקו
          </a>
          <a
            href="tel:0526804945"
            className="inline-flex items-center justify-center h-11 px-6 border border-ink text-ink text-sm rounded hover:bg-ink hover:text-cream transition-colors"
            dir="ltr"
          >
            052-680-4945
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-6 border border-bone text-ink-soft text-sm rounded hover:bg-cream-deep transition-colors"
          >
            חזרה לחנות
          </Link>
        </div>
      </footer>
    </div>
  );
}
