import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";

export const metadata: Metadata = {
  title: "Modaco — פאנל ניהול",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login?from=/admin");
  }
  if (role !== "ADMIN") {
    redirect("/");
  }

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
