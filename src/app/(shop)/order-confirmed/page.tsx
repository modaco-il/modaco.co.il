import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "ההזמנה התקבלה — Modaco",
};

export default function OrderConfirmedPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />

      <h1 className="text-3xl font-bold mb-3">ההזמנה התקבלה!</h1>

      <p className="text-gray-600 mb-8">
        תודה על הרכישה. אישור הזמנה נשלח אליך במייל ובוואטסאפ.
      </p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-right space-y-3">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          <div>
            <div className="font-medium">מה הלאה?</div>
            <div className="text-sm text-gray-500">
              נתחיל לטפל בהזמנה שלך ונעדכן אותך כשהמשלוח יצא לדרך.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-blue-600" />
          <div>
            <div className="font-medium">שאלות?</div>
            <div className="text-sm text-gray-500">
              צרו קשר בטלפון 052-680-4945 או דרך עמוד יצירת הקשר.
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link href="/">
          <Button>חזרה לחנות</Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline">צרו קשר</Button>
        </Link>
      </div>
    </div>
  );
}
