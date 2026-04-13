import Link from "next/link";

const categories = [
  { slug: "hinges", name: "צירים", brand: "Blum", description: "פרזול גרמני בדיוק שווייצרי" },
  { slug: "slides", name: "מסילות", brand: "Movento", description: "תנועה שקטה, סגירה רכה" },
  { slug: "lift-systems", name: "מנגנוני הרמה", brand: "Aventos", description: "הקלפה נפתחת בנגיעה" },
  { slug: "accessories", name: "אקססוריז", brand: "Domicile", description: "פרטים שמרגישים נכון" },
  { slug: "aluminum", name: "אלומיניום וזכוכית", brand: "Profile 19", description: "מסגרות בהתאמה אישית" },
  { slug: "carpentry", name: "נגרות", brand: "Modaco Premium", description: "מטבחי יוקרה מהתחלה ועד הסוף" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero — full-bleed editorial */}
      <section className="relative h-[88vh] min-h-[640px] overflow-hidden">
        <img
          src="/images/israelevitz/1-web.jpg"
          alt="מטבח Modaco"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />

        <div className="relative z-10 h-full flex flex-col justify-end pb-24 lg:pb-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-2xl">
              <div className="eyebrow text-mocha-soft mb-6">למעלה מ-40 שנה</div>
              <h1 className="font-display text-cream text-5xl lg:text-7xl leading-[1.05] mb-8">
                פרזול ואקססוריז<br />
                <span className="italic text-mocha-soft">ברמה אחרת</span>
              </h1>
              <p className="text-cream/80 text-lg lg:text-xl font-light leading-relaxed max-w-xl mb-10">
                המותגים המובילים בעולם, נבחרים בקפידה — לבית, למטבח ולכל חלל שמגיע לו את הטוב ביותר.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/categories/hinges"
                  className="px-9 py-4 bg-cream text-ink text-sm tracking-wide hover:bg-mocha-soft transition-colors"
                >
                  לקטלוג המוצרים
                </Link>
                <a
                  href="https://wa.me/972526804945"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-9 py-4 border border-cream/40 text-cream text-sm tracking-wide hover:border-cream hover:bg-cream/5 transition-all"
                >
                  שיחה עם יועץ
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-cream-deep border-y border-bone">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4 text-center">
            <Stat value="40+" label="שנות מומחיות" />
            <Stat value="Blum" label="אולם תצוגה רשמי" serif />
            <Stat value="200+" label="מוצרים בקטלוג" />
            <Stat value="15%" label="הנחת אנשי מקצוע" />
          </div>
        </div>
      </section>

      {/* Categories — editorial grid */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        <div className="text-center mb-20">
          <div className="eyebrow mb-5">הקולקציה</div>
          <h2 className="font-display text-4xl lg:text-5xl text-ink max-w-2xl mx-auto">
            כל פרט נבחר בקפידה — כי פרטים בונים מקום
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-bone">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group bg-cream p-10 lg:p-12 hover:bg-cream-deep transition-colors"
            >
              <div className="text-xs eyebrow mb-4">{cat.brand}</div>
              <h3 className="font-display text-2xl lg:text-3xl text-ink mb-3 group-hover:text-mocha transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-ink-soft/70 font-light leading-relaxed mb-8">
                {cat.description}
              </p>
              <div className="text-xs tracking-[0.25em] uppercase text-mocha group-hover:text-mocha-hover transition-colors">
                לצפייה &larr;
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial split — Aluminum Profile 19 */}
      <section className="bg-cream-deep">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-5 lg:pr-8">
              <div className="eyebrow mb-5">פרופיל 19 &middot; אלומיניום וזכוכית</div>
              <h2 className="font-display text-4xl lg:text-5xl text-ink mb-8 leading-[1.1]">
                חיתוך מדויק.<br />
                <span className="italic text-mocha">למידות שלכם.</span>
              </h2>
              <p className="text-ink-soft/80 font-light text-lg leading-loose mb-10">
                פרופילי אלומיניום וזכוכית בחיתוך מדויק, מותאמים בדיוק למידות
                ולדרישות. לארונות, לויטרינות, למחיצות — ישירות מהמפעל אליכם,
                ללא תיווך וללא פשרות.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/categories/aluminum"
                  className="px-9 py-4 bg-ink text-cream text-sm tracking-wide hover:bg-mocha transition-colors"
                >
                  למידע נוסף
                </Link>
                <a
                  href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C%2019"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-9 py-4 border border-ink text-ink text-sm tracking-wide hover:bg-ink hover:text-cream transition-all"
                >
                  הצעת מחיר
                </a>
              </div>
            </div>
            <div className="lg:col-span-7 relative aspect-[4/3] overflow-hidden">
              <img
                src="/images/israelevitz/2-web.jpg"
                alt="פרופיל 19 — אלומיניום וזכוכית"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 text-7xl lg:text-9xl font-display text-cream/90 leading-none">19</div>
            </div>
          </div>
        </div>
      </section>

      {/* Carpentry — full-bleed dark hero */}
      <section className="relative min-h-[680px] overflow-hidden flex items-center">
        <img
          src="/images/israelevitz/4-web.jpg"
          alt="מטבח יוקרה Modaco"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-24 w-full">
          <div className="max-w-xl">
            <div className="eyebrow text-mocha-soft mb-6">Modaco Premium &middot; נגרות</div>
            <h2 className="font-display text-4xl lg:text-6xl text-cream mb-8 leading-[1.05]">
              מטבחי יוקרה.<br />
              <span className="italic text-mocha-soft">בהתאמה מוחלטת.</span>
            </h2>
            <p className="text-cream/80 font-light text-lg leading-loose mb-4">
              למעלה מ-40 שנות מומחיות בתכנון וייצור מטבחי יוקרה.
              שילוב של נגרות איכותית עם פרזול מתקדם מהמותגים המובילים בעולם.
            </p>
            <p className="text-cream/50 font-light text-sm mb-10 leading-relaxed">
              כל מטבח מתוכנן ומיוצר בהתאמה אישית מוחלטת,
              עם ליווי מקצועי מהשלב הראשון ועד ההתקנה.
            </p>
            <div className="flex gap-4 flex-wrap">
              <a
                href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%9E%D7%98%D7%91%D7%97%20%D7%91%D7%94%D7%AA%D7%90%D7%9E%D7%94"
                target="_blank"
                rel="noopener noreferrer"
                className="px-9 py-4 bg-cream text-ink text-sm tracking-wide hover:bg-mocha-soft transition-colors"
              >
                לתיאום פגישת ייעוץ
              </a>
              <Link
                href="/categories/carpentry"
                className="px-9 py-4 border border-cream/40 text-cream text-sm tracking-wide hover:border-cream hover:bg-cream/5 transition-all"
              >
                מידע נוסף
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About excerpt */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="relative aspect-[5/4] overflow-hidden">
              <img
                src="/images/israelevitz/3-web.jpg"
                alt="פרויקט מודקו"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2 lg:pr-8">
            <div className="eyebrow mb-5">אודות Modaco</div>
            <h2 className="font-display text-4xl lg:text-5xl text-ink mb-8 leading-[1.1]">
              ההבדל בין חלל טוב<br />
              לחלל יוצא דופן<br />
              <span className="italic text-mocha">טמון בפרטים.</span>
            </h2>
            <p className="text-ink-soft/80 font-light text-base leading-loose mb-6">
              אנחנו בוחרים בקפידה כל פריט — מתוך ראייה רחבה של עמידות לאורך זמן,
              נוחות שימוש יומיומית, עיצוב מתקדם והתאמה מושלמת לסטנדרטים הגבוהים
              ביותר של המטבח והבית המודרני.
            </p>
            <p className="text-ink-soft/80 font-light text-base leading-loose mb-10">
              גישת השירות שלנו אישית, מקצועית ושקופה — לא רק עסקה,
              אלא ליווי לאורך כל הדרך.
            </p>
            <Link
              href="/about"
              className="text-sm tracking-[0.2em] uppercase text-mocha border-b border-mocha pb-1 hover:text-mocha-hover hover:border-mocha-hover transition-colors"
            >
              קראו עוד
            </Link>
          </div>
        </div>
      </section>

      {/* B2B */}
      <section className="bg-ink text-cream">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40 text-center">
          <div className="eyebrow text-mocha-soft mb-6">B2B</div>
          <h2 className="font-display text-4xl lg:text-5xl text-cream mb-6 leading-tight">
            אדריכלים, מעצבים<br />
            <span className="italic text-mocha-soft">וקבלנים</span>
          </h2>
          <p className="text-cream/70 font-light text-lg leading-loose max-w-xl mx-auto mb-12">
            מחירון מיוחד, 15% הנחה על כל הקטלוג, וגישה לפלטפורמת B2B מלאה.
          </p>
          <a
            href="https://wa.me/972526804945"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-cream text-ink text-sm tracking-wide hover:bg-mocha-soft transition-colors"
          >
            לפרטים נוספים
          </a>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label, serif = false }: { value: string; label: string; serif?: boolean }) {
  return (
    <div>
      <div className={`text-3xl lg:text-4xl text-ink mb-2 ${serif ? "font-display" : "font-light"}`}>
        {value}
      </div>
      <div className="text-xs tracking-[0.2em] uppercase text-ink-soft/60">{label}</div>
    </div>
  );
}
