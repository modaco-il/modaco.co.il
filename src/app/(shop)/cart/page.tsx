import { getCart } from "@/lib/actions/cart";
import { CartView } from "@/components/shop/cart-view";
import Link from "next/link";

export const metadata = {
  title: "עגלת קניות",
  robots: { index: false, follow: false },
};

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <div className="text-ink-soft/40 flex justify-center mb-8">
            <CartIcon />
          </div>
          <div className="eyebrow mb-4">עגלה</div>
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-ink mb-4">
            העגלה ריקה
          </h1>
          <p className="text-ink-soft font-light mb-10">
            עדיין לא הוספתם מוצרים לעגלה.
          </p>
          <Link
            href="/catalog"
            className="inline-block px-8 py-4 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors"
          >
            לקטלוג המוצרים
          </Link>
        </div>
      </div>
    );
  }

  return <CartView items={items} />;
}
