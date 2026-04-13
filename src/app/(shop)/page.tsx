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
    description: "פרופיל 19 — אלומיניום וזכוכית בהתאמה אישית",
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
      {/* Hero with Israelevitz kitchen image */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/israelevitz/1-web.jpg"
            alt="מטבח Modaco Premium"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 dark:from-black dark:via-black/80 dark:to-black/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-28 lg:py-44 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-sm text-mocha tracking-[0.3em] uppercase mb-6 font-medium">
              למעלה מ-40 שנה של מומחיות
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] mb-6 text-white">
              פרזול ואקססוריז
              <br />
              <span className="text-mocha">ברמה אחרת</span>
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed max-w-xl mx-auto mb-10">
              המותגים המובילים בעולם. איכות ללא פשרות. ישירות אליכם — לבית, למטבח, לכל חלל.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/categories/hinges"
                className="px-8 py-3 bg-mocha text-white font-medium rounded-sm hover:bg-mocha-hover transition-colors"
              >
                לקטלוג המלא
              </Link>
              <a
                href="https://wa.me/972526804945"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border border-white/40 text-white font-medium rounded-sm hover:bg-white/10 hover:border-white transition-colors backdrop-blur-sm"
              >
                צרו קשר
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-gray-200 dark:border-gray-800 transition-colors bg-mocha-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">40+</div>
              <div className="text-xs text-gray-500 mt-1">שנות ניסיון</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-mocha">Blum</div>
              <div className="text-xs text-gray-500 mt-1">אולם תצוגה B2C רחב</div>
            </div>
            <div>
              <div className="text-2xl font-bold">B2B</div>
              <div className="text-xs text-gray-500 mt-1">15% הנחה לאנשי מקצוע</div>
            </div>
            <div>
              <div className="text-2xl font-bold">200+</div>
              <div className="text-xs text-gray-500 mt-1">מוצרים בקטלוג</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-sm text-mocha tracking-[0.3em] uppercase mb-3 font-medium">
          הקטגוריות שלנו
        </div>
        <h2 className="text-3xl font-bold mb-12">מה אנחנו מציעים</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group border border-gray-200 dark:border-gray-800 rounded-sm p-8 hover:border-mocha dark:hover:border-mocha transition-all"
            >
              <div className="text-xs text-mocha uppercase tracking-wider mb-3 font-medium">
                {cat.brand}
              </div>
              <h3 className="text-xl font-bold mb-2 transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-400">{cat.description}</p>
              <div className="mt-6 text-sm text-mocha group-hover:text-mocha-hover transition-colors">
                לצפייה בקטגוריה &larr;
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Profile 19 — Aluminum banner */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="relative border border-mocha-soft/40 rounded-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 lg:p-14 flex flex-col justify-center">
                <div className="text-xs text-mocha uppercase tracking-wider mb-3 font-medium">
                  פרופיל 19 &bull; אלומיניום וזכוכית
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  הזמנה בהתאמה אישית
                </h2>
                <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-6">
                  פרופילי אלומיניום וזכוכית בחיתוך מדויק, מותאמים בדיוק למידות ולדרישות שלכם. פרופיל 19 לארונות, ויטרינות, מחיצות ועוד — ישירות מהמפעל אליכם.
                </p>
                <div className="flex gap-4 flex-wrap">
                  <a
                    href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C%2019%20%D7%91%D7%94%D7%AA%D7%90%D7%9E%D7%94%20%D7%90%D7%99%D7%A9%D7%99%D7%AA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-mocha text-white font-medium rounded-sm hover:bg-mocha-hover transition-colors text-sm"
                  >
                    הזמינו עכשיו
                  </a>
                  <Link
                    href="/categories/aluminum"
                    className="px-6 py-3 border border-mocha text-mocha font-medium rounded-sm hover:bg-mocha hover:text-white transition-colors text-sm"
                  >
                    לקטגוריית אלומיניום
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[300px] lg:min-h-[380px]">
                <img
                  src="/images/israelevitz/2-web.jpg"
                  alt="פרופיל 19 — אלומיניום וזכוכית"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent lg:from-transparent lg:to-white/0" />
                <div className="absolute bottom-6 right-6 text-6xl font-bold text-white/90 drop-shadow-lg">19</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carpentry — Premium kitchens with image background */}
      <section className="relative border-t border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/israelevitz/4-web.jpg"
            alt="מטבח יוקרה Modaco"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="text-xs text-mocha uppercase tracking-wider mb-4 font-medium">
              Modaco Premium &bull; נגרות
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-5 text-white leading-tight">
              מטבחי יוקרה
              <br />
              <span className="text-mocha">בהתאמה אישית</span>
            </h2>
            <p className="text-gray-200 leading-relaxed mb-4 text-lg">
              למעלה מ-40 שנה של מומחיות בתכנון וייצור מטבחי יוקרה. שילוב של נגרות איכותית עם פרזול מתקדם מהמותגים המובילים בעולם.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              כל מטבח מתוכנן ומיוצר בהתאמה אישית מוחלטת, עם ליווי מקצועי מהשלב הראשון ועד ההתקנה.
            </p>
            <div className="flex gap-4 flex-wrap">
              <a
                href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%9E%D7%98%D7%91%D7%97%20%D7%91%D7%94%D7%AA%D7%90%D7%9E%D7%94%20%D7%90%D7%99%D7%A9%D7%99%D7%AA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-mocha text-white font-medium rounded-sm hover:bg-mocha-hover transition-colors"
              >
                לתיאום פגישת ייעוץ
              </a>
              <Link
                href="/categories/carpentry"
                className="inline-block px-8 py-3 border border-white/40 text-white font-medium rounded-sm hover:bg-white/10 hover:border-white transition-colors"
              >
                מידע נוסף
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-sm text-mocha tracking-[0.3em] uppercase mb-3 font-medium">
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
                className="text-sm text-mocha border-b border-mocha pb-1 hover:text-mocha-hover hover:border-mocha-hover transition-colors"
              >
                קראו עוד אודותינו
              </Link>
            </div>
            <div className="relative rounded-sm overflow-hidden aspect-[4/3]">
              <img
                src="/images/israelevitz/3-web.jpg"
                alt="פרויקט מודקו"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors bg-mocha-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="text-xs text-mocha uppercase tracking-[0.3em] mb-3 font-medium">B2B</div>
          <h2 className="text-3xl font-bold mb-4">אדריכלים, מעצבים וקבלנים?</h2>
          <p className="text-gray-700 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            צרו קשר לקבלת מחירון מיוחד, 15% הנחה על כל המוצרים וגישה למערכת B2B.
          </p>
          <a
            href="https://wa.me/972526804945"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-mocha text-white font-medium rounded-sm hover:bg-mocha-hover transition-colors"
          >
            לפרטים נוספים
          </a>
        </div>
      </section>
    </div>
  );
}
