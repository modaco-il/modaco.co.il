"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Truck, Shield, Phone } from "lucide-react";
import Link from "next/link";
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
    category: { id: string; name: string; slug: string } | null;
    variants: Variant[];
    images: Image[];
    crossSellFrom: CrossSell[];
  };
}

const stockStatusLabels: Record<string, { label: string; color: string }> = {
  IN_STOCK: { label: "במלאי — משלוח מהיר", color: "text-green-600" },
  AT_SUPPLIER: { label: "במלאי הספק — 3-5 ימי עסקים", color: "text-blue-600" },
  ON_ORDER: { label: "בהזמנה — צרו קשר לזמן אספקה", color: "text-yellow-600" },
  OUT_OF_STOCK: { label: "אזל מהמלאי", color: "text-red-600" },
};

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);

  const currentPrice =
    selectedVariant?.priceOverride ?? product.basePrice;
  const stockInfo = selectedVariant
    ? stockStatusLabels[selectedVariant.stockStatus]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-black">
          ראשי
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-black"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-black">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            {product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.images[0].altText || product.name}
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <span className="text-lg">תמונת מוצר</span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <div
                  key={img.id}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={img.altText || ""}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Badge variant="secondary" className="mb-2">
                {product.category.name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold">
            ₪{currentPrice.toLocaleString()}
          </div>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="space-y-2">
              <Label>בחר גרסה:</Label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      selectedVariant?.id === v.id
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          {stockInfo && (
            <p className={`text-sm font-medium ${stockInfo.color}`}>
              {stockInfo.label}
            </p>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              disabled={selectedVariant?.stockStatus === "OUT_OF_STOCK"}
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              הוסף לסל — ₪{(currentPrice * quantity).toLocaleString()}
            </Button>
          </div>

          <Separator />

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-bold mb-2">תיאור המוצר</h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          {/* SKU */}
          {selectedVariant && (
            <p className="text-xs text-gray-400">
              מק&quot;ט: {selectedVariant.sku}
            </p>
          )}

          <Separator />

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-600">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-5 h-5" />
              <span>משלוח לכל הארץ</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="w-5 h-5" />
              <span>אחריות יצרן</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Phone className="w-5 h-5" />
              <span>ייעוץ מקצועי</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-sell */}
      {product.crossSellFrom.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">משלימים את הסגנון</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-gray-700">{children}</p>;
}
