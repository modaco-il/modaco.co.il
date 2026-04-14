import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "הקטלוג המלא — Modaco",
  description:
    "כל הקטגוריות במקום אחד. צירים, מסילות, מנגנוני הרמה, אקססוריז, אלומיניום ונגרות — מהמותגים המובילים בעולם.",
};

interface CatalogEntry {
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  cover: string;
  index: string;
}

const entries: CatalogEntry[] = [
  {
    slug: "handles",
    name: "ידיות",
    brand: "Domicile",
    tagline: "הפרט שמשלים את הקו",
    description:
      "מבחר רחב של ידיות לארונות, מטבחים ודלתות. עיצובים מינימליסטיים, קלאסיים ויוקרתיים — בכל הגימורים. ליבת החנות שלנו.",
    cover: "/images/domicile/mood.jpg",
    index: "01",
  },
  {
    slug: "hinges",
    name: "צירים",
    brand: "Blum & Domicile",
    tagline: "הדיוק האוסטרי של פרזול עולמי",
    description:
      "צירים בסטנדרט הגבוה ביותר. סגירה רכה, תנועה שקטה, אחריות יצרן עד 25 שנה. מהציר הקליפי הקטן ועד מנגנונים של 180°.",
    cover: "/images/blum/blum-hinges.jpg",
    index: "02",
  },
  {
    slug: "slides",
    name: "מסילות",
    brand: "Movento · Tandem",
    tagline: "תנועה שאי אפשר להרגיש",
    description:
      "מסילות נסתרות, נשלפות וטיפ-און. בלומושן ומסילות מובנטו לעומסים של 40 ו-70 קילו. כל מידה, כל גודל, התאמה אישית מוחלטת.",
    cover: "/images/blum/blum-slides.jpg",
    index: "03",
  },
  {
    slug: "lift-systems",
    name: "מנגנוני הרמה",
    brand: "Aventos · Exparo",
    tagline: "הקלפה נפתחת בנגיעה",
    description:
      "מנגנונים סטטיים ודינמיים לחזיתות עליונות. פתיחה רכה, סגירה אילמת, התאמה לדלתות זכוכית, עץ או אלומיניום בגדלים ומשקלים שונים.",
    cover: "/images/blum/blum-lift.jpg",
    index: "04",
  },
  {
    slug: "bath",
    name: "מוצרי אמבט",
    brand: "Domicile",
    tagline: "פרטים שמרגישים נכון בידיים",
    description:
      "סדרות מלאות לחדרי רחצה — רודיום, SHELL, RIVIERA, BINOVA, RONDO, EDGE, LUCY, SANDRA, PICCOLO. גם פחים, מראות, מחממי מגבות ומחזיקי יין.",
    cover: "/images/domicile/lucy.jpg",
    index: "05",
  },
  {
    slug: "accessories",
    name: "אקססוריז",
    brand: "Floralis",
    tagline: "אגרטלים, מראות ופריטי בית",
    description:
      "אקססוריז מעוצבים לבית — אגרטלים, מראות, מעמדים ופריטים משלימים מהמותג Floralis. בקרוב במלאי.",
    cover: "/images/modaco/5F7A9697.webp",
    index: "06",
  },
  {
    slug: "aluminum",
    name: "אלומיניום וזכוכית",
    brand: "Profile 19",
    tagline: "חיתוך מדויק. למידות שלכם.",
    description:
      "פרופילי אלומיניום בעובי 19 מ\"מ עם משטחי זכוכית. לחזיתות ארונות, ויטרינות, מחיצות חלל ודלתות הזזה. כל פרופיל נחתך בהתאמה אישית.",
    cover: "/images/israelevitz/2-web.jpg",
    index: "07",
  },
  {
    slug: "carpentry",
    name: "מטבחי יוקרה",
    brand: "Modaco Premium",
    tagline: "הסיפור הראשון, בנגרות מאז 1985",
    description:
      "מטבחי יוקרה בהתאמה אישית מוחלטת. תכנון, ייצור והתקנה ב-A→Z. שילוב של נגרות איכותית עם כל הפרזול שאנו מציעים — בליווי אישי.",
    cover: "/images/israelevitz/4-web.jpg",
    index: "08",
  },
];

async function getCounts(): Promise<Record<string, number>> {
  const counts = await db.product.groupBy({
    by: ["categoryId"],
    where: { status: "ACTIVE" },
    _count: { _all: true },
  });
  const cats = await db.category.findMany({
    select: { id: true, slug: true },
  });
  const idToSlug = Object.fromEntries(cats.map((c) => [c.id, c.slug]));
  const out: Record<string, number> = {};
  for (const c of counts) {
    if (c.categoryId && idToSlug[c.categoryId]) {
      out[idToSlug[c.categoryId]] = c._count._all;
    }
  }
  return out;
}

export default async function CatalogPage() {
  const counts = await getCounts();

  return (
    <article>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
        <div className="absolute inset-0 bg-ink" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url(/images/modaco/5F7A9683.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,9,8,0.5) 0%, rgba(10,9,8,0.7) 60%, rgba(10,9,8,0.95) 100%)",
          }}
        />

        <div className="relative h-full flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-3xl hero-text">
              <div
                className="text-[11px] tracking-[0.32em] uppercase font-medium mb-6"
                style={{ color: "#D9C3A5" }}
              >
                הקולקציה · 2026
              </div>
              <h1
                className="font-display font-bold text-5xl lg:text-7xl leading-[1.05] mb-6"
                style={{ color: "#FAF6F0" }}
              >
                הקטלוג<br />
                <span style={{ color: "#D9C3A5", fontWeight: 400 }}>המלא</span>
              </h1>
              <p
                className="text-lg lg:text-xl font-light leading-relaxed max-w-xl"
                style={{ color: "#FAF6F0", opacity: 0.92 }}
              >
                שש קטגוריות, מאות פריטים, מהמותגים המובילים בעולם —
                כולם נבחרים בקפידה ומוצגים כאן במקום אחד.
              </p>
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-8 right-1/2 translate-x-1/2 text-cream opacity-60 text-xs tracking-[0.3em] uppercase animate-bounce">
          ↓
        </div>
      </section>

      {/* Index strip — desktop only */}
      <section className="hidden lg:block bg-cream border-b border-bone">
        <div className="max-w-[1400px] mx-auto px-12 py-8">
          <div className="flex items-center justify-center gap-8 text-xs tracking-[0.2em] uppercase">
            {entries.map((e) => (
              <a
                key={e.slug}
                href={`#${e.slug}`}
                className="text-ink-soft hover:text-mocha transition-colors"
              >
                <span className="text-mocha mr-1">{e.index}</span>
                {e.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial spreads — alternating */}
      {entries.map((entry, i) => {
        const reversed = i % 2 === 1;
        const count = counts[entry.slug] || 0;
        const isDark = i % 3 === 1; // every 3rd block dark for rhythm

        return (
          <section
            key={entry.slug}
            id={entry.slug}
            className={isDark ? "bg-ink text-cream" : i % 3 === 2 ? "bg-cream-deep" : "bg-cream"}
          >
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Image */}
                <div
                  className={`relative aspect-[4/5] lg:aspect-[5/6] overflow-hidden lg:col-span-6 ${
                    reversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entry.cover}
                    alt={entry.name}
                    className="absolute inset-0 w-full h-full object-cover hover:scale-[1.02] transition-transform duration-1000 ease-out"
                  />
                  {/* Index overlay */}
                  <div
                    className="absolute top-6 right-6 text-7xl lg:text-9xl font-display font-bold leading-none opacity-90"
                    style={{ color: "#FAF6F0" }}
                  >
                    {entry.index}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`lg:col-span-5 ${reversed ? "lg:order-1 lg:col-start-2" : "lg:order-2"}`}
                  dir="rtl"
                >
                  <div
                    className="text-[11px] tracking-[0.32em] uppercase font-medium mb-5"
                    style={{ color: isDark ? "#D9C3A5" : "#8B6F4E" }}
                  >
                    {entry.brand}
                  </div>
                  <h2
                    className="font-display font-bold text-4xl lg:text-6xl leading-[1.05] mb-6"
                    style={{ color: isDark ? "#FAF6F0" : "#0A0908" }}
                  >
                    {entry.name}
                  </h2>
                  <p
                    className="font-display font-medium text-xl lg:text-2xl mb-8 leading-snug"
                    style={{ color: isDark ? "#D9C3A5" : "#8B6F4E" }}
                  >
                    {entry.tagline}
                  </p>
                  <p
                    className="text-base lg:text-lg font-light leading-loose mb-10"
                    style={{
                      color: isDark ? "#FAF6F0" : "#2E2520",
                      opacity: isDark ? 0.85 : 1,
                    }}
                  >
                    {entry.description}
                  </p>

                  {/* meta */}
                  <div
                    className="flex items-center gap-6 mb-10 text-xs tracking-[0.2em] uppercase"
                    style={{ color: isDark ? "#FAF6F0" : "#2E2520", opacity: 0.65 }}
                  >
                    {count > 0 && (
                      <span>
                        <span className="font-display font-bold text-2xl mr-2" style={{ opacity: 1 }}>
                          {count}
                        </span>
                        מוצרים
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/categories/${entry.slug}`}
                    className="inline-flex items-center gap-3 px-9 py-4 text-sm tracking-wide transition-colors"
                    style={
                      isDark
                        ? { background: "#FAF6F0", color: "#0A0908" }
                        : { background: "#0A0908", color: "#FAF6F0" }
                    }
                  >
                    <span>כניסה לקטגוריה</span>
                    <span aria-hidden>←</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Footer CTA */}
      <section className="bg-ink text-cream">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 text-center">
          <div
            className="text-[11px] tracking-[0.32em] uppercase font-medium mb-6"
            style={{ color: "#D9C3A5" }}
          >
            ייעוץ אישי
          </div>
          <h2
            className="font-display font-bold text-4xl lg:text-5xl mb-6"
            style={{ color: "#FAF6F0" }}
          >
            לא מצאתם את מה שחיפשתם?
          </h2>
          <p
            className="font-light text-lg leading-loose max-w-xl mx-auto mb-12"
            style={{ color: "#FAF6F0", opacity: 0.7 }}
          >
            יש לנו עוד הרבה — בקטלוגים של המותגים, באולם התצוגה ובמחסנים.
            ספרו לנו מה אתם מחפשים.
          </p>
          <a
            href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%97%D7%A4%D7%A9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 text-sm tracking-wide transition-colors"
            style={{ background: "#FAF6F0", color: "#0A0908" }}
          >
            דברו איתנו
          </a>
        </div>
      </section>
    </article>
  );
}
