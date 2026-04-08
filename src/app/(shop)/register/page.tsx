"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">הרשמה</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם מלא</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                dir="ltr"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                dir="ltr"
                placeholder="050-1234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {state && !state.success && (
              <p className="text-red-600 text-sm">{state.error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "נרשם..." : "הרשמה"}
            </Button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-500">
            כבר יש לך חשבון?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              התחברות
            </Link>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            אדריכל או קבלן? לאחר ההרשמה צרו קשר לקבלת מחירון מיוחד.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
