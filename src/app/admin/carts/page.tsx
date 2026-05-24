export const dynamic = "force-dynamic";

/**
 * /admin/carts — abandoned carts work queue.
 *
 * A cart is "abandoned" when:
 *   - It has items
 *   - convertedAt is null (no order created from it)
 *   - abandonedAt is set (the cron in lib/inngest sets this after ~30min idle)
 *
 * Yarin can reach out via WhatsApp to recover the sale; we capture the
 * touch via `recoverySentAt` (clicking the WhatsApp button hits an API
 * that stamps the timestamp).
 *
 * Tabs: active recovery candidates (last 7d, not contacted), already
 * reached out, and all-time historic. Live (unabandoned) carts are
 * filtered out — they're not actionable.
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ filter?: string }>;
}

function toWaPhone(p: string | null | undefined): string | null {
  if (!p) return null;
  const clean = p.replace(/[^\d]/g, "");
  if (!clean) return null;
  return clean.startsWith("0") ? "972" + clean.slice(1) : clean;
}

export default async function CartsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const { filter = "fresh" } = await searchParams;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const where: any = {
    convertedAt: null,
    abandonedAt: { not: null },
    items: { some: {} },
  };
  if (filter === "fresh") {
    where.abandonedAt = { not: null, gte: sevenDaysAgo };
    where.recoverySentAt = null;
  } else if (filter === "contacted") {
    where.recoverySentAt = { not: null };
  }

  const carts = await db.cart.findMany({
    where,
    include: {
      customer: { include: { user: true, addresses: { take: 1 } } },
      items: {
        include: {
          variant: {
            include: {
              product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
            },
          },
        },
      },
    },
    orderBy: { abandonedAt: "desc" },
    take: 50,
  });

  const tabs = [
    { value: "fresh", label: "להתקשרות" },
    { value: "contacted", label: "כבר פנינו" },
    { value: "all", label: "הכל" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">עגלות נטושות</h1>
        <div className="text-sm text-gray-500">
          {carts.length} עגלות{filter === "fresh" && " ב-7 ימים אחרונים"}
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`/admin/carts?filter=${t.value}`}
            className={`px-4 py-2 text-sm border-b-2 transition-colors whitespace-nowrap ${
              filter === t.value
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {carts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {filter === "fresh"
              ? "אין עגלות חדשות להתקשרות"
              : "אין עגלות בקטגוריה הזו"}
          </div>
        ) : (
          carts.map((cart) => {
            const total = cart.items.reduce((sum, it) => {
              const price = it.variant.priceOverride ?? it.variant.product.basePrice;
              return sum + price * it.quantity;
            }, 0);
            const name =
              cart.customer?.user?.name ||
              cart.customer?.user?.email ||
              "אורח";
            const phone =
              cart.customer?.addresses[0]?.phone ||
              cart.customer?.user?.phone ||
              null;
            const waPhone = toWaPhone(phone);

            const productSummary = cart.items
              .map(
                (it) =>
                  `${it.variant.product.name}${it.variant.name !== "default" ? ` (${it.variant.name})` : ""} ×${it.quantity}`,
              )
              .join("\n");
            const recoverText = encodeURIComponent(
              `שלום ${name.split(" ")[0]},\n\nראיתי שהשארת עגלה במודקו עם הפריטים:\n${productSummary}\n\nסכום: ₪${total.toLocaleString()}\n\nאם נשמח לעזור להשלים את ההזמנה — אני כאן.\n\nירין | Modaco`,
            );

            const hoursAgo = Math.floor(
              (Date.now() - new Date(cart.abandonedAt!).getTime()) / 3_600_000,
            );
            const ageLabel =
              hoursAgo < 1
                ? "פחות משעה"
                : hoursAgo < 24
                  ? `לפני ${hoursAgo} שעות`
                  : `לפני ${Math.floor(hoursAgo / 24)} ימים`;

            return (
              <div
                key={cart.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{name}</span>
                      {phone && (
                        <span className="text-xs text-gray-500">{phone}</span>
                      )}
                      {cart.recoverySentAt && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600">
                          נשלחה פנייה
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {ageLabel} · {cart.items.length} פריטים
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold">₪{total.toLocaleString()}</div>
                  </div>
                </div>

                {/* Item thumbnails */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {cart.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex-shrink-0 w-14 text-center"
                      title={`${it.variant.product.name} ×${it.quantity}`}
                    >
                      <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded overflow-hidden">
                        {it.variant.product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={it.variant.product.images[0].url}
                            alt={it.variant.product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : null}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        ×{it.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  {waPhone ? (
                    <a
                      href={`https://wa.me/${waPhone}?text=${recoverText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        // Best-effort fire-and-forget — record the touch.
                        fetch(`/api/admin/carts/${cart.id}/recovery-sent`, {
                          method: "POST",
                        }).catch(() => {});
                      }}
                      className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-2"
                    >
                      WhatsApp לשחזור
                    </a>
                  ) : (
                    <div className="h-10 px-4 bg-gray-100 text-gray-400 text-sm rounded-lg flex items-center">
                      אין טלפון
                    </div>
                  )}
                  {cart.customer?.id && (
                    <Link
                      href={`/admin/customers/${cart.customer.id}`}
                      className="h-10 px-4 border border-gray-200 hover:bg-gray-50 text-sm rounded-lg flex items-center"
                    >
                      היסטוריית לקוח
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
