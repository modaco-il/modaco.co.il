"use client";

/**
 * Dashboard health card for the payment stack.
 *
 * Fetches /api/admin/health/payments on mount (and refresh-on-click).
 * Shows three traffic-lights:
 *   Morning credentials, Morning token, Grow clearing.
 *
 * Lazy-loaded on purpose — the live Morning probe takes ~1s and we don't
 * want it blocking the dashboard render.
 */
import { useEffect, useState, useTransition } from "react";

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
  resend: { configured: boolean };
}

type Probe = "ok" | "warn" | "err" | "loading";

function dotClass(state: Probe): string {
  return state === "ok"
    ? "bg-emerald-500"
    : state === "warn"
      ? "bg-amber-500"
      : state === "err"
        ? "bg-red-500"
        : "bg-gray-300 animate-pulse";
}

export function PaymentsHealthCard() {
  const [data, setData] = useState<HealthResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/admin/health/payments", { cache: "no-store" });
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
        return;
      }
      const j = (await res.json()) as HealthResult;
      setData(j);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, []);

  const credState: Probe = !data
    ? "loading"
    : data.morning.credentials
      ? "ok"
      : "err";
  const tokenState: Probe = !data
    ? "loading"
    : !data.morning.credentials
      ? "err"
      : data.morning.tokenOk
        ? "ok"
        : "err";
  const clearingState: Probe = !data
    ? "loading"
    : !data.morning.tokenOk
      ? "err"
      : data.morning.clearingOk
        ? "ok"
        : data.morning.clearingErrorCode === 2600
          ? "warn"
          : "err";
  const resendState: Probe = !data
    ? "loading"
    : data.resend.configured
      ? "ok"
      : "err";

  const overall: Probe =
    [credState, tokenState, clearingState, resendState].includes("err")
      ? "err"
      : [credState, tokenState, clearingState, resendState].includes("warn")
        ? "warn"
        : [credState, tokenState, clearingState, resendState].includes("loading")
          ? "loading"
          : "ok";

  const headline =
    overall === "ok"
      ? "מערכת התשלום מוכנה לקבל כסף"
      : overall === "warn"
        ? clearingState === "warn"
          ? "מורנינג פעיל · ממתינים לאישור Grow לסליקה חיה"
          : "אזהרה"
        : overall === "loading"
          ? "בודק..."
          : "שגיאה במערכת התשלום";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block w-3 h-3 rounded-full ${dotClass(overall)}`}
            aria-hidden
          />
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              מצב מערכת התשלום
            </div>
            <div className="text-sm font-medium text-gray-900">{headline}</div>
          </div>
        </div>
        <button
          onClick={() => startTransition(() => void load())}
          disabled={pending}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          רענן
        </button>
      </div>

      <ul className="space-y-2 text-sm">
        <ProbeRow
          state={credState}
          label="מפתח API של Morning"
          ok="מוגדר ב-Vercel"
          err="חסר MORNING_API_KEY_ID / MORNING_API_SECRET"
        />
        <ProbeRow
          state={tokenState}
          label="חיבור ל-Morning"
          ok="הטוקן נמשך בהצלחה"
          err={data?.morning.tokenError || "כשל באימות מול Morning"}
        />
        <ProbeRow
          state={clearingState}
          label="סליקת Grow"
          ok="פעילה — לקוחות יכולים לשלם"
          warn={
            data?.morning.clearingErrorCode === 2600
              ? "ממתינים לאישור Grow (errorCode 2600)"
              : data?.morning.clearingError
          }
          err={data?.morning.clearingError || "הסליקה לא פעילה"}
        />
        <ProbeRow
          state={resendState}
          label="Resend (מיילים)"
          ok="מוגדר"
          err="חסר RESEND_API_KEY"
        />
      </ul>

      {error && (
        <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          ✗ {error}
        </div>
      )}

      {data?.checkedAt && (
        <div className="mt-3 text-[11px] text-gray-400">
          נבדק: {new Date(data.checkedAt).toLocaleString("he-IL")}
        </div>
      )}
    </div>
  );
}

function ProbeRow({
  state,
  label,
  ok,
  warn,
  err,
}: {
  state: Probe;
  label: string;
  ok: string;
  warn?: string;
  err?: string;
}) {
  const detail =
    state === "ok" ? ok : state === "warn" ? warn || ok : state === "loading" ? "בודק..." : err || "שגיאה";
  return (
    <li className="flex items-start gap-2">
      <span
        className={`mt-1.5 inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotClass(state)}`}
        aria-hidden
      />
      <div className="flex-1">
        <div className="text-gray-900">{label}</div>
        <div
          className={`text-xs ${
            state === "ok"
              ? "text-gray-500"
              : state === "warn"
                ? "text-amber-700"
                : state === "err"
                  ? "text-red-700"
                  : "text-gray-400"
          }`}
        >
          {detail}
        </div>
      </div>
    </li>
  );
}
