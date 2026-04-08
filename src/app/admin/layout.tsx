import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";

export const metadata: Metadata = {
  title: "Modaco — פאנל ניהול",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Desktop sidebar */}
      <AdminSidebar />

      {/* Mobile bottom nav */}
      <AdminMobileNav />

      {/* Main content */}
      <main className="lg:pr-64 pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
