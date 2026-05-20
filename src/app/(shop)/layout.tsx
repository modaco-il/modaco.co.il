import { getCategories } from "@/lib/categories";
import { ShopChrome } from "@/components/shop/shop-chrome";

/**
 * Server layout — fetches the category list from DB (with a 60s cache) and
 * hands it to the client chrome. This is what lets the admin agent add a
 * category and have it appear on header/footer/bento within a minute, with
 * no redeploy.
 */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  return <ShopChrome categories={categories}>{children}</ShopChrome>;
}
