export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listCategoriesForPicker } from "@/lib/actions/scraper";
import { FromUrlWizard } from "@/components/admin/from-url-wizard";

export const metadata: Metadata = {
  title: "הוסף מוצר מקישור · ניהול מודקו",
};

/**
 * Focused alternative to the agent chat for the most common operation:
 * paste a supplier URL and add the product. The agent chat at /admin/agent
 * remains the catch-all for anything more complex.
 */
export default async function FromUrlPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "ADMIN") {
    redirect("/login");
  }

  const categories = await listCategoriesForPicker();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Link href="/admin/products" className="hover:text-black">
          מוצרים
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span>הוסף מקישור</span>
      </div>

      {/* Hero */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          העלאת מוצר חדש
        </h1>
        <p className="text-gray-600">
          הדבק קישור לעמוד מוצר אצל הספק, ואני בונה את המוצר באתר —
          תמונות, וריאנטים, מחיר, וקטגוריה.
        </p>
      </header>

      <FromUrlWizard initialCategories={categories} />

      {/* Escape hatch */}
      <aside className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 flex items-start gap-3">
        <MessageCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium">צריך משהו מורכב יותר?</div>
          <div className="text-blue-800 mt-0.5">
            כמו "תוסיף את כל הקטגוריה של Floralis" או "עדכן מחיר של FT501" —{" "}
            <Link href="/admin/agent" className="underline font-medium">
              דבר עם הסוכן
            </Link>
            .
          </div>
        </div>
      </aside>
    </div>
  );
}
