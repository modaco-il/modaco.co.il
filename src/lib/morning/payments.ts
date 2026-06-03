/**
 * Morning payment-link creation.
 *
 * POST /payments/form returns a hosted-checkout URL on Morning's domain.
 * The customer is redirected there, enters card / Bit / Apple Pay / Google
 * Pay, and Morning generates a חשבונית מס קבלה (type 305) on success.
 * We get notified via the notifyUrl webhook so we can mark the order as
 * PAID in our DB.
 *
 * This module assumes credentials are wired (MORNING_API_KEY_ID +
 * MORNING_API_SECRET in env). The hosted form will fail with errorCode
 * 2600 until Grow clearing is approved — code is written so that
 * integration "just works" the moment Grow flips the switch.
 */
import { morningRequest } from "./client";

export type MorningDocType =
  | 305 // חשבונית מס קבלה (combined invoice + receipt — best for online)
  | 320 // חשבונית מס (tax invoice only — default for עוסק מורשה)
  | 400; // קבלה (receipt only)

export interface MorningLineItem {
  /** Hebrew description shown on the invoice line */
  description: string;
  /** Unit price excluding VAT */
  price: number;
  quantity: number;
}

export interface CreatePaymentFormInput {
  /** Document type — default 320 = חשבונית מס (matches the plugin's docType setting) */
  type?: MorningDocType;
  /** Free-text purpose, e.g. "הזמנה MOD-00001 - מודקו" */
  description: string;
  /** Total order total INCLUDING VAT */
  amount: number;
  /** ILS is the default; supply otherwise if needed */
  currency?: "ILS" | "USD" | "EUR";
  /** Document language. "he" recommended for Israeli buyers. */
  lang?: "he" | "en";
  /** Max installments (1 = pay-in-full). */
  maxPayments?: number;
  /** Optional plugin override. Defaults to MORNING_PLUGIN_ID env var. */
  pluginId?: string;
  /** Optional payment group (100=credit card, 120=Bit). Defaults to MORNING_GROUP env var. */
  groupId?: number;
  /** Customer details — Morning uses these to fill the invoice */
  client?: {
    name?: string;
    emails?: string[];
    phone?: string;
    taxId?: string;
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  /** Line items — kept separate from amount so the invoice itemizes the order */
  income?: MorningLineItem[];
  /** Where to send the customer on success */
  successUrl?: string;
  /** Where to send the customer on failure/cancel */
  failureUrl?: string;
  /** Server-to-server webhook (POST) with the result */
  notifyUrl?: string;
  /** Custom data passed through to webhook in the `custom` field */
  custom?: string;
  /** VAT handling — 0 = included in price, 1 = added on top, 2 = exempt */
  vatType?: 0 | 1 | 2;
}

export interface PaymentFormResponse {
  /** Hosted page URL. Redirect the customer here. */
  url: string;
  /** Morning's internal payment-form id, for reconciliation */
  formId?: string;
  /** Sometimes returned as errorCode/errorMessage even on 200 */
  errorCode?: number;
  errorMessage?: string;
}

/**
 * Create a hosted payment form. Returns the URL the storefront should
 * redirect the customer to.
 */
export async function createPaymentForm(
  input: CreatePaymentFormInput,
): Promise<PaymentFormResponse> {
  const pluginId = input.pluginId ?? process.env.MORNING_PLUGIN_ID;
  if (!pluginId) {
    throw new Error(
      "MORNING_PLUGIN_ID is required — set it in env (Morning Digital Payments plugin id)",
    );
  }
  const groupId = input.groupId ?? Number(process.env.MORNING_GROUP ?? 100);

  // VAT handling — Morning's API requires amount-vs-income reconciliation:
  //   when vatType=1 (VAT added on top), amount + every income.price must be
  //   the *net* (pre-VAT) value, and Morning adds VAT automatically on top.
  //   Any other combination returns errorCode 2422 "חוסר התאמה בין סכום
  //   התקבולים לסכום התשלומים". Verified against /payments/form on
  //   2026-06-03 against plugin 8b584ecc-... (verified URL returned).
  //
  // Our input.amount is the order's gross total (what the customer sees in
  // the cart, including VAT). Israeli VAT is currently 17%. We compute net
  // and split it across income lines proportionally to keep the math
  // self-consistent.
  const VAT_RATE = 0.17;
  const grossTotal = round2(input.amount);
  const netTotal = round2(grossTotal / (1 + VAT_RATE));
  const incomeLines = input.income?.length
    ? scaleIncomeToNet(input.income, netTotal)
    : undefined;

  const body = {
    type: input.type ?? 320,
    description: input.description,
    amount: netTotal,
    currency: input.currency ?? "ILS",
    lang: input.lang ?? "he",
    maxPayments: input.maxPayments ?? 1,
    vatType: 1,
    pluginId,
    groupId,
    client: input.client,
    income: incomeLines,
    successUrl: input.successUrl,
    failureUrl: input.failureUrl,
    notifyUrl: input.notifyUrl,
    custom: input.custom,
  };

  return morningRequest<PaymentFormResponse>("POST", "/payments/form", body);
}

/**
 * Rescale gross-price income lines to net values that sum to netTotal.
 * Caller passes prices already including VAT (storefront prices); Morning
 * wants net prices because we set vatType=1. We scale by netTotal/grossSum
 * to keep proportions intact, and absorb any rounding drift on the last line.
 */
function scaleIncomeToNet(
  lines: MorningLineItem[],
  netTotal: number,
): MorningLineItem[] {
  const grossSum = lines.reduce((s, it) => s + it.price * it.quantity, 0);
  if (grossSum === 0) return lines;
  const factor = netTotal / grossSum;
  const scaled = lines.map((it) => ({
    description: it.description,
    price: round2(it.price * factor),
    quantity: it.quantity,
    vatType: 1 as const,
  }));
  const sumAfter = scaled.reduce((s, it) => s + it.price * it.quantity, 0);
  const drift = round2(netTotal - sumAfter);
  if (drift !== 0 && scaled.length > 0) {
    const last = scaled[scaled.length - 1];
    last.price = round2(last.price + drift / last.quantity);
  }
  return scaled;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
