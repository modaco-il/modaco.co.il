/**
 * Order-tracking tokens.
 *
 * Each order can be viewed publicly at /orders/<id>?token=<hmac>. The
 * token is an HMAC-SHA256 over the order id, signed with AUTH_SECRET,
 * truncated to 16 hex chars (8 bytes / 64 bits of entropy — far more
 * than enough to defeat enumeration of cuid order ids).
 *
 * No DB column needed: the token is derived deterministically, so the
 * same link works forever (or until AUTH_SECRET rotates). If we ever
 * need to invalidate a single token we'd switch to storing a random
 * `viewToken` on Order, but that's overkill for now.
 */
import { createHmac } from "crypto";

const FALLBACK = "modaco-order-token-fallback-do-not-use-in-prod";

function getSigningKey(): string {
  return process.env.AUTH_SECRET || FALLBACK;
}

export function makeOrderToken(orderId: string): string {
  return createHmac("sha256", getSigningKey())
    .update(`order:${orderId}`)
    .digest("hex")
    .slice(0, 16);
}

export function verifyOrderToken(orderId: string, token: string): boolean {
  if (!token || token.length !== 16) return false;
  const expected = makeOrderToken(orderId);
  // Constant-time comparison
  if (expected.length !== token.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Build the absolute URL the customer follows to track their order. */
export function orderTrackingUrl(origin: string, orderId: string): string {
  const token = makeOrderToken(orderId);
  const base = origin.replace(/\/+$/, "");
  return `${base}/orders/${orderId}?token=${token}`;
}
