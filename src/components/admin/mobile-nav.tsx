"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Inbox,
  Sparkles,
  Menu,
  Package,
  Users,
  ShoppingBag,
  FolderTree,
  Truck,
  BarChart3,
  ScrollText,
  Settings,
} from "lucide-react";

/**
 * Mobile bottom nav — 4 daily-touch shortcuts + "עוד" sheet.
 *
 * The "עוד" entry opens a backdrop-dimmed sheet anchored above the bar
 * with the secondary nav (products, customers, carts, ...). Tap-outside
 * closes. We close it on route changes too — otherwise it stays open
 * after navigating and feels broken.
 */
const items = [
  { href: "/admin/dashboard", label: "דשבורד", icon: LayoutDashboard },
  { href: "/admin/orders", label: "הזמנות", icon: ShoppingCart },
  { href: "/admin/messages", label: "הודעות", icon: Inbox },
  { href: "/admin/agent", label: "סוכן", icon: Sparkles },
];

const moreItems = [
  { href: "/admin/products", label: "מוצרים", icon: Package },
  { href: "/admin/customers", label: "לקוחות", icon: Users },
  { href: "/admin/carts", label: "עגלות נטושות", icon: ShoppingBag },
  { href: "/admin/categories", label: "קטגוריות", icon: FolderTree },
  { href: "/admin/suppliers", label: "ספקים", icon: Truck },
  { href: "/admin/reports", label: "דוחות", icon: BarChart3 },
  { href: "/admin/audit", label: "היסטוריית פעולות", icon: ScrollText },
  { href: "/admin/settings", label: "הגדרות", icon: Settings },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the "עוד" sheet whenever the user navigates.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Backdrop — when sheet is open */}
      {moreOpen && (
        <button
          type="button"
          aria-label="סגור תפריט"
          onClick={() => setMoreOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Sheet — above the bar, full width on phones */}
      {moreOpen && (
        <div className="lg:hidden fixed bottom-16 inset-x-0 z-50 px-3 pb-3">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-gray-500">
                עוד
              </span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="text-sm text-gray-500"
              >
                סגור
              </button>
            </div>
            <nav className="p-2 grid grid-cols-2 gap-1">
              {moreItems.map((m) => {
                const active = pathname.startsWith(m.href);
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <m.icon className="w-5 h-5" />
                    {m.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 text-xs px-2 ${
                  isActive ? "text-blue-700" : "text-gray-500"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center gap-0.5 text-xs px-2 ${
              moreOpen ? "text-blue-700" : "text-gray-500"
            }`}
            aria-expanded={moreOpen}
            aria-label="עוד פעולות"
          >
            <Menu className="w-5 h-5" />
            עוד
          </button>
        </div>
      </nav>
    </>
  );
}
