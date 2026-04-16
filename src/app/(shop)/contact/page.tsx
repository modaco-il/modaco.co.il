import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "צרו קשר",
  description: "צרו איתנו קשר. טלפון, מייל או השאירו פנייה ונחזור אליכם.",
};

export default function ContactPage() {
  return (
    <div>
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 lg:pt-32 pb-12">
        <div className="max-w-3xl">
          <div className="eyebrow mb-6">צרו קשר</div>
          <h1 className="font-display text-5xl lg:text-7xl text-ink leading-[1.05]">
            נשמח לשמוע<br />
            <span className="text-mocha font-display-light">מכם</span>
          </h1>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="eyebrow mb-6">השאירו פנייה</div>
            <ContactForm />
            <p className="text-xs text-ink-soft font-light leading-relaxed mt-6">
              פרטי הפנייה יישמרו ויטופלו בהתאם ל
              <Link href="/privacy" className="text-mocha hover:text-mocha-hover underline">
                מדיניות הפרטיות
              </Link>
              . לא נשתמש בהם לצרכי שיווק ללא הסכמתך המפורשת.
            </p>
          </div>

          {/* Info */}
          <div className="lg:col-span-5 lg:pr-8">
            <div className="border-t border-bone lg:border-t-0 pt-12 lg:pt-0 space-y-10">
              <Info label="טלפון">
                <a href="tel:0526804945" className="text-2xl font-light text-ink hover:text-mocha transition-colors" dir="ltr">
                  052-680-4945
                </a>
              </Info>
              <Info label="אימייל">
                <a href="mailto:yarin@modaco.co.il" className="text-base text-ink hover:text-mocha transition-colors" dir="ltr">
                  yarin@modaco.co.il
                </a>
              </Info>
              <Info label="שעות פעילות">
                <div className="text-base text-ink-soft font-light leading-relaxed">
                  א׳–ה׳: 08:00–18:00<br />
                  ו׳: 08:00–13:00
                </div>
              </Info>
              <Info label="וואטסאפ">
                <a
                  href="https://wa.me/972526804945"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-7 py-3 border border-ink text-ink text-sm tracking-wide hover:bg-ink hover:text-cream transition-all"
                >
                  פתיחת שיחה
                </a>
              </Info>

              <div className="bg-ink text-cream p-8 mt-12">
                <div className="eyebrow text-mocha-soft mb-3">B2B</div>
                <h3 className="font-display text-2xl text-cream mb-3">אדריכלים ואנשי מקצוע</h3>
                <p className="text-cream/70 font-light text-sm leading-loose">
                  צרו קשר לקבלת מחירון ייעודי לאנשי מקצוע והרשמה לחשבון B2B עם תנאים מותאמים.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-3">{label}</div>
      {children}
    </div>
  );
}
