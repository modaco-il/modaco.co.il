"use client";

import { useState, useTransition } from "react";

interface Props {
  customerId: string;
  initialNotes: string;
}

export function CustomerNotesEditor({ customerId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(initialNotes);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dirty = notes !== saved;

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setSaved(notes);
      } else {
        setError("שמירה נכשלה");
      }
    });
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-gray-500">
          הערות פנימיות
        </div>
        {dirty && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
            לא נשמר
          </span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="למשל: לקוח חוזר · עובד עם אדריכלית X · מעדיף משלוח אחר הצהריים..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-y"
      />
      <div className="flex items-center gap-3 mt-3">
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="h-10 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg"
        >
          {pending ? "שומר..." : "שמור"}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => {
              setNotes(saved);
              setError(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ביטול
          </button>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </section>
  );
}
