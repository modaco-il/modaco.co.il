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
  const [step, setStep] = useState<"details" | "payment">("details");
  const shippingCost = subtotal >= 500 ? 0 : 39;
  const total = subtotal + shippingCost;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">סליקה מאובטחת</p>
              <p className="text-sm mt-1">
                פרטי האשראי ייקלטו במערכת Morning המאובטחת.
                <br />
                אנחנו לא שומרים פרטי כרטיס אשראי.
              </p>
              {/* TODO: Morning payment iframe/redirect will be here */}
            </div>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full">
          <Lock className="w-4 h-4 ml-2" />
          בצע הזמנה — ₪{total.toLocaleString()}
        </Button>
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
    </div>
  );
}
