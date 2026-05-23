"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, Loader2, MessageCircle, Building2, User } from "lucide-react";
import { submitCheckout, type CheckoutResult } from "@/lib/actions/checkout";

interface CheckoutItem {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
}

interface CheckoutFormProps {
  items: CheckoutItem[];
  subtotal: number;
}

type Mode = "online" | "quote";

export function CheckoutForm({ items, subtotal }: CheckoutFormProps) {
  const [mode, setMode] = useState<Mode>("online");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Shipping is waived for B2B quotes (the rep will set final shipping in the quote)
  const shippingCost = mode === "quote" ? 0 : subtotal >= 500 ? 0 : 39;
  const total = subtotal + shippingCost;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      firstName: String(fd.get("firstName") || ""),
      lastName: String(fd.get("lastName") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      street: String(fd.get("street") || ""),
      city: String(fd.get("city") || ""),
      zipCode: String(fd.get("zipCode") || "") || undefined,
      notes: String(fd.get("notes") || "") || undefined,
      company: mode === "quote" ? String(fd.get("company") || "") : undefined,
      taxId: mode === "quote" ? String(fd.get("taxId") || "") || undefined : undefined,
      mode,
      marketingConsent: fd.get("marketingConsent") === "on",
    };

    startTransition(async () => {
      const r = await submitCheckout(input);
      if ("ok" in r && r.ok) {
        setResult(r);
        // Open WhatsApp pre-filled chat in a new tab for quote mode
        if (r.mode === "quote" && r.whatsappLink) {
          window.open(r.whatsappLink, "_blank", "noopener,noreferrer");
        }
      } else if ("ok" in r && r.ok === false) {
        setError(r.error);
      }
    });
  }

  // ── Success state ──────────────────────────────────────────────────
  if (result && result.ok) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border border-mocha/40 bg-cream-deep p-10 lg:p-14 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-mocha flex items-center justify-center">
            <svg
              className="w-8 h-8 text-mocha"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="eyebrow text-mocha mb-4">הזמנה התקבלה</div>
          <h2 className="font-display text-3xl lg:text-4xl text-ink mb-3">
            {result.mode === "quote" ? "הבקשה התקבלה" : "תודה!"}
          </h2>
          <p className="text-sm text-mocha mb-1">
            מספר הזמנה
          </p>
          <p className="font-mono text-lg text-ink mb-6">{result.orderNumber}</p>
          <p className="text-base text-ink-soft font-light leading-loose mb-10">
            {result.mode === "quote" ? (
              <>
                ירין יחזור אליכם תוך 24 שעות עם הצעת מחיר מותאמת.
                <br />
                <span className="text-sm opacity-80">פתחנו לכם וואטסאפ ישיר עם פרטי הבקשה — אם זה דחוף, שלחו את ההודעה.</span>
              </>
            ) : (
              <>
                נציג שלנו יתקשר לאימות פרטים ותיאום משלוח, ולאחר מכן תקבלו קישור לתשלום מאובטח ב-Morning.
                <br />
                <span className="text-sm opacity-80">
                  סך כולל: <span className="font-medium">₪{result.total.toLocaleString()}</span>
                </span>
              </>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {result.whatsappLink && (
              <a
                href={result.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-emerald-600 text-white text-sm tracking-wide hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                שליחה ידנית ב-וואטסאפ
              </a>
            )}
            <a
              href="https://wa.me/972526804945"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-8 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors"
            >
              דברו איתנו
            </a>
            <a
              href="tel:0526804945"
              className="inline-flex items-center justify-center h-12 px-8 border border-ink text-ink text-sm tracking-wide hover:bg-ink hover:text-cream transition-colors"
              dir="ltr"
            >
              052-680-4945
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Mode segmented control */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-mocha tracking-[0.25em] uppercase mb-3">
              סוג הזמנה
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 bg-cream-deep rounded">
              <button
                type="button"
                onClick={() => setMode("online")}
                className={`flex items-center justify-center gap-2 h-12 text-sm transition-all ${
                  mode === "online"
                    ? "bg-ink text-cream shadow-sm"
                    : "text-ink hover:bg-bone"
                }`}
              >
                <User className="w-4 h-4" />
                <span>פרטי · תשלום אונליין</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("quote")}
                className={`flex items-center justify-center gap-2 h-12 text-sm transition-all ${
                  mode === "quote"
                    ? "bg-ink text-cream shadow-sm"
                    : "text-ink hover:bg-bone"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>עסקי · הצעת מחיר</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              {mode === "online"
                ? "מתאים ללקוחות פרטיים. תשלום באשראי, ביט, גוגל-פיי או אפל-פיי דרך מורנינג."
                : "מתאים לאדריכלים, מעצבים, קבלנים. ירין יחזור אליך תוך 24 שעות עם הצעת מחיר ותנאי תשלום."}
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי קשר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">שם פרטי *</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">שם משפחה *</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">אימייל *</Label>
                <Input id="email" name="email" type="email" required dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="050-1234567"
                />
              </div>
            </div>

            {mode === "quote" && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-bone">
                <div className="space-y-2">
                  <Label htmlFor="company">שם העסק *</Label>
                  <Input id="company" name="company" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">ע.מ / ח.פ</Label>
                  <Input id="taxId" name="taxId" dir="ltr" placeholder="000000000" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "quote" ? "כתובת לתיאום" : "כתובת למשלוח"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">רחוב ומספר *</Label>
              <Input id="street" name="street" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">עיר *</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">מיקוד</Label>
                <Input id="zipCode" name="zipCode" dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">
                {mode === "quote" ? "פרטי הפרויקט / דרישות מיוחדות" : "הערות למשלוח"}
              </Label>
              <Textarea
                id="notes"
                name="notes"
                rows={mode === "quote" ? 4 : 2}
                placeholder={
                  mode === "quote"
                    ? "ספרו לנו על הפרויקט — סוג, גודל, לוח זמנים, מותגים מועדפים..."
                    : "קומה, דירה, קוד כניסה..."
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment / Quote callout */}
        {mode === "online" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                תשלום
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-bone bg-cream-deep p-8 text-center">
                <Lock className="w-8 h-8 mx-auto mb-3 text-mocha" />
                <p className="font-display text-lg text-ink mb-2">
                  סליקה מאובטחת דרך Morning
                </p>
                <p className="text-sm text-ink-soft font-light leading-relaxed">
                  בשלב הזה נשלים את ההזמנה ישירות איתכם — נתקשר לאישור פרטים
                  ולתיאום משלוח. לאחר מכן תקבלו קישור לתשלום מאובטח ב-Morning.
                  <br />
                  <span className="text-xs opacity-70 mt-2 inline-block">
                    אנחנו לא שומרים פרטי כרטיס אשראי.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                הצעת מחיר מותאמת
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-emerald-200 bg-emerald-50 p-8 text-center">
                <p className="text-sm text-emerald-900 font-light leading-relaxed">
                  לא תיגבה תשלום עכשיו. הבקשה תועבר לירין, והוא יחזור אליכם
                  תוך 24 שעות עם הצעת מחיר, הנחות B2B, תנאי תשלום ולוח זמנים.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                required
                className="mt-1 w-4 h-4 accent-black"
              />
              <span className="text-xs font-light text-gray-700">
                קראתי ואישרתי את{" "}
                <a href="/terms" target="_blank" className="text-blue-600 underline">
                  תנאי השימוש
                </a>
                , את{" "}
                <a href="/privacy" target="_blank" className="text-blue-600 underline">
                  מדיניות הפרטיות
                </a>{" "}
                ואת מדיניות הביטולים. (חובה)
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="marketingConsent"
                className="mt-1 w-4 h-4 accent-black"
              />
              <span className="text-xs font-light text-gray-700">
                אני מסכים/ה לקבל עדכונים ומבצעים מ-Modaco בדוא&quot;ל (ניתן להסיר בכל עת).
              </span>
            </label>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
            ✗ {error}
          </div>
        )}

        <Button size="lg" type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              שולח...
            </>
          ) : mode === "quote" ? (
            <>
              <MessageCircle className="w-4 h-4 ml-2" />
              שליחת בקשה להצעת מחיר
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 ml-2" />
              שליחת הזמנה — ₪{total.toLocaleString()}
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 leading-relaxed">
          {mode === "online" ? (
            <>
              לחיצה על &quot;שליחת הזמנה&quot; מהווה התקשרות מחייבת. ביטול עד 14 ימים מיום קבלת המוצר
              לפי חוק הגנת הצרכן — פרטים מלאים ב
              <a href="/terms" className="text-blue-600 underline" target="_blank">תנאי השימוש</a>.
            </>
          ) : (
            <>
              שליחת בקשה אינה מהווה התקשרות מחייבת. תנאי המחיר והאספקה ייקבעו בהצעה שתשלח אליך.
            </>
          )}
        </p>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>סיכום הזמנה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.name}</div>
                  <div className="text-gray-400">
                    {item.variant} x{item.quantity}
                  </div>
                </div>
                <span className="font-medium whitespace-nowrap mr-2">
                  ₪{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span>סכום ביניים</span>
              <span>₪{subtotal.toLocaleString()}</span>
            </div>
            {mode === "online" ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>משלוח</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">חינם!</span>
                    ) : (
                      `₪${shippingCost}`
                    )}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-gray-400">
                    משלוח חינם בהזמנה מעל ₪500
                  </p>
                )}
              </>
            ) : (
              <div className="flex justify-between text-sm text-mocha">
                <span>משלוח</span>
                <span>בהצעת המחיר</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>{mode === "quote" ? "סה״כ פריטים" : "סה״כ לתשלום"}</span>
              <span>₪{total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
