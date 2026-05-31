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
  const body = {
    type: input.type ?? 320,
    description: input.description,
    amount: round2(input.amount),
    currency: input.currency ?? "ILS",
    lang: input.lang ?? "he",
    maxPayments: input.maxPayments ?? 1,
    vatType: input.vatType ?? 0,
    client: input.client,
    income: input.income?.map((it) => ({
      description: it.description,
      price: round2(it.price),
      quantity: it.quantity,
    })),
    successUrl: input.successUrl,
    failureUrl: input.failureUrl,
    notifyUrl: input.notifyUrl,
    custom: input.custom,
  };

  return morningRequest<PaymentFormResponse>("POST", "/payments/form", body);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
