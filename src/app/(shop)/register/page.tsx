"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { register } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await register(formData);
      if (result.success) {
        router.push("/");
        router.refresh();
      }
      return result;
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div
            className="text-[11px] tracking-[0.32em] uppercase font-medium mb-5"
            style={{ color: "#8B6F4E" }}
          >
            Modaco
          </div>
          <h1
            className="font-display font-bold text-4xl lg:text-5xl mb-4"
            style={{ color: "#0A0908" }}
          >
            פתיחת חשבון
          </h1>
          <p className="font-light text-base" style={{ color: "#2E2520" }}>
            הצטרפו כדי להזמין, לקבל מחירים אישיים ולמעקב אחר הזמנות.
          </p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 h-12 mb-6 transition-colors"
          style={{
            background: "#0A0908",
            color: "#FAF6F0",
          }}
        >
          <GoogleIcon />
          <span className="text-sm tracking-wide">הירשמו עם Google</span>
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-bone" />
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "#2E2520", opacity: 0.5 }}
          >
            או
          </span>
          <div className="flex-1 h-px bg-bone" />
        </div>

        <form action={formAction} className="space-y-5">
          <Field label="שם מלא" name="name" required />
          <Field label="אימייל" name="email" type="email" dir="ltr" required />
          <Field label="טלפון" name="phone" type="tel" dir="ltr" required placeholder="050-1234567" />
          <Field label="סיסמה" name="password" type="password" required minLength={6} />

          {state && !state.success && (
            <p className="text-sm" style={{ color: "#A02323" }}>
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 transition-colors text-sm tracking-wide disabled:opacity-50"
            style={{ background: "#FAF6F0", color: "#0A0908", border: "1px solid #0A0908" }}
          >
            {isPending ? "נרשם..." : "פתיחת חשבון"}
          </button>
        </form>

        <div className="text-center mt-8 text-sm" style={{ color: "#2E2520" }}>
          כבר יש לכם חשבון?{" "}
          <Link
            href="/login"
            className="border-b pb-0.5"
            style={{ color: "#8B6F4E", borderColor: "#8B6F4E" }}
          >
            התחברות
          </Link>
        </div>

        <p className="text-xs text-center mt-6 font-light" style={{ color: "#2E2520", opacity: 0.6 }}>
          אדריכלים וקבלנים — לאחר ההרשמה צרו קשר לחשבון B2B ומחירון ייעודי.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  dir,
  placeholder,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  dir?: string;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[10px] tracking-[0.3em] uppercase mb-2 font-medium"
        style={{ color: "#8B6F4E" }}
      >
        {label} {required && "*"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        dir={dir}
        minLength={minLength}
        placeholder={placeholder}
        className="w-full h-12 px-5 outline-none transition-colors font-light"
        style={{
          background: "#F2EBDD",
          border: "1px solid #E8DFCC",
          color: "#0A0908",
        }}
        autoComplete={
          type === "password"
            ? "new-password"
            : type === "email"
            ? "email"
            : type === "tel"
            ? "tel"
            : undefined
        }
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
