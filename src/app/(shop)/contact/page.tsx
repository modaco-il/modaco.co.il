import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "צרו קשר — Modaco",
  description: "צרו איתנו קשר. טלפון, מייל או השאירו פנייה ונחזור אליכם.",
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">צרו קשר</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>השאירו פנייה</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">שם מלא *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">טלפון *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input id="email" name="email" type="email" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">נושא</Label>
                <Input id="subject" name="subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">הודעה *</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="במה נוכל לעזור?"
                />
              </div>
              <Button type="submit" className="w-full">
                שלח פנייה
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 mt-1 text-blue-600" />
                  <div>
                    <div className="font-bold">טלפון</div>
                    <a
                      href="tel:0526804945"
                      className="text-blue-600 text-lg"
                      dir="ltr"
                    >
                      052-680-4945
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 mt-1 text-blue-600" />
                  <div>
                    <div className="font-bold">אימייל</div>
                    <a
                      href="mailto:info@modaco.co.il"
                      className="text-blue-600"
                      dir="ltr"
                    >
                      info@modaco.co.il
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 mt-1 text-blue-600" />
                  <div>
                    <div className="font-bold">שעות פעילות</div>
                    <div className="text-gray-600">
                      א׳–ה׳: 08:00–18:00
                      <br />
                      ו׳: 08:00–13:00
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 mt-1 text-blue-600" />
                  <div>
                    <div className="font-bold">כתובת</div>
                    <div className="text-gray-600">
                      {/* TODO: להוסיף כתובת מירין */}
                      ישראל
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">אדריכלים ואנשי מקצוע?</h3>
              <p className="text-gray-300 text-sm">
                צרו קשר לקבלת מחירון מיוחד והרשמה לחשבון B2B עם תנאים
                מותאמים.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
