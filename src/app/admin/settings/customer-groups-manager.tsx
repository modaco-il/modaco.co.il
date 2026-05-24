"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  displayName: string;
  discountPercent: number;
  paymentTerms: string | null;
  _count: { customers: number };
}

interface Props {
  initialGroups: Group[];
}

export function CustomerGroupsManager({ initialGroups }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Group> | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    displayName: "",
    discountPercent: 0,
    paymentTerms: "",
  });
  const [error, setError] = useState<string | null>(null);

  async function save(id: string) {
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/customer-groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "שמירה נכשלה");
      } else {
        setEditingId(null);
        setDraft(null);
        router.refresh();
      }
    });
  }

  async function remove(id: string) {
    if (!confirm("למחוק את הקבוצה? לקוחות שמשויכים יישארו אבל בלי קבוצה.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/customer-groups/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "מחיקה נכשלה");
      } else {
        router.refresh();
      }
    });
  }

  async function create() {
    setError(null);
    if (!newGroup.name || !newGroup.displayName) {
      setError("name + displayName חובה");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/customer-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "יצירה נכשלה");
      } else {
        setNewGroup({ name: "", displayName: "", discountPercent: 0, paymentTerms: "" });
        setCreateOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase tracking-wider text-gray-500">
          קבוצות לקוחות (B2B)
        </div>
        <button
          onClick={() => setCreateOpen((v) => !v)}
          className="text-xs text-blue-600 hover:underline"
        >
          {createOpen ? "ביטול" : "+ קבוצה חדשה"}
        </button>
      </div>

      {createOpen && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label='מזהה (אנגלית)'
              value={newGroup.name}
              onChange={(v) => setNewGroup((g) => ({ ...g, name: v }))}
              placeholder="architect"
              mono
            />
            <Input
              label="שם תצוגה"
              value={newGroup.displayName}
              onChange={(v) => setNewGroup((g) => ({ ...g, displayName: v }))}
              placeholder="אדריכל"
            />
            <Input
              label="הנחה %"
              type="number"
              value={String(newGroup.discountPercent)}
              onChange={(v) =>
                setNewGroup((g) => ({ ...g, discountPercent: Number(v) || 0 }))
              }
              placeholder="0"
            />
            <Input
              label="תנאי תשלום"
              value={newGroup.paymentTerms}
              onChange={(v) => setNewGroup((g) => ({ ...g, paymentTerms: v }))}
              placeholder="שוטף+30"
            />
          </div>
          <button
            onClick={create}
            disabled={pending}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg"
          >
            צור קבוצה
          </button>
        </div>
      )}

      <ul className="divide-y divide-gray-100">
        {initialGroups.length === 0 && (
          <li className="py-6 text-center text-sm text-gray-400">
            אין קבוצות עדיין
          </li>
        )}
        {initialGroups.map((g) => {
          const isEditing = editingId === g.id;
          const value = isEditing && draft ? draft : g;
          return (
            <li key={g.id} className="py-3">
              {!isEditing ? (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{g.displayName}</span>
                      <span className="font-mono text-[11px] text-gray-400">
                        {g.name}
                      </span>
                      {g.discountPercent > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700">
                          -{g.discountPercent}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {g._count.customers} לקוחות
                      {g.paymentTerms && <> · {g.paymentTerms}</>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(g.id);
                        setDraft({ ...g });
                        setError(null);
                      }}
                      className="h-9 px-3 text-xs border border-gray-200 hover:bg-gray-50 rounded-lg"
                    >
                      ערוך
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(g.id)}
                      disabled={pending}
                      className="h-9 px-3 text-xs border border-red-200 hover:bg-red-50 text-red-700 rounded-lg"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-gray-50 -mx-2 px-4 py-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="מזהה"
                      value={value.name || ""}
                      onChange={(v) =>
                        setDraft((d) => ({ ...(d || {}), name: v }))
                      }
                      mono
                    />
                    <Input
                      label="שם תצוגה"
                      value={value.displayName || ""}
                      onChange={(v) =>
                        setDraft((d) => ({ ...(d || {}), displayName: v }))
                      }
                    />
                    <Input
                      label="הנחה %"
                      type="number"
                      value={String(value.discountPercent ?? 0)}
                      onChange={(v) =>
                        setDraft((d) => ({
                          ...(d || {}),
                          discountPercent: Number(v) || 0,
                        }))
                      }
                    />
                    <Input
                      label="תנאי תשלום"
                      value={value.paymentTerms || ""}
                      onChange={(v) =>
                        setDraft((d) => ({ ...(d || {}), paymentTerms: v }))
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => save(g.id)}
                      disabled={pending}
                      className="h-9 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg"
                    >
                      שמור
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                      }}
                      className="h-9 px-3 text-sm text-gray-500 hover:text-gray-900"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {error && (
        <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
          ✗ {error}
        </div>
      )}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] text-gray-500 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-9 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 ${mono ? "font-mono" : ""}`}
        dir={mono ? "ltr" : "auto"}
      />
    </label>
  );
}
