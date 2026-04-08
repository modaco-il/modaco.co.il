import { getCart } from "@/lib/actions/cart";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata = {
  title: "תשלום — Modaco",
};

export default async function CheckoutPage() {
  const cart = await getCart();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const subtotal = cart.items.reduce((sum, item) => {
    const price =
      item.variant.priceOverride ?? item.variant.product.basePrice;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">השלמת הזמנה</h1>
      <CheckoutForm
        items={cart.items.map((item) => ({
          id: item.id,
          name: item.variant.product.name,
          variant: item.variant.name,
          quantity: item.quantity,
          price: item.variant.priceOverride ?? item.variant.product.basePrice,
        }))}
        subtotal={subtotal}
      />
    </div>
  );
}
