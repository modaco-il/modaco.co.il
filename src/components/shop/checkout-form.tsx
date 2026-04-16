"use client";

import { useState } from "react";
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
import { CreditCard, Lock } from "lucide-react";

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

export function CheckoutForm({ items, subtotal }: CheckoutFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const shippingCost = subtotal >= 500 ? 0 : 39;
  const total = subtotal + shippingCost;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border border-mocha/40 bg-cream-deep p-10 lg:p-14 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-mocha flex items-center justify-center">
            <svg className="w-8 h-8 text-mocha" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="eyebrow text-mocha mb-4">הזמנה התקבלה</div>
          <h2 className="font-display text-3xl lg:text-4xl text-ink mb-5">
            תודה, נחזור אליכם בהקדם
          </h2>
          <p className="text-base text-ink-soft font-light leading-loose mb-10">
            ההזמנה נרשמה. נציג שלנו יתקשר לאימות פרטים ותיאום משלוח,
            ולאחר מכן תקבלו קישור לתשלום מאובטח ב-Morning.
            <br />
            <span className="text-sm opacity-80">
              סך כולל: <span className="font-medium">₪{total.toLocaleString()}</span>
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/972526804945"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-8 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors"
            >
              שליחת וואטסאפ
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2 space-y-6">
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
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader>
            <CardTitle>כתובת למשלוח</CardTitle>
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
              <Label htmlFor="notes">הערות למשלוח</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="קומה, דירה, קוד כניסה..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
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

        <Button size="lg" type="submit" className="w-full">
          <Lock className="w-4 h-4 ml-2" />
          שליחת הזמנה — ₪{total.toLocaleString()}
        </Button>

        <p className="text-xs text-gray-500 leading-relaxed">
          לחיצה על &quot;שליחת הזמנה&quot; מהווה התקשרות מחייבת. ביטול עד 14 ימים מיום קבלת המוצר
          לפי חוק הגנת הצרכן — פרטים מלאים ב
          <a href="/terms" className="text-blue-600 underline" target="_blank">תנאי השימוש</a>.
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
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>סה&quot;כ לתשלום</span>
              <span>₪{total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
