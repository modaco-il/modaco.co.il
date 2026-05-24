"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  currentTracking: string | null;
  /** Morning hosted-checkout URL, when one was generated. */
  paymentRef: string | null;
  /** Green Invoice document id, present after webhook fires on PAID. */
  invoiceRef: string | null;
  /** Customer phone in raw form (digits+dashes); used for WhatsApp link. */
  customerPhone: string;
  /** Total amount, used in the WhatsApp template. */
  total: number;
  /** B2B quote-mode orders never need a Morning payment link. */
  isB2BQuote: boolean;
}

const NEXT_STATUS: Record<string, string | null> = {
  PENDING: "PAID",
  PAID: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
};

const NEXT_LABEL: Record<string, string> = {
  PENDING: "סמן כשולמה",
  PAID: "התחלתי טיפול",
  PROCESSING: "סמן כנשלחה",
  SHIPPED: "אישור הגעה",
};

function toWaPhone(p: string): string {
  const clean = p.replace(/[^\d]/g, "");
  return clean.startsWith("0") ? "972" + clean.slice(1) : clean;
}

export function OrderActions({
  orderId,
  orderNumber,
  currentStatus,
  currentTracking,
  paymentRef,
  invoiceRef,
  customerPhone,
  total,
  isB2BQuote,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tracking, setTracking] = useState(currentTracking || "");
  const [savedTracking, setSavedTracking] = useState(currentTracking || "");
  const [linkPending, setLinkPending] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);

  const next = NEXT_STATUS[currentStatus];
  const nextLabel = next ? NEXT_LABEL[currentStatus] : null;
  const showPaymentBlock = !isB2BQuote && currentStatus === "PENDING";

  async function advance() {
    if (!next) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) router.refresh();
      else alert("שגיאה בעדכון סטטוס");
    });
  }

  async function saveTracking() {
    if (tracking === savedTracking) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: tracking }),
      });
      if (res.ok) {
        setSavedTracking(tracking);
        router.refresh();
      } else {
        alert("שגיאה בשמירת מספר מעקב");
      }
    });
  }

  async function regeneratePaymentLink() {
    setLinkError(null);
    setLinkPending(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment-link`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLinkError(data?.error || `שגיאה (${res.status})`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setLinkError((err as Error).message);
    } finally {
      setLinkPending(false);
    }
  }

  async function copyLink() {
    if (!paymentRef) return;
    try {
      await navigator.clipboard.writeText(paymentRef);
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 1500);
    } catch {
      // Older browsers — fall back to prompt
      window.prompt("העתק ידנית:", paymentRef);
    }
  }

  const waPhone = customerPhone ? toWaPhone(customerPhone) : "";
  const waMessage = paymentRef
    ? encodeURIComponent(
        `שלום! הקישור לתשלום על הזמנה ${orderNumber} ב-Modaco (סה"כ ₪${total.toLocaleString()}):\n\n${paymentRef}\n\nתודה,\nירין | Modaco`,
      )
    : "";

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <div className="text-xs uppercase tracking-wider text-gray-500">פעולות</div>

      <div className="flex flex-wrap gap-3 items-center">
        {next && nextLabel && (
          <button
            onClick={advance}
            disabled={pending}
            className="h-11 px-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {pending ? "..." : nextLabel}
          </button>
        )}

        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <input
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="מס' מעקב משלוח"
            className="h-11 flex-1 px-3 border border-gray-300 rounded-lg text-sm"
            dir="ltr"
          />
          <button
            onClick={saveTracking}
            disabled={pending || tracking === savedTracking}
            className="h-11 px-4 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm rounded-lg"
          >
            שמור
          </button>
        </div>
      </div>

      {showPaymentBlock && (
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="text-xs uppercase tracking-wider text-gray-500">
            קישור תשלום (Morning)
          </div>

          {paymentRef ? (
            <>
              <div className="flex items-start gap-2">
                <input
                  readOnly
                  value={paymentRef}
                  className="h-11 flex-1 px-3 border border-gray-200 bg-gray-50 rounded-lg text-xs font-mono"
                  dir="ltr"
                  onFocus={(e) => e.currentTarget.select()}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyLink}
                  className="h-10 px-4 border border-gray-300 hover:bg-gray-50 text-sm rounded-lg"
                >
                  {copyOk ? "✓ הועתק" : "העתק"}
                </button>
                <a
                  href={paymentRef}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-4 border border-gray-300 hover:bg-gray-50 text-sm rounded-lg flex items-center"
                >
                  פתח בדפדפן
                </a>
                {waPhone && (
                  <a
                    href={`https://wa.me/${waPhone}?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center"
                  >
                    שלח ללקוח ב-WhatsApp
                  </a>
                )}
                <button
                  onClick={regeneratePaymentLink}
                  disabled={linkPending}
                  className="h-10 px-4 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-sm rounded-lg"
                >
                  {linkPending ? "..." : "צור קישור חדש"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                לא נוצר קישור תשלום עדיין. הסיבה הסבירה: סליקת Grow לא פעילה
                בעת יצירת ההזמנה (errorCode 2600). אפשר לנסות עכשיו —
                ברגע ש-Grow מאשרים, הקישור יוצר במכה אחת.
              </p>
              <button
                onClick={regeneratePaymentLink}
                disabled={linkPending}
                className="h-11 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg"
              >
                {linkPending ? "מייצר..." : "צור קישור תשלום"}
              </button>
            </>
          )}

          {linkError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              ✗ {linkError}
            </div>
          )}
        </div>
      )}

      {invoiceRef && (
        <div className="border-t border-gray-100 pt-4">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            חשבונית
          </div>
          <a
            href={`https://app.greeninvoice.co.il/documents/${invoiceRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 border border-gray-300 hover:bg-gray-50 text-sm rounded-lg"
          >
            צפה ב-Morning ↗
            <span className="text-xs text-gray-500 font-mono">{invoiceRef}</span>
          </a>
        </div>
      )}
    </section>
  );
}
