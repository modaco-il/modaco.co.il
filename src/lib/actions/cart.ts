"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { inngest } from "@/lib/inngest/client";

const CART_COOKIE = "modaco_cart_session";

async function getOrCreateCart() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (sessionId) {
    const existing = await db.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: { take: 1 } },
                },
              },
            },
          },
        },
      },
    });
    if (existing) return existing;
  }

  // Create new cart
  sessionId = crypto.randomUUID();
  const cart = await db.cart.create({
    data: { sessionId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: { take: 1 } },
              },
            },
          },
        },
      },
    },
  });

  cookieStore.set(CART_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return cart;
}

export async function getCart() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionId) return null;

  return db.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                  category: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function addToCart(variantId: string, quantity: number = 1) {
  const cart = await getOrCreateCart();

  const existing = cart.items.find((i) => i.variantId === variantId);

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, variantId, quantity },
    });
  }

  // Trigger abandoned cart check
  await inngest.send({
    name: "cart/updated",
    data: { cartId: cart.id },
  });

  return { success: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  if (quantity <= 0) {
    await db.cartItem.delete({ where: { id: itemId } });
  } else {
    await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  return { success: true };
}

export async function removeFromCart(itemId: string) {
  await db.cartItem.delete({ where: { id: itemId } });
  return { success: true };
}

export async function getCartCount() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionId) return 0;

  const result = await db.cartItem.aggregate({
    where: { cart: { sessionId } },
    _sum: { quantity: true },
  });

  return result._sum.quantity || 0;
}
