"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import { updateCartItem, removeFromCart } from "@/lib/actions/cart";

interface CartItem {
  id: string;
  quantity: number;
  variant: {
    id: string;
    name: string;
    sku: string;
    priceOverride: number | null;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      images: { url: string }[];
      category: { name: string } | null;
    };
  };
}

interface CartViewProps {
  items: CartItem[];
}

export function CartView({ items: initialItems }: CartViewProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  function getPrice(item: CartItem) {
    return item.variant.priceOverride ?? item.variant.product.basePrice;
  }

  const subtotal = items.reduce(
    (sum, item) => sum + getPrice(item) * item.quantity,
    0
  );

  function handleQuantityChange(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      handleRemove(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    startTransition(() => {
      updateCartItem(itemId, newQuantity);
    });
  }

  function handleRemove(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    startTransition(() => {
      removeFromCart(itemId);
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        עגלת קניות ({items.length} פריטים)
      </h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200"
          >
            {/* Image */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              {item.variant.product.images[0] ? (
                <img
                  src={item.variant.product.images[0].url}
                  alt={item.variant.product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  תמונה
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.variant.product.slug}`}
                className="font-medium hover:underline line-clamp-1"
              >
                {item.variant.product.name}
              </Link>
              {item.variant.name !== item.variant.product.name && (
                <p className="text-sm text-gray-500">{item.variant.name}</p>
              )}
              <p className="text-sm font-bold mt-1">
                ₪{getPrice(item).toLocaleString()}
              </p>

              {/* Quantity controls */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    className="p-1.5 hover:bg-gray-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 text-sm">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    className="p-1.5 hover:bg-gray-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Line total */}
            <div className="text-left font-bold whitespace-nowrap">
              ₪{(getPrice(item) * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span>סכום ביניים</span>
          <span>₪{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>משלוח</span>
          <span>יחושב בשלב הבא</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>סה&quot;כ</span>
          <span>₪{subtotal.toLocaleString()}</span>
        </div>
        <Link href="/checkout" className="block">
          <Button size="lg" className="w-full mt-4" disabled={isPending}>
            המשך לתשלום
          </Button>
        </Link>
        <Link href="/" className="block text-center">
          <Button variant="ghost" size="sm">
            המשך לקנות
          </Button>
        </Link>
      </div>
    </div>
  );
}
