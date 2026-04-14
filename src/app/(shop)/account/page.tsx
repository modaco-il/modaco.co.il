export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
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
  PENDING: "#B8860B",
  PAID: "#2F7A43",
  PROCESSING: "#2A5C8A",
  SHIPPED: "#6B4A8F",
  DELIVERED: "#2E2520",
  CANCELLED: "#A02323",
  REFUNDED: "#B86923",
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
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
      <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-4">החשבון שלי</div>
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-ink leading-[1.05]">
            {customer.user.name || "ברוכים הבאים"}
          </h1>
          <div className="text-sm text-ink-soft font-light mt-3" dir="ltr">
            {customer.user.email}
            {customer.user.phone && ` · ${customer.user.phone}`}
          </div>
          {customer.company && (
            <div className="text-sm text-ink-soft font-light mt-1">
              {customer.company}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {customer.group && (
            <span
              className="px-3 py-1 text-[10px] tracking-[0.3em] uppercase border border-mocha text-mocha"
              style={{ letterSpacing: "0.3em" }}
            >
              {customer.group.displayName}
            </span>
          )}
          <form action={async () => { "use server"; await logout(); redirect("/"); }}>
            <button type="submit" className="text-sm text-ink-soft hover:text-mocha transition-colors">
              התנתקות
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-bone mb-12" />

      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-display font-bold text-2xl lg:text-3xl text-ink">
          ההזמנות שלי
        </h2>
        <span className="text-sm text-ink-soft font-light">
          {customer.orders.length} הזמנות
        </span>
      </div>

      {customer.orders.length === 0 ? (
        <div className="border border-bone bg-cream-deep p-12 text-center">
          <p className="text-ink-soft font-light mb-6">עדיין לא ביצעתם הזמנות</p>
          <Link
            href="/catalog"
            className="inline-block px-7 py-3 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors"
          >
            לקטלוג המוצרים
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {customer.orders.map((order) => (
            <div key={order.id} className="border border-bone p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <div className="font-display font-bold text-lg text-ink">
                    {order.orderNumber}
                  </div>
                  <div className="text-xs text-ink-soft mt-1">
                    {new Date(order.createdAt).toLocaleDateString("he-IL")}
                    {order.trackingNumber && ` · מעקב: ${order.trackingNumber}`}
                  </div>
                </div>
                <span
                  className="px-3 py-1 text-[10px] tracking-[0.25em] uppercase"
                  style={{
                    backgroundColor: statusColors[order.status] + "18",
                    color: statusColors[order.status],
                  }}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
              <div className="space-y-2 text-sm font-light">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-ink-soft">
                    <span>
                      {item.variant.product.name} × {item.quantity}
                    </span>
                    <span>₪{item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-bone mt-4 pt-4 flex justify-between font-bold text-ink">
                <span>סה״כ</span>
                <span>₪{order.total.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
