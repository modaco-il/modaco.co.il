"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  Sparkles,
  Inbox,
  ShoppingBag,
  Truck,
  BarChart3,
  ScrollText,
} from "lucide-react";

/**
 * Two-tier nav:
 *   - Primary  — daily workflow (dashboard, agent, orders, products, etc.)
 *   - Secondary — operational (settings, suppliers, audit log)
 *
 * `highlight` styles the AI agent link a touch warmer so it's the obvious
 * entry for "I want to do something new".
 */
const primary = [
  { href: "/admin/dashboard", label: "דשבורד", icon: LayoutDashboard },
  { href: "/admin/agent", label: "סוכן AI", icon: Sparkles, highlight: true },
  { href: "/admin/orders", label: "הזמנות", icon: ShoppingCart },
  { href: "/admin/messages", label: "הודעות", icon: Inbox },
  { href: "/admin/carts", label: "עגלות נטושות", icon: ShoppingBag },
  { href: "/admin/products", label: "מוצרים", icon: Package },
  { href: "/admin/customers", label: "לקוחות", icon: Users },
];

const secondary = [
  { href: "/admin/categories", label: "קטגוריות", icon: FolderTree },
  { href: "/admin/suppliers", label: "ספקים", icon: Truck },
  { href: "/admin/reports", label: "דוחות", icon: BarChart3 },
  { href: "/admin/audit", label: "היסטוריית פעולות", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:right-0 bg-white border-l border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link href="/admin/dashboard" className="text-xl font-bold">
          Modaco
        </Link>
        <span className="mr-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          ניהול
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {primary.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : item.highlight
                    ? "text-purple-700 hover:bg-purple-50"
                    : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-gray-100">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 px-3 mb-2">
            תפעול
          </div>
          {secondary.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings — pinned bottom */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            pathname.startsWith("/admin/settings")
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Settings className="w-5 h-5" />
          הגדרות
        </Link>
      </div>
    </aside>
  );
}
