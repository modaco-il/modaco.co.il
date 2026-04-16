import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ההזמנה התקבלה",
};

function CheckIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="31" stroke="#8B6F4E" strokeWidth="1" opacity="0.4" />
      <path d="M20 32l8 8 16-16" stroke="#8B6F4E" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OrderConfirmedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="text-center max-w-xl">
        <div className="flex justify-center mb-10">
          <CheckIcon />
        </div>
        <div className="eyebrow mb-5">תודה</div>
        <h1 className="font-display font-bold text-4xl lg:text-6xl text-ink mb-6 leading-[1.05]">
          ההזמנה<br />
          <span style={{ color: "#8B6F4E", fontWeight: 300 }}>התקבלה</span>
        </h1>
        <p className="text-ink-soft font-light text-lg mb-12 leading-loose">
          אישור הזמנה נשלח אליכם במייל ובוואטסאפ.<br />
          ניצור קשר תוך 24 שעות עם פרטי המשלוח.
        </p>

        <div className="bg-cream-deep border border-bone p-8 mb-12 text-right space-y-5">
          <div>
            <div className="eyebrow mb-2">מה הלאה?</div>
            <p className="text-sm text-ink-soft font-light leading-relaxed">
              נתחיל לטפל בהזמנה שלכם ונעדכן אותכם כשהמשלוח יצא לדרך.
            </p>
          </div>
          <div className="border-t border-bone pt-5">
            <div className="eyebrow mb-2">שאלות?</div>
            <p className="text-sm text-ink-soft font-light leading-relaxed">
              צרו קשר בטלפון{" "}
              <a href="tel:0526804945" className="text-mocha hover:text-mocha-hover" dir="ltr">
                052-680-4945
              </a>{" "}
              או דרך{" "}
              <Link href="/contact" className="text-mocha hover:text-mocha-hover">
                עמוד יצירת הקשר
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/catalog"
            className="px-8 py-4 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors"
          >
            להמשך קטלוג
          </Link>
          <Link
            href="/"
            className="px-8 py-4 border border-ink text-ink text-sm tracking-wide hover:bg-ink hover:text-cream transition-all"
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
