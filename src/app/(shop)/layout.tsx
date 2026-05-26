import { getCategories } from "@/lib/categories";
import { getCartCount } from "@/lib/actions/cart";
import { ShopChrome } from "@/components/shop/shop-chrome";

/**
 * Server layout — fetches the category list from DB (with a 60s cache) and
 * hands it to the client chrome. This is what lets the admin agent add a
 * category and have it appear on header/footer/bento within a minute, with
 * no redeploy.
 *
 * Cart count is fetched per-request and threaded through to the header so
 * customers see a live badge on the cart icon as they add items.
 */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, cartCount] = await Promise.all([
    getCategories(),
    getCartCount().catch(() => 0),
  ]);
  return (
    <ShopChrome categories={categories} cartCount={cartCount}>
      {children}
    </ShopChrome>
  );
}
