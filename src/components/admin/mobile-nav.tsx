"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Inbox,
  Sparkles,
  Menu,
} from "lucide-react";

/**
 * Mobile bottom nav — 5 spots, the daily-touch shortcuts.
 *
 * "Menu" opens the secondary nav (products, customers, settings, ...)
 * via a dialog — anything that's not in the bottom-bar lives there.
 */
const items = [
  { href: "/admin/dashboard", label: "דשבורד", icon: LayoutDashboard },
  { href: "/admin/orders", label: "הזמנות", icon: ShoppingCart },
  { href: "/admin/messages", label: "הודעות", icon: Inbox },
  { href: "/admin/agent", label: "סוכן", icon: Sparkles },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-xs ${
                isActive ? "text-blue-700" : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
        <details className="relative">
          <summary className="flex flex-col items-center gap-0.5 text-xs text-gray-500 cursor-pointer list-none">
            <Menu className="w-5 h-5" />
            עוד
          </summary>
          <div className="absolute bottom-16 left-0 right-0 mx-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
            <Link href="/admin/products" className="block px-4 py-2 text-sm hover:bg-gray-50">מוצרים</Link>
            <Link href="/admin/customers" className="block px-4 py-2 text-sm hover:bg-gray-50">לקוחות</Link>
            <Link href="/admin/carts" className="block px-4 py-2 text-sm hover:bg-gray-50">עגלות נטושות</Link>
            <Link href="/admin/categories" className="block px-4 py-2 text-sm hover:bg-gray-50">קטגוריות</Link>
            <Link href="/admin/suppliers" className="block px-4 py-2 text-sm hover:bg-gray-50">ספקים</Link>
            <Link href="/admin/reports" className="block px-4 py-2 text-sm hover:bg-gray-50">דוחות</Link>
            <Link href="/admin/audit" className="block px-4 py-2 text-sm hover:bg-gray-50">היסטוריה</Link>
            <hr className="my-1" />
            <Link href="/admin/settings" className="block px-4 py-2 text-sm hover:bg-gray-50">הגדרות</Link>
          </div>
        </details>
      </div>
    </nav>
  );
}
