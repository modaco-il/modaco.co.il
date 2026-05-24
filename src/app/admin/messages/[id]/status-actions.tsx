"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  messageId: string;
  currentStatus: string;
}

const STATUSES = [
  { key: "NEW", label: "חדשה", color: "bg-blue-50 border-blue-300 text-blue-800" },
  { key: "IN_PROGRESS", label: "בטיפול", color: "bg-amber-50 border-amber-300 text-amber-800" },
  { key: "RESOLVED", label: "טופלה", color: "bg-green-50 border-green-300 text-green-800" },
  { key: "SPAM", label: "ספאם", color: "bg-red-50 border-red-300 text-red-800" },
];

export function MessageStatusActions({ messageId, currentStatus }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(status: string) {
    if (status === currentStatus) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/messages/${messageId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
      else alert("שגיאה בעדכון סטטוס");
    });
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        עדכון סטטוס
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const isActive = currentStatus === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatus(s.key)}
              disabled={pending || isActive}
              className={`h-10 px-4 rounded-lg text-sm font-medium border transition-colors ${
                isActive
                  ? s.color
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              }`}
            >
              {isActive ? `✓ ${s.label}` : s.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
