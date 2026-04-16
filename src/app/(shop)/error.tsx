"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Shop error]", error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center px-6 py-24"
      dir="rtl"
    >
      <div className="max-w-xl w-full text-center">
        <div
          className="text-[11px] tracking-[0.32em] uppercase font-medium mb-6"
          style={{ color: "#8B6F4E" }}
        >
          שגיאה
        </div>
        <h1 className="font-display font-bold text-4xl lg:text-6xl leading-[1.05] mb-6 text-ink">
          משהו השתבש
        </h1>
        <p
          className="text-base lg:text-lg font-light leading-loose mb-10"
          style={{ color: "#2E2520" }}
        >
          קרתה תקלה זמנית בטעינת התוכן. נסו לרענן, או חזרו לדף הבית.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-3 h-12 px-8 text-sm tracking-wide transition-colors"
            style={{ background: "#0A0908", color: "#FAF6F0" }}
          >
            נסו שוב
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 h-12 px-8 text-sm tracking-wide transition-colors"
            style={{
              background: "transparent",
              color: "#0A0908",
              border: "1px solid #0A0908",
            }}
          >
            <span>חזרה לדף הבית</span>
            <span aria-hidden>←</span>
          </Link>
        </div>

        <div
          className="mt-16 pt-10 border-t text-sm font-light"
          style={{ borderColor: "#E8DFCC", color: "#2E2520" }}
        >
          התקלה חוזרת? דברו איתנו{" "}
          <a
            href="tel:0526804945"
            className="border-b pb-0.5"
            style={{ color: "#8B6F4E", borderColor: "#8B6F4E" }}
            dir="ltr"
          >
            052-680-4945
          </a>
        </div>
      </div>
    </div>
  );
}
