"use client";

import { useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { ProductCard } from "./product-card";

interface Variant {
  id: string;
  name: string;
  sku: string;
  priceOverride: number | null;
  stockStore: number;
  stockSupplier: number;
  stockStatus: string;
}

interface Image {
  id: string;
  url: string;
  altText: string | null;
}

interface CrossSell {
  relatedProduct: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: { url: string }[];
  };
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    supplierSku?: string | null;
    category: { id: string; name: string; slug: string } | null;
    supplier?: { id: string; name: string } | null;
    variants: Variant[];
    images: Image[];
    crossSellFrom: CrossSell[];
  };
}

const stockStatus: Record<string, { label: string; color: string }> = {
  IN_STOCK: { label: "במלאי — משלוח מהיר", color: "text-emerald-700" },
  AT_SUPPLIER: { label: "במלאי הספק — 3-5 ימי עסקים", color: "text-mocha" },
  ON_ORDER: { label: "בהזמנה — צרו קשר לזמן אספקה", color: "text-amber-700" },
  OUT_OF_STOCK: { label: "אזל מהמלאי", color: "text-red-700" },
};

function SpecRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between items-baseline py-3">
      <dt className="text-xs tracking-[0.2em] uppercase text-ink-soft">{label}</dt>
      <dd className={`font-light ${valueColor || "text-ink"}`}>{value}</dd>
    </div>
  );
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [mainImageIdx, setMainImageIdx] = useState(0);

  const currentPrice = selectedVariant?.priceOverride ?? product.basePrice;
  const stock = selectedVariant ? stockStatus[selectedVariant.stockStatus] : null;
  const mainImage = product.images[mainImageIdx] || product.images[0];

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-wider text-ink-soft/60 mb-12 uppercase">
        <Link href="/" className="hover:text-mocha transition-colors">
          ראשי
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-mocha transition-colors"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square img-frame border border-bone overflow-hidden relative group">
            {mainImage ? (
              <NextImage
                key={mainImage.id}
                src={mainImage.url}
                alt={mainImage.altText || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-contain p-12 transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-soft/30 text-xs tracking-widest uppercase">
                ללא תמונה
              </div>
            )}
            {product.images.length > 1 && (
              <div
                className="absolute bottom-4 right-4 text-[10px] tracking-[0.3em] uppercase text-ink-soft bg-cream/80 px-2.5 py-1"
                dir="ltr"
              >
                {mainImageIdx + 1} / {product.images.length}
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setMainImageIdx(i)}
                  className={`relative aspect-square img-frame border overflow-hidden transition-colors ${
                    mainImageIdx === i ? "border-mocha" : "border-bone hover:border-mocha/50"
                  }`}
                  aria-label={`תמונה ${i + 1}`}
                >
                  <NextImage
                    src={img.url}
                    alt={img.altText || `תמונה ${i + 1}`}
                    fill
                    sizes="120px"
                    className="object-contain p-3"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:pt-8">
          {product.category && (
            <div className="eyebrow mb-5">{product.category.name}</div>
          )}
          <h1 className="font-display text-4xl lg:text-5xl text-ink leading-[1.1] mb-8">
            {product.name}
          </h1>

          <div className="text-3xl font-light text-ink mb-3">
            ₪{currentPrice.toLocaleString()}
          </div>

          {stock && (
            <p className={`text-sm font-light mb-10 ${stock.color}`}>
              {stock.label}
            </p>
          )}

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mb-10">
              <div className="eyebrow mb-4">בחירת גרסה</div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-5 py-2.5 border text-sm transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-ink bg-ink text-cream"
                        : "border-bone text-ink-soft hover:border-mocha hover:text-mocha"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + CTA */}
          <div className="space-y-4 mb-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-bone">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 hover:bg-cream-deep transition-colors text-ink-soft"
                  aria-label="פחות"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 hover:bg-cream-deep transition-colors text-ink-soft"
                  aria-label="עוד"
                >
                  +
                </button>
              </div>
              <button
                disabled={selectedVariant?.stockStatus === "OUT_OF_STOCK"}
                className="flex-1 h-11 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                הוסף לסל — ₪{(currentPrice * quantity).toLocaleString()}
              </button>
            </div>
            <a
              href={`https://wa.me/972526804945?text=${encodeURIComponent(
                `היי, אני מתעניין ב-${product.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-11 leading-[2.75rem] text-center border border-ink text-ink text-sm tracking-wide hover:bg-ink hover:text-cream transition-all"
            >
              שיחה עם יועץ בוואטסאפ
            </a>
          </div>

          <div className="border-t border-bone pt-8 mb-8" />

          {/* Description */}
          {product.description && (
            <div className="mb-10">
              <div className="eyebrow mb-4">על המוצר</div>
              <div className="text-ink-soft font-light text-sm leading-loose whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          {/* Spec table */}
          <div className="mb-10">
            <div className="eyebrow mb-4">מפרט</div>
            <dl className="divide-y divide-bone text-sm">
              {product.supplier && (
                <SpecRow label="מותג" value={product.supplier.name} />
              )}
              {product.category && (
                <SpecRow label="קטגוריה" value={product.category.name} />
              )}
              {product.supplierSku && (
                <SpecRow label="דגם" value={product.supplierSku} />
              )}
              {selectedVariant && (
                <SpecRow label="מק״ט" value={selectedVariant.sku} />
              )}
              {product.variants.length > 1 && (
                <SpecRow
                  label="וריאציות זמינות"
                  value={product.variants.length.toString()}
                />
              )}
              <SpecRow
                label="זמינות"
                value={stock?.label || "בדיקה"}
                valueColor={stock?.color}
              />
              <SpecRow label="משלוח" value="לכל הארץ" />
            </dl>
          </div>

          <div className="border-t border-bone mt-12 pt-10" />

          {/* Trust */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs text-ink-soft/70 font-light">
            <div>
              <div className="font-display text-lg text-ink mb-1">משלוח</div>
              <div>לכל הארץ</div>
            </div>
            <div>
              <div className="font-display text-lg text-ink mb-1">אחריות</div>
              <div>יצרן מלאה</div>
            </div>
            <div>
              <div className="font-display text-lg text-ink mb-1">ייעוץ</div>
              <div>אישי וללא עלות</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-sell */}
      {product.crossSellFrom.length > 0 && (
        <section className="mt-32 pt-16 border-t border-bone">
          <div className="text-center mb-16">
            <div className="eyebrow mb-4">גם בעניין</div>
            <h2 className="font-display text-3xl lg:text-4xl text-ink">
              משלימים את הסגנון
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-x-8">
            {product.crossSellFrom.map((rule) => (
              <ProductCard
                key={rule.relatedProduct.id}
                product={{
                  id: rule.relatedProduct.id,
                  name: rule.relatedProduct.name,
                  slug: rule.relatedProduct.slug,
                  price: rule.relatedProduct.basePrice,
                  image: rule.relatedProduct.images[0]?.url || null,
                  category: "",
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
