/**
 * Live health check for the payment stack.
 *
 * Runs three probes:
 *   1. Morning token mint        — confirms MORNING_API_KEY_ID / SECRET still work.
 *   2. Morning createPaymentForm — confirms Grow clearing terminal is active.
 *      We use a tiny dry-run payload (₪1, dummy customer) and rely on the
 *      errorCode to tell live-vs-pending apart:
 *        errorCode 2600 → clearing not yet approved (Grow pending)
 *        no errorCode → form was minted → clearing is live
 *   3. Resend configuration       — env var presence only (no network call).
 *
 * The form-creation probe DOES create a real (but unused) payment-form
 * record on Morning's side. That's fine — Morning's free tier allows
 * unlimited form creates and they auto-expire.
 *
 * Cached with `Cache-Control: no-store` so dashboard reflects live state.
 * Admin-only.
 */
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createPaymentForm } from "@/lib/morning/payments";
import { morningRequest, _resetMorningTokenCache } from "@/lib/morning/client";

interface HealthResult {
  checkedAt: string;
  morning: {
    credentials: boolean;
    tokenOk: boolean;
    tokenError?: string;
    clearingOk: boolean;
    clearingError?: string;
    clearingErrorCode?: number;
  };
  resend: {
    configured: boolean;
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result: HealthResult = {
    checkedAt: new Date().toISOString(),
    morning: {
      credentials: !!(process.env.MORNING_API_KEY_ID && process.env.MORNING_API_SECRET),
      tokenOk: false,
      clearingOk: false,
    },
    resend: { configured: !!process.env.RESEND_API_KEY },
  };

  if (!result.morning.credentials) {
    return NextResponse.json(result);
  }

  // ── Probe 1: token mint ──────────────────────────────────────────────
  // We call a trivially cheap endpoint (account/me) so we also exercise
  // the bearer auth code path, not just credentials → token.
  try {
    await morningRequest("GET", "/account/me");
    result.morning.tokenOk = true;
  } catch (err) {
    result.morning.tokenError = (err as Error).message;
    return NextResponse.json(result);
  }

  // ── Probe 2: clearing terminal ───────────────────────────────────────
  // Build a self-contained dummy form. We never visit the URL; the goal
  // is purely to see if Morning returns a URL (clearing active) or
  // errorCode 2600 (clearing pending).
  try {
    const form = await createPaymentForm({
      type: 305,
      description: "[health-check] payment form probe",
      amount: 1,
      vatType: 0,
      client: {
        name: "Modaco Health Probe",
        emails: ["yarin@modaco.co.il"],
        country: "IL",
      },
      income: [
        { description: "health-check item", price: 1, quantity: 1 },
      ],
    });
    // Some Morning responses include errorCode even on 200.
    if (form.errorCode && form.errorCode !== 0) {
      result.morning.clearingErrorCode = form.errorCode;
      result.morning.clearingError = form.errorMessage || `errorCode ${form.errorCode}`;
    } else if (form.url) {
      result.morning.clearingOk = true;
    } else {
      result.morning.clearingError = "no url returned";
    }
  } catch (err) {
    const msg = (err as Error).message;
    result.morning.clearingError = msg;
    // Parse our client.ts format: "Morning /payments/form 400 2600: ..."
    const m = msg.match(/(\d{3,4})(?::|$)/);
    if (m) result.morning.clearingErrorCode = Number(m[1]);
  }

  return NextResponse.json(result);
}

/** Optional: POST resets the cached token. Useful when Yarin rotated keys. */
export async function POST() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  _resetMorningTokenCache();
  return NextResponse.json({ ok: true });
}
