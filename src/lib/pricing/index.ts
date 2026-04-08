import { db } from "@/lib/db";

interface PriceResult {
  price: number;
  originalPrice: number;
  discountPercent: number;
  source: "customer_group" | "group_price" | "base";
}

/**
 * Resolve the final price for a product/variant based on customer group.
 *
 * Priority:
 * 1. Specific group price for this product → use it
 * 2. Customer group discount percent → apply to base price
 * 3. Default base price (B2C retail)
 */
export async function resolvePrice(
  productId: string,
  variantId: string | null,
  customerGroupId: string | null
): Promise<PriceResult> {
  const product = await db.product.findUniqueOrThrow({
    where: { id: productId },
    include: {
      variants: variantId ? { where: { id: variantId } } : false,
      groupPrices: customerGroupId
        ? { where: { groupId: customerGroupId } }
        : false,
    },
  });

  const basePrice =
    variantId && product.variants?.[0]?.priceOverride != null
      ? product.variants[0].priceOverride
      : product.basePrice;

  // 1. Check specific group price
  if (customerGroupId && product.groupPrices?.length) {
    const groupPrice = product.groupPrices[0];
    return {
      price: groupPrice.price,
      originalPrice: basePrice,
      discountPercent: Math.round((1 - groupPrice.price / basePrice) * 100),
      source: "group_price",
    };
  }

  // 2. Check customer group discount
  if (customerGroupId) {
    const group = await db.customerGroup.findUnique({
      where: { id: customerGroupId },
    });
    if (group && group.discountPercent > 0) {
      const discounted = basePrice * (1 - group.discountPercent / 100);
      return {
        price: Math.round(discounted * 100) / 100,
        originalPrice: basePrice,
        discountPercent: group.discountPercent,
        source: "customer_group",
      };
    }
  }

  // 3. Default retail price
  return {
    price: basePrice,
    originalPrice: basePrice,
    discountPercent: 0,
    source: "base",
  };
}

/**
 * Resolve prices for multiple variants at once (cart, product page).
 */
export async function resolvePrices(
  items: { productId: string; variantId: string | null }[],
  customerGroupId: string | null
): Promise<Map<string, PriceResult>> {
  const results = new Map<string, PriceResult>();
  await Promise.all(
    items.map(async (item) => {
      const key = item.variantId || item.productId;
      const result = await resolvePrice(
        item.productId,
        item.variantId,
        customerGroupId
      );
      results.set(key, result);
    })
  );
  return results;
}
