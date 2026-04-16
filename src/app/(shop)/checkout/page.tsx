import { getCart } from "@/lib/actions/cart";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata = {
  title: "תשלום",
  robots: { index: false, follow: false },
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
    <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
      <div className="eyebrow mb-4">עגלה · תשלום</div>
      <h1 className="font-display font-bold text-4xl lg:text-5xl text-ink mb-10 leading-[1.05]">
        השלמת הזמנה
      </h1>
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
