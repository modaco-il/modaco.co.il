"use client";

/**
 * Click-to-edit price on /admin/products row. Yarin's #1 daily operation
 * after the storefront launch — and he'd rather not click into each product
 * page for a single number change.
 *
 * UX:
 *   - Display ₪{price}. Click → reveals an input prefilled with the current
 *     price. Enter (or click outside) saves; Escape cancels.
 *   - During the request: spinner + dimmed input. Success: snap back to the
 *     new number. Failure: red flash + restore old value.
 */
import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";

interface Props {
  productId: string;
  basePrice: number;
}

export function InlinePriceEdit({ productId, basePrice }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(basePrice));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  // Keep local value in sync with parent's value when not editing
  useEffect(() => {
    if (!editing) setValue(String(basePrice));
  }, [basePrice, editing]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function commit() {
    const trimmed = value.trim();
    const num = Number(trimmed);
    if (!Number.isFinite(num) || num < 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    if (num === basePrice) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/products/${productId}/quick-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_price", price: num }),
      });
      if (!r.ok) {
        setError(true);
        setValue(String(basePrice));
        setTimeout(() => setError(false), 1500);
      } else {
        setEditing(false);
        startTransition(() => router.refresh());
      }
    } catch {
      setError(true);
      setValue(String(basePrice));
      setTimeout(() => setError(false), 1500);
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    setValue(String(basePrice));
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setEditing(true);
        }}
        className="font-bold text-base hover:bg-yellow-100 rounded px-2 py-1 transition-colors"
        title="לחץ לעריכת מחיר"
      >
        ₪{basePrice.toLocaleString()}
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 ${error ? "ring-2 ring-red-400 rounded" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <span className="text-gray-500">₪</span>
      <input
        ref={inputRef}
        type="number"
        step="1"
        min="0"
        value={value}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        onBlur={() => {
          // small delay so clicks on the action buttons land first
          setTimeout(() => {
            if (!busy && editing) commit();
          }, 100);
        }}
        className="w-20 h-8 px-2 border border-gray-300 rounded text-sm font-medium text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
        dir="ltr"
      />
      {busy ? (
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      ) : (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              commit();
            }}
            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
            title="שמור (Enter)"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              cancel();
            }}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
            title="ביטול (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
