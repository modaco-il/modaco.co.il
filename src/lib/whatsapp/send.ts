/**
 * WhatsApp Cloud API outbound sender — single source of truth for every
 * place that wants to push a message via Meta's Graph API to a customer
 * or to Yarin himself.
 *
 * Auth model: a permanent System User token (`WHATSAPP_TOKEN`) bound to
 * Modaco's WABA, plus the `WHATSAPP_PHONE_NUMBER_ID` Meta assigned to
 * +972533478737. Both come from Meta Business Manager — see
 * `WHATSAPP_SETUP.md` at the repo root for the manual registration flow.
 *
 * The function is intentionally tolerant: if the env vars aren't set yet
 * (e.g. local dev, or before Yarin finishes Meta verification), it logs
 * the message and returns "mock" instead of throwing. That way the
 * Inngest functions and the webhook handler can call it unconditionally
 * and nothing breaks before we have credentials.
 */

const GRAPH_VERSION = "v21.0";

export type WhatsAppSendResult =
  | { ok: true; mode: "mock"; preview: string }
  | { ok: true; mode: "live"; messageId?: string }
  | { ok: false; error: string };

/**
 * Send a free-text WhatsApp message via Meta Cloud API.
 *
 * `to` must be in E.164 without the leading +. Israeli mobiles: 9725XXXXXXXX.
 * The function normalizes a few common input formats so callers don't have
 * to think about it.
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string,
): Promise<WhatsAppSendResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = normalizePhone(to);

  if (!recipient) {
    return { ok: false, error: `Invalid phone: ${to}` };
  }

  if (!token || !phoneNumberId) {
    // Pre-verification fallback — print to stdout so the dev/operator
    // can see what *would* have been sent.
    console.log(`[WA Mock] → ${recipient}\n${text}\n`);
    return {
      ok: true,
      mode: "mock",
      preview: text.slice(0, 200),
    };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipient,
          type: "text",
          text: { body: text },
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Meta API ${res.status}: ${body.slice(0, 300)}`,
      };
    }
    const j = (await res.json().catch(() => ({}))) as {
      messages?: { id: string }[];
    };
    return { ok: true, mode: "live", messageId: j.messages?.[0]?.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Send a message to Yarin (the store operator). Reads his number from
 * `WHATSAPP_ADMIN_PHONE` — set this to the new ops SIM (972533478737).
 */
export async function notifyAdmin(text: string): Promise<WhatsAppSendResult> {
  const admin = process.env.WHATSAPP_ADMIN_PHONE;
  if (!admin) {
    console.log(`[WA Admin Mock] (no WHATSAPP_ADMIN_PHONE set)\n${text}\n`);
    return { ok: true, mode: "mock", preview: text.slice(0, 200) };
  }
  return sendWhatsAppMessage(admin, text);
}

/**
 * Accept "0526804945", "052-680-4945", "+972526804945", "972526804945" and
 * normalize to "972526804945" (Meta wants E.164 without the +).
 */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  // Local Israeli format starting with 0 → strip 0, prefix 972
  if (digits.startsWith("0") && digits.length === 10) {
    return "972" + digits.slice(1);
  }
  // Already international (started with +)
  if (digits.startsWith("972") && digits.length === 12) {
    return digits;
  }
  // Some other country code or unexpected length — let Meta validate.
  return digits;
}
