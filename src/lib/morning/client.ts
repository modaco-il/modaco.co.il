/**
 * Morning (Green Invoice) API client.
 *
 * Auth flow:
 *   POST /account/token { id, secret } → { token, expires }
 *   Send token as `Authorization: Bearer <token>` for all subsequent calls.
 *   Tokens are valid for ~1 hour. We cache the latest one in-memory and
 *   refresh on demand.
 *
 * Module-level state. Safe in Node single-process; in Vercel serverless
 * each cold invocation will mint its own token, which Morning is fine with.
 */

const BASE = "https://api.greeninvoice.co.il/api/v1";

interface CachedToken {
  token: string;
  expiresAt: number; // unix seconds
}

let cached: CachedToken | null = null;

function getCredentials(): { id: string; secret: string } {
  const id = process.env.MORNING_API_KEY_ID;
  const secret = process.env.MORNING_API_SECRET;
  if (!id || !secret) {
    throw new Error(
      "MORNING_API_KEY_ID / MORNING_API_SECRET missing from environment",
    );
  }
  return { id, secret };
}

async function fetchToken(): Promise<CachedToken> {
  const { id, secret } = getCredentials();
  const r = await fetch(`${BASE}/account/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, secret }),
    cache: "no-store",
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Morning auth failed (${r.status}): ${body.slice(0, 200)}`);
  }
  const j = (await r.json()) as { token: string; expires: number };
  return { token: j.token, expiresAt: j.expires };
}

async function getToken(): Promise<string> {
  // Refresh if missing or within 60s of expiry — gives requests headroom
  const now = Math.floor(Date.now() / 1000);
  if (!cached || cached.expiresAt - now < 60) {
    cached = await fetchToken();
  }
  return cached.token;
}

/**
 * Generic authenticated request helper. Body is sent as JSON; response
 * is parsed as JSON. Throws on non-2xx with Morning's errorMessage so
 * callers can surface it.
 */
export async function morningRequest<T = unknown>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await getToken();
  const url = `${BASE}${path.startsWith("/") ? path : "/" + path}`;
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  };
  if (body !== undefined) init.body = JSON.stringify(body);

  const r = await fetch(url, init);
  const text = await r.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(`Morning ${path} returned non-JSON (${r.status}): ${text.slice(0, 200)}`);
  }
  if (!r.ok) {
    const err = parsed as { errorCode?: number; errorMessage?: string };
    throw new Error(
      `Morning ${path} ${r.status} ${err?.errorCode ?? ""}: ${err?.errorMessage ?? text.slice(0, 200)}`,
    );
  }
  return parsed as T;
}

/** Reset the cached token. Useful for tests + after key rotation. */
export function _resetMorningTokenCache() {
  cached = null;
}
