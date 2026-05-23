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

interface Props {
  productId: string;
  status: Status;
  /** true if at least one variant is currently OUT_OF_STOCK */
  isOutOfStock: boolean;
}

export function ProductRowActions({ productId, status, isOutOfStock }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | "stock" | "archive">(null);

  async function run(action: "toggle_out_of_stock" | "archive" | "restore", which: "stock" | "archive") {
    setBusy(which);
    try {
      const r = await fetch(`/api/admin/products/${productId}/quick-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
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
        onClick={() => run("toggle_out_of_stock", "stock")}
        className={`text-xs px-2.5 py-1.5 rounded border transition-colors disabled:opacity-50 ${
          isOutOfStock
            ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
        title={stockLabel}
      >
        {busy === "stock" ? "..." : stockLabel}
      </button>

      <button
        type="button"
        disabled={busy !== null || pending}
        onClick={() =>
          run(status === "ARCHIVED" ? "restore" : "archive", "archive")
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
