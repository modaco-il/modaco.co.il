/**
 * Landing page after a successful payment on Morning's hosted form.
 * Morning redirects here with `?o=<orderId>`. We show a clean thank-you
 * card with the order number and basic next steps.
 *
 * The status update itself happens via the morning-webhook in parallel;
 * this page is purely for the customer's UX.
 */
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { makeOrderToken } from "@/lib/order-token";

export const metadata = {
  title: "תודה — Modaco",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ o?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { o } = await searchParams;
  if (!o) redirect("/");

  const order = await db.order.findUnique({
    where: { id: o },
    select: { id: true, orderNumber: true, total: true, status: true },
  });
  if (!order) redirect("/");

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-12 py-24">
      <div className="border border-mocha/40 bg-cream-deep p-10 lg:p-14 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-emerald-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="eyebrow text-mocha mb-4">תשלום עבר בהצלחה</div>
        <h1 className="font-display text-3xl lg:text-4xl text-ink mb-3">
          תודה!
        </h1>
        <p className="text-sm text-mocha mb-1">מספר הזמנה</p>
        <p className="font-mono text-lg text-ink mb-6">{order.orderNumber}</p>
        <p className="text-base text-ink-soft font-light leading-loose mb-8">
          חשבונית מס וקבלה נשלחו אליך באימייל.
          <br />
          <span className="text-sm opacity-80">
            סך כולל: <span className="font-medium">₪{order.total.toLocaleString()}</span>
          </span>
        </p>
        <p className="text-sm text-ink-soft mb-8">
          ניצור איתך קשר בקרוב לתיאום משלוח.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/orders/${order.id}?token=${makeOrderToken(order.id)}`}
            className="inline-flex items-center justify-center h-12 px-8 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors"
          >
            מעקב הזמנה
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-8 border border-ink text-ink text-sm tracking-wide hover:bg-ink hover:text-cream transition-colors"
          >
            חזרה לאתר
          </Link>
          <a
            href="https://wa.me/972526804945"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-8 border border-bone text-ink-soft text-sm tracking-wide hover:bg-cream-deep transition-colors"
          >
            וואטסאפ
          </a>
        </div>
      </div>
    </div>
  );
}
