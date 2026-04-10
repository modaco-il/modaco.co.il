import Link from "next/link";

const categories = [
  {
    slug: "hinges",
    name: "צירים",
    brand: "Blum",
    description: "צירים מתקדמים לכל סוגי הארונות והמטבחים",
  },
  {
    slug: "slides",
    name: "מסילות מובנטו",
    brand: "Blum",
    description: "מסילות שקטות וחלקות עם טכנולוגיית בלומושן",
  },
  {
    slug: "faucets",
    name: "ברזי מטבח",
    brand: "Blanco & Delta",
    description: "ברזים מעוצבים בסטנדרט הגבוה ביותר",
  },
  {
    slug: "handles",
    name: "ידיות",
    brand: "Domicile",
    description: "ידיות מעוצבות למטבחים ולריהוט",
  },
  {
    slug: "accessories",
    name: "אקססוריז לבית",
    brand: "Floralis",
    description: "אגרטלים, מראות, כלי בישול ומעמדים",
  },
  {
    slug: "lift-systems",
    name: "מנגנוני הרמה",
    brand: "Blum",
    description: "פתרונות הרמה חכמים לקלפות ולמיקרו",
  },
  {
    slug: "aluminum",
    name: "אלומיניום וזכוכית",
    brand: "Modaco",
    description: "פרופילים, מסגרות ופתרונות אלומיניום וזכוכית",
  },
  {
    slug: "carpentry",
    name: "נגרות",
    brand: "Modaco Premium",
    description: "מטבחי יוקרה ונגרות בהתאמה אישית מוחלטת",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-36 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-sm text-gray-500 dark:text-gray-500 tracking-[0.2em] uppercase mb-6">
              למעלה מ-40 שנה של מומחיות
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6">
              פרזול ואקססוריז
              <br />
              <span className="text-gray-400 dark:text-gray-500">ברמה אחרת</span>
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-400 leading-relaxed max-w-xl mx-auto mb-10">
              המותגים המובילים בעולם. איכות ללא פשרות. ישירות מהיבואן אליכם — לבית, למטבח, לכל חלל.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/categories/hinges"
                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                לקטלוג המלא
              </Link>
              <a
                href="https://wa.me/972526804945"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-sm hover:border-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                צרו קשר
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">40+</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">שנות ניסיון</div>
            </div>
            <div>
              <div className="text-2xl font-bold">Blum</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">יבואן רשמי</div>
            </div>
            <div>
              <div className="text-2xl font-bold">B2B</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">מחירים לאנשי מקצוע</div>
            </div>
            <div>
              <div className="text-2xl font-bold">1,000+</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">מוצרים בקטלוג</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-sm text-gray-500 dark:text-gray-500 tracking-[0.2em] uppercase mb-3">
          הקטגוריות שלנו
        </div>
        <h2 className="text-3xl font-bold mb-12">מה אנחנו מציעים</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group border border-gray-200 dark:border-gray-800 rounded-sm p-8 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
            >
              <div className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">
                {cat.brand}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-500">{cat.description}</p>
              <div className="mt-6 text-sm text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                לצפייה בקטגוריה &larr;
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Profile 19 — Aluminum banner */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="relative border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 lg:p-14 flex flex-col justify-center">
                <div className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">
                  פרופיל 19 &bull; אלומיניום וזכוכית
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  הזמנה בהתאמה אישית
                </h2>
                <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-6">
                  פרופילי אלומיניום וזכוכית בחיתוך מדויק, מותאמים בדיוק למידות ולדרישות שלכם. פרופיל 19 לארונות, ויטרינות, מחיצות ועוד — ישירות מהמפעל אליכם.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C%2019%20%D7%91%D7%94%D7%AA%D7%90%D7%9E%D7%94%20%D7%90%D7%99%D7%A9%D7%99%D7%AA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm"
                  >
                    הזמינו עכשיו
                  </a>
                  <Link
                    href="/categories/aluminum"
                    className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-sm hover:border-gray-500 hover:text-black dark:hover:text-white transition-colors text-sm"
                  >
                    לקטגוריית אלומיניום
                  </Link>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 p-10 lg:p-14 flex items-center justify-center transition-colors">
                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-2">19</div>
                  <div className="text-sm text-gray-500">Profile</div>
                  <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-500">
                    <div>חיתוך מדויק למידה</div>
                    <div>אלומיניום + זכוכית</div>
                    <div>ארונות &bull; ויטרינות &bull; מחיצות</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carpentry — Premium kitchens */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-gray-950 dark:bg-gray-900 rounded-sm p-10 lg:p-16 text-center text-white transition-colors">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-4">
              Modaco Premium
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              מטבחי יוקרה בהתאמה אישית
            </h2>
            <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto mb-4">
              למעלה מ-40 שנה של מומחיות בתכנון וייצור מטבחי יוקרה.
              שילוב של נגרות איכותית עם פרזול מתקדם מהמותגים המובילים בעולם — לתוצאה מושלמת עד הפרט האחרון.
            </p>
            <p className="text-gray-500 text-sm max-w-xl mx-auto mb-8">
              כל מטבח מתוכנן ומיוצר בהתאמה אישית מוחלטת, עם ליווי מקצועי מהשלב הראשון ועד ההתקנה.
            </p>
            <a
              href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%9E%D7%98%D7%91%D7%97%20%D7%91%D7%94%D7%AA%D7%90%D7%9E%D7%94%20%D7%90%D7%99%D7%A9%D7%99%D7%AA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-white text-black font-medium rounded-sm hover:bg-gray-200 transition-colors"
            >
              לתיאום פגישת ייעוץ
            </a>
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-500 tracking-[0.2em] uppercase mb-3">
                אודות Modaco
              </div>
              <h2 className="text-3xl font-bold mb-6">
                ההבדל בין חלל טוב לחלל
                <br />
                יוצא דופן טמון בפרטים
              </h2>
              <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
                אנו בוחרים בקפידה כל פריט — מתוך ראייה רחבה של עמידות לאורך זמן, נוחות שימוש יומיומית, עיצוב מתקדם והתאמה מושלמת לסטנדרטים הגבוהים ביותר של המטבח והבית המודרני.
              </p>
              <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-8">
                אנו מלווים את לקוחותינו, מעצבים ואנשי מקצוע מתוך גישה של שירות אישי, מקצועיות ושקיפות מלאה.
              </p>
              <Link
                href="/about"
                className="text-sm border-b border-gray-400 dark:border-gray-600 pb-1 hover:border-black dark:hover:border-white transition-colors"
              >
                קראו עוד אודותינו
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
                <div className="text-3xl font-bold mb-2">40+</div>
                <div className="text-xs text-gray-500">שנות ניסיון</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
                <div className="text-3xl font-bold mb-2">B2B</div>
                <div className="text-xs text-gray-500">תנאים לאנשי מקצוע</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
                <div className="text-3xl font-bold mb-2">Blum</div>
                <div className="text-xs text-gray-500">שותף רשמי</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
                <div className="text-3xl font-bold mb-2">IL</div>
                <div className="text-xs text-gray-500">משלוח לכל הארץ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">אדריכלים, מעצבים וקבלנים?</h2>
          <p className="text-gray-700 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            צרו קשר לקבלת מחירון מיוחד, תנאי תשלום מותאמים וגישה למערכת B2B.
          </p>
          <a
            href="https://wa.me/972526804945"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            לפרטים נוספים
          </a>
        </div>
      </section>
    </div>
  );
}
