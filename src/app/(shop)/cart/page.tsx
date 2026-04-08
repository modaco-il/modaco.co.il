import { getCart } from "@/lib/actions/cart";
import { CartView } from "@/components/shop/cart-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export const metadata = {
  title: "עגלת קניות — Modaco",
};

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">העגלה ריקה</h1>
        <p className="text-gray-500 mb-8">עדיין לא הוספת מוצרים לעגלה</p>
        <Link href="/">
          <Button size="lg">המשך לקטלוג</Button>
        </Link>
      </div>
    );
  }

  return <CartView items={items} />;
}
