"use client";

/**
 * Inline quick-action buttons on each row of /admin/products.
 * Lets Yarin toggle stock or archive/restore a product without opening it.
 *
 * Self-contained: stops Link propagation so a click on a button doesn't
 * navigate into the product detail page; uses router.refresh() instead of
 * a hard reload so the row updates in place.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Status = "ACTIVE" | "DRAFT" | "ARCHIVED";
type StockStatus = "IN_STOCK" | "AT_SUPPLIER" | "ON_ORDER" | "OUT_OF_STOCK";

export interface VariantSummary {
  id: string;
  name: string;
  stockStatus: StockStatus;
}

interface Props {
  productId: string;
  status: Status;
  /** true if at least one variant is currently OUT_OF_STOCK */
  isOutOfStock: boolean;
  /** Optional: pass variants to enable per-variant stock dropdown.
   *  If omitted or has ≤1 variant, only the all-variants toggle is shown. */
  variants?: VariantSummary[];
}

const STOCK_LABELS: Record<StockStatus, string> = {
  IN_STOCK: "במלאי",
  AT_SUPPLIER: "אצל הספק",
  ON_ORDER: "בהזמנה",
  OUT_OF_STOCK: "אזל",
};

export function ProductRowActions({ productId, status, isOutOfStock, variants }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | "stock" | "archive" | "variant">(null);
  const [variantMenuOpen, setVariantMenuOpen] = useState(false);

  async function postQuickAction(payload: Record<string, unknown>, which: typeof busy) {
    setBusy(which);
    try {
      const r = await fetch(`/api/admin/products/${productId}/quick-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(`שגיאה: ${j.error || r.status}`);
      } else {
        startTransition(() => router.refresh());
      }
    } finally {
      setBusy(null);
    }
  }

  const stockLabel = isOutOfStock ? "החזר למלאי" : "סמן: אזל";
  const archiveLabel = status === "ARCHIVED" ? "החזר לאתר" : "הסר מהאתר";
  const hasMultipleVariants = (variants?.length ?? 0) > 1;

  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => {
        // Don't let clicks on these buttons navigate into the row's <Link>
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        disabled={busy !== null || pending}
        onClick={() => postQuickAction({ action: "toggle_out_of_stock" }, "stock")}
        className={`text-xs px-2.5 py-1.5 rounded border transition-colors disabled:opacity-50 ${
          isOutOfStock
            ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
        title={stockLabel}
      >
        {busy === "stock" ? "..." : stockLabel}
      </button>

      {hasMultipleVariants && (
        <div className="relative">
          <button
            type="button"
            disabled={busy !== null || pending}
            onClick={() => setVariantMenuOpen((v) => !v)}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            title="ערוך מלאי לפי וריאנט"
          >
            {busy === "variant" ? "..." : `לפי וריאנט (${variants!.length})`}
          </button>
          {variantMenuOpen && (
            <>
              {/* Click-away backdrop */}
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default bg-transparent"
                aria-label="סגירה"
                onClick={() => setVariantMenuOpen(false)}
              />
              <div className="absolute z-20 top-full mt-1 left-0 min-w-[260px] bg-white border border-gray-200 rounded shadow-lg p-1.5 max-h-[60vh] overflow-y-auto">
                {variants!.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-gray-50"
                  >
                    <div className="text-xs text-gray-800 truncate">{v.name}</div>
                    <select
                      value={v.stockStatus}
                      disabled={busy !== null}
                      onChange={(e) => {
                        const next = e.target.value as StockStatus;
                        postQuickAction(
                          { action: "set_variant_stock", variantId: v.id, status: next },
                          "variant",
                        );
                      }}
                      className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
                    >
                      {(Object.keys(STOCK_LABELS) as StockStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {STOCK_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={busy !== null || pending}
        onClick={() =>
          postQuickAction(
            { action: status === "ARCHIVED" ? "restore" : "archive" },
            "archive",
          )
        }
        className={`text-xs px-2.5 py-1.5 rounded border transition-colors disabled:opacity-50 ${
          status === "ARCHIVED"
            ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            : "border-gray-200 bg-white text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
        }`}
        title={archiveLabel}
      >
        {busy === "archive" ? "..." : archiveLabel}
      </button>
    </div>
  );
}
