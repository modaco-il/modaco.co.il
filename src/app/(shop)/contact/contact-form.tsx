"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormResult } from "@/lib/actions/contact";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactFormResult | null, FormData>(
    async (_prev, formData) => submitContactForm(formData),
    null
  );

  if (state?.success) {
    return (
      <div className="border border-mocha/40 bg-cream-deep p-8 lg:p-10">
        <div className="eyebrow text-mocha mb-4">הפנייה התקבלה</div>
        <h2 className="font-display text-2xl lg:text-3xl text-ink mb-4">
          תודה, נחזור אליכם בהקדם
        </h2>
        <p className="text-ink-soft font-light leading-loose">
          קיבלנו את הפנייה שלכם. בימי עסקים רגילים נחזור אליכם תוך 24 שעות.
          <br />
          במקרים דחופים ניתן להתקשר ל-
          <a href="tel:0526804945" className="text-mocha underline" dir="ltr">
            052-680-4945
          </a>{" "}
          או לשלוח וואטסאפ.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="שם מלא" name="name" required />
        <Field
          label="טלפון"
          name="phone"
          type="tel"
          dir="ltr"
          required
          placeholder="050-1234567"
        />
      </div>
      <Field
        label="אימייל"
        name="email"
        type="email"
        dir="ltr"
        placeholder="name@example.com"
      />
      <Field label="נושא" name="subject" placeholder="מה הפנייה שלכם בקצרה?" />
      <div>
        <label className="eyebrow block mb-3" htmlFor="message">
          הודעה *
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={4000}
          placeholder="במה נוכל לעזור?"
          className="w-full bg-cream-deep border border-bone px-5 py-4 text-ink placeholder:text-ink-soft/40 outline-none focus:border-mocha transition-colors font-light text-base resize-none"
        />
      </div>

      {/* Honeypot — hidden from real users, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] opacity-0 pointer-events-none"
      />

      {state && !state.success && state.error && (
        <p className="text-sm font-light" style={{ color: "#A02323" }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors disabled:opacity-50"
      >
        {isPending ? "שולח..." : "שלח פנייה"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  dir,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  dir?: string;
  placeholder?: string;
}) {
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
        placeholder={placeholder}
        className="w-full h-12 bg-cream-deep border border-bone px-5 text-ink placeholder:text-ink-soft/40 outline-none focus:border-mocha transition-colors font-light"
      />
    </div>
  );
}
