export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PAID: "שולמה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  DELIVERED: "הגיעה",
  CANCELLED: "בוטלה",
  REFUNDED: "הוחזרה",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-orange-100 text-orange-800",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const customer = await db.customer.findFirst({
    where: { userId: session.user.id },
    include: {
      user: true,
      group: true,
      orders: {
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      addresses: true,
    },
  });

  if (!customer) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">החשבון שלי</h1>
        <form action={async () => { "use server"; await logout(); redirect("/"); }}>
          <Button variant="ghost" size="sm" type="submit">
            התנתק
          </Button>
        </form>
      </div>

      {/* Profile */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">
                {customer.user.name || "ללא שם"}
              </div>
              <div className="text-sm text-gray-500">
                {customer.user.email} · {customer.user.phone}
              </div>
              {customer.company && (
                <div className="text-sm text-gray-400 mt-1">
                  {customer.company}
                </div>
              )}
            </div>
            {customer.group && (
              <Badge className="bg-blue-100 text-blue-700">
                {customer.group.displayName}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <h2 className="text-xl font-bold mb-4">
        ההזמנות שלי ({customer.orders.length})
      </h2>

      {customer.orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-400">
            <p>עדיין לא ביצעת הזמנות</p>
            <Link href="/">
              <Button className="mt-4">לקטלוג</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {customer.orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {order.orderNumber}
                  </CardTitle>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("he-IL")}
                  {order.trackingNumber && (
                    <span className="mr-2">
                      · מעקב: {order.trackingNumber}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.variant.product.name} x{item.quantity}
                      </span>
                      <span>₪{item.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>סה&quot;כ</span>
                  <span>₪{order.total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
