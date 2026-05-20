import type { Metadata } from "next";
import { AgentChat } from "@/components/admin/agent-chat";

export const metadata: Metadata = {
  title: "סוכן AI · מודקו ניהול",
};

export default function AgentPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-baseline justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">סוכן AI</h1>
          <p className="text-sm text-gray-600 mt-1">
            שאל אותי להוסיף מוצרים, לעדכן מחירים, לסמן אזל מהמלאי, להוסיף קטגוריות וכו&apos;.
          </p>
        </div>
      </header>

      {/* Examples */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <div className="font-semibold text-blue-900 mb-2">דוגמאות למה לבקש:</div>
        <ul className="space-y-1 text-blue-800 list-disc list-inside">
          <li>
            <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded">
              תעלה את המוצר הזה: https://www.domicile.co.il/product/...
            </span>
          </li>
          <li>
            <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded">
              תעלה את כל קטגוריית הידיות מ-Domicile
            </span>
          </li>
          <li>
            <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded">
              עדכן את המחיר של FT501 ל-189 ש&quot;ח
            </span>
          </li>
          <li>
            <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded">
              סמן את MO600 כאזל מהמלאי
            </span>
          </li>
          <li>
            <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded">
              צור קטגוריה חדשה &quot;מוצרי גינון&quot;
            </span>
          </li>
        </ul>
      </section>

      <AgentChat />
    </div>
  );
}
