"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-24" dir="rtl">
      <div className="max-w-lg w-full text-center">
        <div className="text-xs tracking-widest uppercase text-red-600 mb-4 font-semibold">
          שגיאת מערכת
        </div>
        <h1 className="font-bold text-3xl mb-4 text-gray-900">
          משהו השתבש בפאנל הניהול
        </h1>
        <p className="text-gray-600 mb-8">
          קרתה תקלה זמנית. בדקו את הלוגים או נסו שוב.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-8 font-mono" dir="ltr">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="h-11 px-6 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors"
          >
            נסו שוב
          </button>
          <Link
            href="/admin/dashboard"
            className="h-11 px-6 border border-gray-300 text-gray-900 text-sm rounded hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            לדשבורד
          </Link>
        </div>
      </div>
    </div>
  );
}
