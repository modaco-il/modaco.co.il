"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  currentStatus: string;
  currentTracking: string | null;
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

export function OrderActions({ orderId, currentStatus, currentTracking }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tracking, setTracking] = useState(currentTracking || "");
  const [savedTracking, setSavedTracking] = useState(currentTracking || "");

  const next = NEXT_STATUS[currentStatus];
  const nextLabel = next ? NEXT_LABEL[currentStatus] : null;

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
    </section>
  );
}
