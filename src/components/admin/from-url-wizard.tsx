"use client";

/**
 * Focused single-purpose "Add product from URL" wizard. Three states:
 *
 *   1. INPUT    — Yarin pastes a supplier URL
 *   2. PREVIEW  — we show what we scraped + ask for category + optional
 *                 price/name overrides
 *   3. SUCCESS  — link to the live product
 *
 * Server actions are imported lazily via /lib/actions/scraper so the entire
 * wizard is a single client component that doesn't need its own API route.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  previewFromUrl,
  createFromUrl,
  listCategoriesForPicker,
  type PreviewResult,
  type CategoryOption,
} from "@/lib/actions/scraper";
import { Loader2, Sparkles, ArrowRight, CheckCircle2, ExternalLink, ChevronRight } from "lucide-react";

type Stage = "input" | "loading-preview" | "preview" | "submitting" | "done" | "error";

interface DoneState {
  productId: string;
  productSlug: string;
  name: string;
  imagesAdded: number;
  alreadyExisted: boolean;
}

export function FromUrlWizard({ initialCategories }: { initialCategories: CategoryOption[] }) {
  const [stage, setStage] = useState<Stage>("input");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<DoneState | null>(null);
  const [, startTransition] = useTransition();

  async function onPreview() {
    setError(null);
    setStage("loading-preview");
    const r = await previewFromUrl(url.trim());
    if ("ok" in r && r.ok === false) {
      setError(r.error);
      setStage("error");
      return;
    }
    setPreview(r as PreviewResult);
    // Default-pick category by matching the scraper's detectedCategory hint
    const hint = (r as PreviewResult).detectedCategory?.toLowerCase() || "";
    const auto = categories.find(
      (c) => hint.includes(c.slug) || c.name.includes(hint) || c.slug === hint,
    );
    setCategorySlug(auto?.slug || categories[0]?.slug || "");
    setStage("preview");
  }

  async function onCommit() {
    if (!categorySlug || !preview) return;
    setError(null);
    setStage("submitting");

    const priceNum = customPrice.trim() ? Number(customPrice) : undefined;
    const r = await createFromUrl({
      url,
      categorySlug,
      customName: customName.trim() || undefined,
      customPrice: Number.isFinite(priceNum) ? priceNum : undefined,
    });
    if ("ok" in r && r.ok === false) {
      setError(r.error);
      setStage("error");
      return;
    }
    setDone(r as DoneState);
    setStage("done");
    // Best-effort: refresh category list product counts for next round
    startTransition(async () => {
      const fresh = await listCategoriesForPicker();
      setCategories(fresh);
    });
  }

  function reset() {
    setStage("input");
    setUrl("");
    setPreview(null);
    setCategorySlug("");
    setCustomName("");
    setCustomPrice("");
    setError(null);
    setDone(null);
  }

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <ol className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <li className={dotCls(stage, "input", "loading-preview")}>1 · קישור</li>
        <li>—</li>
        <li className={dotCls(stage, "preview", "submitting")}>2 · אישור</li>
        <li>—</li>
        <li className={dotCls(stage, "done")}>3 · עלה לאתר</li>
      </ol>

      {/* INPUT */}
      {(stage === "input" || stage === "loading-preview" || stage === "error") && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">הדבק קישור למוצר מהספק</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Domicile · Nyga · Floralis · אני מזהה אוטומטית
              </p>
            </div>
          </div>

          <textarea
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.domicile.co.il/product/..."
            rows={2}
            dir="ltr"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={stage === "loading-preview"}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
              ✗ {error}
            </div>
          )}

          <button
            type="button"
            onClick={onPreview}
            disabled={!url.trim() || stage === "loading-preview"}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl font-medium flex items-center justify-center gap-2"
          >
            {stage === "loading-preview" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                סורק את הדף...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                בוא נראה מה יש
              </>
            )}
          </button>
        </div>
      )}

      {/* PREVIEW */}
      {(stage === "preview" || stage === "submitting") && preview && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Image strip */}
          <div className="bg-gray-50 p-4 flex gap-3 overflow-x-auto">
            {preview.images.slice(0, 3).map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={src}
                alt={preview.name}
                className="w-32 h-32 object-contain bg-white rounded-lg border border-gray-200 flex-shrink-0"
              />
            ))}
            {preview.imageCount > 3 && (
              <div className="w-32 h-32 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-sm text-gray-500 flex-shrink-0">
                +{preview.imageCount - 3} עוד
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Identity */}
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {preview.supplier}{preview.sku ? ` · ${preview.sku}` : ""}
              </div>
              <h3 className="text-xl font-bold leading-tight">{preview.name}</h3>
              {preview.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                  {preview.description}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="מחיר ספק" value={preview.price ? `₪${preview.price}` : "—"} />
              <Stat label="ואריאנטים" value={String(preview.variantCount)} />
              <Stat label="תמונות" value={String(preview.imageCount)} />
            </div>

            {/* Form */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  קטגוריה באתר
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={stage === "submitting"}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c.productCount})
                    </option>
                  ))}
                </select>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-900 select-none">
                  התאמות נוספות (שם, מחיר באתר)
                </summary>
                <div className="mt-3 space-y-3 pr-2 border-r-2 border-purple-100">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      שם מותאם (אם רוצה לשנות)
                    </label>
                    <input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={preview.name}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={stage === "submitting"}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                      מחיר באתר (אם שונה ממחיר הספק)
                    </label>
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder={preview.price ? String(preview.price) : "—"}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={stage === "submitting"}
                    />
                  </div>
                </div>
              </details>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={reset}
                disabled={stage === "submitting"}
                className="px-4 h-11 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50"
              >
                התחל מחדש
              </button>
              <button
                type="button"
                onClick={onCommit}
                disabled={!categorySlug || stage === "submitting"}
                className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                {stage === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    מעלה לאתר...
                  </>
                ) : (
                  <>
                    הוסף לאתר
                    <ArrowRight className="w-4 h-4 -scale-x-100" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DONE */}
      {stage === "done" && done && (
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200 rounded-2xl p-8 space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-900">
              {done.alreadyExisted ? "המוצר כבר היה באתר" : "המוצר נוסף לאתר!"}
            </h2>
            <p className="text-sm text-emerald-800 mt-1">
              {done.name}
              {!done.alreadyExisted && done.imagesAdded > 0 && (
                <> · {done.imagesAdded} תמונות הועלו</>
              )}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href={`/admin/products/${done.productId}`}
              className="inline-flex items-center gap-2 px-5 h-11 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              ערוך פרטים
              <ChevronRight className="w-4 h-4" />
            </Link>
            {done.productSlug && (
              <a
                href={`/products/${done.productSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium"
              >
                ראה באתר
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            הוסף עוד מוצר
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg py-3">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function dotCls(stage: Stage, ...active: Stage[]) {
  return `transition-colors ${active.includes(stage) ? "text-purple-700 font-semibold" : ""}`;
}
