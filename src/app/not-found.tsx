import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "העמוד לא נמצא",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-24"
      style={{ background: "#FAF6F0", color: "#0A0908" }}
      dir="rtl"
    >
      <div className="max-w-xl w-full text-center">
        <div
          className="text-[11px] tracking-[0.32em] uppercase font-medium mb-6"
          style={{ color: "#8B6F4E" }}
        >
          404
        </div>
        <h1 className="font-display font-bold text-5xl lg:text-7xl leading-[1.05] mb-6">
          העמוד לא נמצא
        </h1>
        <p
          className="text-base lg:text-lg font-light leading-loose mb-12"
          style={{ color: "#2E2520" }}
        >
          נראה שהקישור שפעלתם בו שבור או שהעמוד הוסר.
          <br />
          בואו נחזיר אתכם לדרך הנכונה.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 h-12 px-8 text-sm tracking-wide transition-colors"
            style={{ background: "#0A0908", color: "#FAF6F0" }}
          >
            <span>חזרה לדף הבית</span>
            <span aria-hidden>←</span>
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-3 h-12 px-8 text-sm tracking-wide transition-colors"
            style={{
              background: "transparent",
              color: "#0A0908",
              border: "1px solid #0A0908",
            }}
          >
            <span>לקטלוג המלא</span>
          </Link>
        </div>

        <div
          className="mt-16 pt-12 border-t text-sm font-light"
          style={{ borderColor: "#E8DFCC", color: "#2E2520" }}
        >
          צריכים עזרה? דברו איתנו{" "}
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
