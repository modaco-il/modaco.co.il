import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אלומיניום וזכוכית — פרופיל 19 בהתאמה אישית | Modaco",
  description:
    "פרופילי אלומיניום וזכוכית בחיתוך מדויק למידה. פרופיל 19 לארונות, ויטרינות ומחיצות. הזמנה בהתאמה אישית מ-Modaco.",
};

export default function AluminumPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 text-center">
          <div className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-6">
            אלומיניום וזכוכית
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
            פרופיל 19
            <br />
            <span className="text-gray-400 dark:text-gray-500">בהתאמה אישית</span>
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            חיתוך מדויק למידות שלכם. אלומיניום וזכוכית באיכות הגבוהה ביותר, ישירות מהמפעל — לכל פרויקט, בכל גודל.
          </p>
        </div>
      </section>

      {/* What is Profile 19 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-3">
              מה זה פרופיל 19?
            </div>
            <h2 className="text-3xl font-bold mb-6">
              מערכת פרופילים לארונות, ויטרינות ומחיצות
            </h2>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
              פרופיל 19 הוא מערכת פרופילי אלומיניום בעובי 19 מ&quot;מ, המשלבת מסגרות אלומיניום עם משטחי זכוכית. המערכת מאפשרת יצירת חזיתות ארונות, ויטרינות תצוגה, מחיצות חלל ודלתות הזזה — בקווים נקיים ומודרניים.
            </p>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
              כל פרופיל נחתך ומורכב בדיוק למידות הפרויקט, עם מגוון גימורים: אנודייז טבעי, שחור, שמפניה, ועוד.
            </p>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
              המערכת מתאימה למטבחים, חדרי ארונות, סלונים, משרדים וחללים מסחריים.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
              <div className="text-3xl font-bold mb-2">19mm</div>
              <div className="text-xs text-gray-500">עובי פרופיל</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-xs text-gray-500">התאמה אישית</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
              <div className="text-3xl font-bold mb-2">4+</div>
              <div className="text-xs text-gray-500">גימורים</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
              <div className="text-3xl font-bold mb-2">IL</div>
              <div className="text-xs text-gray-500">משלוח לכל הארץ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-3 text-center">
            שימושים
          </div>
          <h2 className="text-3xl font-bold mb-12 text-center">לאן זה מתאים?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "חזיתות ארונות", desc: "דלתות מטבח וארונות עם מסגרת אלומיניום וזכוכית שקופה או חלבית" },
              { title: "ויטרינות תצוגה", desc: "חלונות ראווה וויטרינות למוצרים, כלי אוכל או אוספים" },
              { title: "מחיצות חלל", desc: "הפרדה אלגנטית בין חללים עם שקיפות ותחושת מרחב" },
              { title: "דלתות הזזה", desc: "דלתות הזזה עם מסילה עליונה או תחתונה, בכל מידה" },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-gray-200 dark:border-gray-800 rounded-sm p-6 transition-colors"
              >
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Modaco */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-3 text-center">
            למה Modaco?
          </div>
          <h2 className="text-3xl font-bold mb-12 text-center">היתרונות שלנו</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold mb-3">חיתוך מדויק</div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                כל פרופיל נחתך במדויק לפי המידות שלכם. ללא פשרות, ללא סטיות.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-3">40+ שנות ניסיון</div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                ניסיון של עשרות שנים בעבודה עם אלומיניום, זכוכית ופרזול מתקדם.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-3">ליווי מקצועי</div>
              <p className="text-sm text-gray-600 dark:text-gray-500">
                ייעוץ טכני, מדידה ותכנון — מהשלב הראשון ועד ההתקנה.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Images placeholder */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-3">
            גלריה
          </div>
          <h2 className="text-3xl font-bold mb-8">מהפרויקטים שלנו</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-sm flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm transition-colors"
              >
                תמונה בקרוב
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">מעוניינים בהצעת מחיר?</h2>
          <p className="text-gray-700 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            שלחו לנו את המידות והדרישות — ונחזור אליכם עם הצעה מותאמת תוך 24 שעות.
          </p>
          <a
            href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C%2019%20%D7%91%D7%94%D7%AA%D7%90%D7%9E%D7%94%20%D7%90%D7%99%D7%A9%D7%99%D7%AA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            דברו איתנו בוואטסאפ
          </a>
        </div>
      </section>
    </div>
  );
}
