import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "צרו קשר — Modaco",
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
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="שם מלא" name="name" required />
                <Field label="טלפון" name="phone" type="tel" dir="ltr" required />
              </div>
              <Field label="אימייל" name="email" type="email" dir="ltr" />
              <Field label="נושא" name="subject" />
              <div>
                <label className="eyebrow block mb-3" htmlFor="message">
                  הודעה *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  placeholder="במה נוכל לעזור?"
                  className="w-full bg-cream-deep border border-bone px-5 py-4 text-ink placeholder:text-ink-soft/40 outline-none focus:border-mocha transition-colors font-light text-base resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors"
              >
                שלח פנייה
              </button>
            </form>
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
                <a href="mailto:Modacopirzul@gmail.com" className="text-base text-ink hover:text-mocha transition-colors" dir="ltr">
                  Modacopirzul@gmail.com
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

function Field({ label, name, type = "text", required = false, dir }: { label: string; name: string; type?: string; required?: boolean; dir?: string }) {
  return (
    <div>
      <label className="eyebrow block mb-3" htmlFor={name}>
        {label} {required && "*"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        dir={dir}
        className="w-full h-12 bg-cream-deep border border-bone px-5 text-ink outline-none focus:border-mocha transition-colors font-light"
      />
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
