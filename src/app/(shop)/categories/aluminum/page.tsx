import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "אלומיניום וזכוכית — פרופיל 19 בהתאמה אישית | Modaco",
  description:
    "פרופילי אלומיניום וזכוכית בחיתוך מדויק למידה. פרופיל 19 לארונות, ויטרינות ומחיצות. הזמנה בהתאמה אישית מ-Modaco.",
};

export default function AluminumPage() {
  return (
    <article>
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[640px] overflow-hidden">
        <img
          src="/images/israelevitz/2-web.jpg"
          alt="פרופיל 19 — אלומיניום וזכוכית"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 h-full flex items-end pb-24 lg:pb-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-2xl hero-text">
              <div className="eyebrow text-mocha-soft mb-6">אלומיניום וזכוכית</div>
              <h1 className="font-display text-5xl lg:text-7xl text-cream leading-[1.05] mb-8">
                פרופיל 19<br />
                <span className="italic text-mocha-soft">בהתאמה אישית</span>
              </h1>
              <p className="text-cream/80 text-lg lg:text-xl font-light leading-relaxed max-w-xl">
                חיתוך מדויק למידות שלכם. אלומיניום וזכוכית באיכות הגבוהה ביותר,
                ישירות מהמפעל — לכל פרויקט, בכל גודל.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Profile 19 */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-5">מה זה פרופיל 19?</div>
            <h2 className="font-display text-4xl lg:text-5xl text-ink mb-8 leading-[1.1]">
              מערכת פרופילים<br />
              לארונות, ויטרינות<br />
              <span className="italic text-mocha">ומחיצות</span>
            </h2>
            <div className="space-y-5 text-ink-soft/80 font-light text-base leading-loose">
              <p>
                פרופיל 19 הוא מערכת פרופילי אלומיניום בעובי 19 מ&quot;מ, המשלבת
                מסגרות אלומיניום עם משטחי זכוכית. המערכת מאפשרת יצירת חזיתות
                ארונות, ויטרינות תצוגה, מחיצות חלל ודלתות הזזה — בקווים נקיים ומודרניים.
              </p>
              <p>
                כל פרופיל נחתך ומורכב בדיוק למידות הפרויקט, עם מגוון גימורים:
                אנודייז טבעי, שחור, שמפניה, ועוד.
              </p>
              <p>
                המערכת מתאימה למטבחים, חדרי ארונות, סלונים, משרדים וחללים מסחריים.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-px bg-bone">
            {[
              { v: "19mm", l: "עובי פרופיל" },
              { v: "100%", l: "התאמה אישית" },
              { v: "4+", l: "גימורים" },
              { v: "IL", l: "משלוח לכל הארץ", serif: true },
            ].map((s) => (
              <div key={s.l} className="bg-cream p-10 lg:p-14 text-center">
                <div className={`text-4xl lg:text-5xl text-ink mb-3 ${s.serif ? "font-display" : "font-light"}`}>
                  {s.v}
                </div>
                <div className="text-xs tracking-[0.2em] uppercase text-ink-soft/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-cream-deep">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
          <div className="text-center mb-20">
            <div className="eyebrow mb-5">שימושים</div>
            <h2 className="font-display text-4xl lg:text-5xl text-ink">לאן זה מתאים?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-bone">
            {[
              { title: "חזיתות ארונות", desc: "דלתות מטבח וארונות עם מסגרת אלומיניום וזכוכית שקופה או חלבית" },
              { title: "ויטרינות תצוגה", desc: "חלונות ראווה וויטרינות למוצרים, כלי אוכל או אוספים" },
              { title: "מחיצות חלל", desc: "הפרדה אלגנטית בין חללים עם שקיפות ותחושת מרחב" },
              { title: "דלתות הזזה", desc: "דלתות הזזה עם מסילה עליונה או תחתונה, בכל מידה" },
            ].map((item) => (
              <div key={item.title} className="bg-cream-deep p-10 lg:p-12">
                <h3 className="font-display text-xl text-ink mb-4">{item.title}</h3>
                <p className="text-sm text-ink-soft/75 font-light leading-loose">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
        <div className="text-center mb-20">
          <div className="eyebrow mb-5">למה Modaco?</div>
          <h2 className="font-display text-4xl lg:text-5xl text-ink">היתרונות שלנו</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {[
            { title: "חיתוך מדויק", desc: "כל פרופיל נחתך במדויק לפי המידות שלכם. ללא פשרות, ללא סטיות." },
            { title: "40+ שנות ניסיון", desc: "ניסיון של עשרות שנים בעבודה עם אלומיניום, זכוכית ופרזול מתקדם." },
            { title: "ליווי מקצועי", desc: "ייעוץ טכני, מדידה ותכנון — מהשלב הראשון ועד ההתקנה." },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <h3 className="font-display text-2xl text-ink mb-4">{item.title}</h3>
              <p className="text-sm text-ink-soft/75 font-light leading-loose">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-cream">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 text-center">
          <div className="eyebrow text-mocha-soft mb-6">הצעת מחיר</div>
          <h2 className="font-display text-4xl lg:text-6xl text-cream mb-6 leading-tight">
            מעוניינים<br />
            <span className="italic text-mocha-soft">בהצעת מחיר?</span>
          </h2>
          <p className="text-cream/70 font-light text-lg leading-loose max-w-xl mx-auto mb-12">
            שלחו לנו את המידות והדרישות — ונחזור אליכם עם הצעה מותאמת תוך 24 שעות.
          </p>
          <a
            href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C%2019%20%D7%91%D7%94%D7%AA%D7%90%D7%9E%D7%94%20%D7%90%D7%99%D7%A9%D7%99%D7%AA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-cream text-ink text-sm tracking-wide hover:bg-mocha-soft transition-colors"
          >
            דברו איתנו בוואטסאפ
          </a>
        </div>
      </section>
    </article>
  );
}
