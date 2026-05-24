/**
 * Landing page after a failed/cancelled payment on Morning's hosted form.
 * Customer can either retry or reach Yarin by WhatsApp.
 */
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "התשלום לא הושלם — Modaco",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ o?: string }>;
}

export default async function CheckoutFailedPage({ searchParams }: Props) {
  const { o } = await searchParams;
  const order = o
    ? await db.order.findUnique({
        where: { id: o },
        select: { orderNumber: true, paymentRef: true },
      })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-12 py-24">
      <div className="border border-red-200 bg-red-50 p-10 lg:p-14 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 border border-red-300 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <div className="eyebrow text-red-700 mb-4">התשלום לא הושלם</div>
        <h1 className="font-display text-3xl lg:text-4xl text-ink mb-3">
          משהו השתבש
        </h1>
        {order?.orderNumber && (
          <>
            <p className="text-sm text-red-700 mb-1">מספר הזמנה</p>
            <p className="font-mono text-lg text-ink mb-6">{order.orderNumber}</p>
          </>
        )}
        <p className="text-base text-ink-soft font-light leading-loose mb-8">
          התשלום לא עבר. אפשר לנסות שוב, או לפנות אלינו בוואטסאפ ונסיים את ההזמנה ביחד.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {order?.paymentRef && (
            <a
              href={order.paymentRef}
              className="inline-flex items-center justify-center h-12 px-8 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors"
            >
              נסיון נוסף
            </a>
          )}
          <a
            href="https://wa.me/972526804945"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-8 border border-ink text-ink text-sm tracking-wide hover:bg-ink hover:text-cream transition-colors"
          >
            וואטסאפ למודקו
          </a>
          <Link
            href="/cart"
            className="inline-flex items-center justify-center h-12 px-8 border border-bone text-ink-soft text-sm tracking-wide hover:bg-cream-deep transition-colors"
          >
            חזרה לעגלה
          </Link>
        </div>
      </div>
    </div>
  );
}
