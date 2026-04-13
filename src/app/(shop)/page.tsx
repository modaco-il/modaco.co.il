import Link from "next/link";

function CatalogIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

const categories = [
  { slug: "hinges", name: "צירים", brand: "Blum", description: "פרזול גרמני בדיוק שווייצרי", cover: "/images/israelevitz/3-web.jpg" },
  { slug: "slides", name: "מסילות", brand: "Movento", description: "תנועה שקטה, סגירה רכה", cover: "/images/israelevitz/2-web.jpg" },
  { slug: "lift-systems", name: "מנגנוני הרמה", brand: "Aventos", description: "הקלפה נפתחת בנגיעה", cover: "/images/israelevitz/1-web.jpg" },
  { slug: "accessories", name: "אקססוריז", brand: "Domicile", description: "פרטים שמרגישים נכון", cover: "/images/israelevitz/3-web.jpg" },
  { slug: "aluminum", name: "אלומיניום וזכוכית", brand: "Profile 19", description: "מסגרות בהתאמה אישית", cover: "/images/israelevitz/2-web.jpg" },
  { slug: "carpentry", name: "נגרות", brand: "Modaco Premium", description: "מטבחי יוקרה מהתחלה ועד הסוף", cover: "/images/israelevitz/4-web.jpg" },
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
        <div className="absolute inset-0 hero-base-mobile" />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 h-full flex flex-col justify-end lg:justify-center pb-24 lg:pb-0">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-2xl lg:max-w-4xl lg:mx-auto hero-text lg:text-center">
              <div className="eyebrow text-mocha-soft mb-6">למעלה מ-40 שנה</div>
              <h1 className="font-display text-cream text-5xl lg:text-7xl leading-[1.05] mb-8">
                פרזול ואקססוריז<br />
                <span className="text-mocha-soft font-display-light">ברמה אחרת</span>
              </h1>
              <p className="text-cream text-lg lg:text-xl font-light leading-relaxed max-w-xl lg:mx-auto mb-12">
                המותגים המובילים בעולם, נבחרים בקפידה — לבית, למטבח ולכל חלל שמגיע לו את הטוב ביותר.
              </p>
              <div className="flex gap-3 flex-wrap lg:justify-center">
                <Link
                  href="/catalog"
                  className="group inline-flex items-center gap-3 pl-5 pr-6 py-4 text-sm tracking-wide transition-all hover:shadow-lg"
                  style={{ background: "#FAF6F0", color: "#0A0908" }}
                >
                  <CatalogIcon />
                  <span>לקטלוג המלא</span>
                  <span
                    className="transition-transform duration-300 group-hover:-translate-x-1"
                    aria-hidden
                  >←</span>
                </Link>
                <a
                  href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%20%D7%99%D7%A8%D7%99%D7%9F%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%93%D7%A8%D7%9A%20%D7%94%D7%90%D7%AA%D7%A8%20%D7%A9%D7%9C%20Modaco%20%D7%95%D7%99%D7%A9%20%D7%9C%D7%99%20%D7%A9%D7%90%D7%9C%D7%94"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 pl-5 pr-6 py-4 text-sm tracking-wide transition-all"
                  style={{
                    border: "1px solid rgba(250,246,240,0.4)",
                    color: "#FAF6F0",
                    background: "rgba(10,9,8,0.25)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <WhatsAppIcon />
                  <span>שיחה עם יועץ</span>
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "#25D366" }}
                    aria-hidden
                  />
                </a>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 pl-5 pr-6 py-4 text-sm tracking-wide transition-all"
                  style={{
                    border: "1px solid rgba(250,246,240,0.4)",
                    color: "#FAF6F0",
                    background: "rgba(10,9,8,0.25)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <UserPlusIcon />
                  <span>הרשמה</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust ribbon — marquee */}
      <TrustRibbon />

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
              className="group relative bg-cream overflow-hidden min-h-[280px] lg:min-h-[340px] flex flex-col justify-between"
            >
              {/* Hover image background */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.cover}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/50 to-ink/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Content */}
              <div className="relative p-10 lg:p-12">
                <div className="text-xs eyebrow mb-4 group-hover:text-mocha-soft transition-colors">{cat.brand}</div>
                <h3 className="font-display text-2xl lg:text-3xl text-ink group-hover:text-cream mb-3 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-ink-soft font-light leading-relaxed group-hover:text-cream transition-colors">
                  {cat.description}
                </p>
              </div>
              <div className="relative p-10 lg:p-12 pt-0">
                <div className="text-xs tracking-[0.25em] uppercase text-mocha group-hover:text-mocha-soft transition-all flex items-center gap-2">
                  <span>לצפייה</span>
                  <span className="inline-block w-0 group-hover:w-6 h-px bg-mocha group-hover:bg-mocha-soft transition-all duration-500" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">&larr;</span>
                </div>
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
                <span className="text-mocha font-display-light">למידות שלכם.</span>
              </h2>
              <p className="text-ink-soft font-light text-lg leading-loose mb-10">
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
              <div className="absolute bottom-6 left-6 text-7xl lg:text-9xl font-display text-cream leading-none">19</div>
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
        <div className="absolute inset-0 hero-base-mobile" />
        <div className="absolute inset-0 hero-overlay-side" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-24 w-full">
          <div className="max-w-xl hero-text">
            <div className="eyebrow text-mocha-soft mb-6">Modaco Premium &middot; נגרות</div>
            <h2 className="font-display text-4xl lg:text-6xl text-cream mb-8 leading-[1.05]">
              מטבחי יוקרה.<br />
              <span className="text-mocha-soft font-display-light">בהתאמה מוחלטת.</span>
            </h2>
            <p className="text-cream font-light text-lg leading-loose mb-4">
              למעלה מ-40 שנות מומחיות בתכנון וייצור מטבחי יוקרה.
              שילוב של נגרות איכותית עם פרזול מתקדם מהמותגים המובילים בעולם.
            </p>
            <p className="text-cream font-light text-sm mb-10 leading-relaxed">
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
              <span className="text-mocha font-display-light">טמון בפרטים.</span>
            </h2>
            <p className="text-ink-soft font-light text-base leading-loose mb-6">
              אנחנו בוחרים בקפידה כל פריט — מתוך ראייה רחבה של עמידות לאורך זמן,
              נוחות שימוש יומיומית, עיצוב מתקדם והתאמה מושלמת לסטנדרטים הגבוהים
              ביותר של המטבח והבית המודרני.
            </p>
            <p className="text-ink-soft font-light text-base leading-loose mb-10">
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
            <span className="text-mocha-soft font-display-light">וקבלנים</span>
          </h2>
          <p className="text-cream font-light text-lg leading-loose max-w-xl mx-auto mb-12">
            תנאים מיוחדים לאנשי מקצוע, מחירון ייעודי וגישה לפלטפורמת B2B מלאה.
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

const trustItems: Array<{ brand?: string; text?: string; number?: string; label?: string }> = [
  { brand: "BLUM", label: "שותפים רשמיים" },
  { number: "40+", label: "שנות מומחיות" },
  { brand: "DOMICILE", label: "מפיצים מורשים" },
  { number: "200+", label: "מוצרים בקטלוג" },
  { brand: "MOVENTO", label: "טכנולוגיה אוסטרית" },
  { text: "SINCE 1985", label: "מטבחי יוקרה" },
  { brand: "AVENTOS", label: "מנגנוני הרמה" },
  { text: "B2B", label: "רשת אנשי מקצוע" },
];

function TrustItem({ item }: { item: (typeof trustItems)[number] }) {
  const primary = item.brand || item.text || item.number || "";
  const isNumber = !!item.number;
  return (
    <span className="inline-flex items-baseline gap-3 mx-8 shrink-0">
      <span
        className={`text-2xl lg:text-3xl tracking-tight ${isNumber ? "font-display font-light" : "font-bold tracking-wider"}`}
        style={{ color: "#FAF6F0" }}
      >
        {primary}
      </span>
      <span
        className="text-[11px] tracking-[0.28em] uppercase font-medium"
        style={{ color: "#D9C3A5" }}
      >
        {item.label}
      </span>
    </span>
  );
}

function TrustRibbon() {
  const doubled = [...trustItems, ...trustItems];
  return (
    <section
      className="relative overflow-hidden marquee-pause"
      style={{ background: "#0A0908" }}
      aria-label="מותגים ונתונים"
    >
      <div className="marquee-track flex py-7 lg:py-10 whitespace-nowrap" dir="ltr">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-baseline">
            <TrustItem item={item} />
            <span
              className="text-xl opacity-30 select-none"
              style={{ color: "#D9C3A5" }}
              aria-hidden
            >
              ◆
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
