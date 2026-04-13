import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "מטבחי יוקרה בהתאמה אישית — נגרות | Modaco",
  description:
    "מטבחי יוקרה בהתאמה אישית מוחלטת. למעלה מ-40 שנה של מומחיות בתכנון, ייצור והתקנת מטבחים ברמה הגבוהה ביותר.",
};

export default function CarpentryPage() {
  return (
    <article>
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[640px] overflow-hidden">
        <img
          src="/images/israelevitz/1-web.jpg"
          alt="מטבח Modaco Premium"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-base-mobile" />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 h-full flex items-end pb-24 lg:pb-32">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-2xl hero-text">
              <div className="eyebrow text-mocha-soft mb-6">Modaco Premium</div>
              <h1 className="font-display text-5xl lg:text-7xl text-cream leading-[1.05] mb-8">
                מטבחי יוקרה<br />
                <span className="text-mocha-soft font-display-light">בהתאמה אישית</span>
              </h1>
              <p className="text-cream text-lg lg:text-xl font-light leading-relaxed max-w-xl">
                כל מטבח הוא עולם בפני עצמו. אנחנו מתכננים, מייצרים ומתקינים מטבחי יוקרה
                שמשלבים נגרות ברמה הגבוהה ביותר עם פרזול מתקדם מהמותגים המובילים בעולם.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-5">הסיפור שלנו</div>
            <h2 className="font-display text-4xl lg:text-5xl text-ink mb-8 leading-[1.1]">
              40+ שנה של<br />
              מומחיות<br />
              <span className="text-mocha font-display-light">בנגרות</span>
            </h2>
            <div className="space-y-5 text-ink-soft font-light text-base leading-loose">
              <p>
                Modaco נולדה מתוך אהבה לנגרות. לפני שהפכנו למומחי פרזול ואקססוריז,
                בנינו מטבחים. ולמעשה, אנחנו עדיין בונים — למי שמחפש את הטוב ביותר.
              </p>
              <p>
                הניסיון שצברנו בשני העולמות — נגרות ופרזול — נותן לנו יתרון שאין
                לאף אחד אחר. אנחנו מבינים את החומרים מבפנים, יודעים איך כל ציר,
                מסילה ומנגנון עובד, ומתכננים מטבח שלא רק נראה מושלם — אלא גם
                מתפקד מושלם לאורך שנים.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-px bg-bone">
            {[
              { v: "40+", l: "שנות ניסיון" },
              { v: "Blum", l: "פרזול מתקדם", serif: true },
              { v: "100%", l: "התאמה אישית" },
              { v: "A→Z", l: "תכנון עד התקנה" },
            ].map((s) => (
              <div key={s.l} className="bg-cream p-10 lg:p-14 text-center">
                <div className={`text-4xl lg:text-5xl text-ink mb-3 ${s.serif ? "font-display" : "font-light"}`}>
                  {s.v}
                </div>
                <div className="text-xs tracking-[0.2em] uppercase text-ink-soft">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-cream-deep">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
          <div className="text-center mb-20">
            <div className="eyebrow mb-5">התהליך</div>
            <h2 className="font-display text-4xl lg:text-5xl text-ink">איך זה עובד?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-bone">
            {[
              { step: "01", title: "פגישת ייעוץ", desc: "נפגשים, מבינים את הצרכים, מודדים את החלל ומתחילים לחלום יחד" },
              { step: "02", title: "תכנון ועיצוב", desc: "תכנון מלא עם הדמיות תלת-ממד, בחירת חומרים, צבעים ופרזול" },
              { step: "03", title: "ייצור", desc: "ייצור בסדנה עם חומרי גלם מהשורה הראשונה ודיוק ללא פשרות" },
              { step: "04", title: "התקנה", desc: "התקנה מקצועית בבית הלקוח, כולל חיבור כל הפרזול והאביזרים" },
            ].map((item) => (
              <div key={item.step} className="bg-cream-deep p-10 lg:p-12">
                <div className="font-display text-5xl text-mocha/40 mb-6">{item.step}</div>
                <h3 className="font-display text-xl text-ink mb-3">{item.title}</h3>
                <p className="text-sm text-ink-soft font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
        <div className="text-center mb-20">
          <div className="eyebrow mb-5">מה מבדיל אותנו</div>
          <h2 className="font-display text-4xl lg:text-5xl text-ink">למה Modaco?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-bone max-w-5xl mx-auto">
          {[
            { title: "נגרות + פרזול = שלמות", desc: "אנחנו גם נגרים וגם מומחי פרזול. השילוב הזה מאפשר לנו לבנות מטבח שכל חלק בו — מהמגירה הקטנה ועד הקלפה הגדולה — עובד בצורה מושלמת." },
            { title: "חומרים ללא פשרות", desc: "עובדים רק עם חומרי הגלם הטובים ביותר. פרזול Blum, ציפויים איכותיים, אביזרים מהמותגים המובילים." },
            { title: "ליווי אישי A → Z", desc: "לא מעבירים אתכם בין מחלקות. אותו צוות שמתכנן — גם מייצר ומתקין. שירות אישי לכל אורך הדרך." },
            { title: "אחריות ושקיפות", desc: "אחריות מלאה על כל מטבח. תמחור שקוף ללא הפתעות. ולאחר ההתקנה — אנחנו תמיד כאן." },
          ].map((item) => (
            <div key={item.title} className="bg-cream p-10 lg:p-12">
              <h3 className="font-display text-2xl text-ink mb-4">{item.title}</h3>
              <p className="text-sm text-ink-soft font-light leading-loose">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-cream-deep">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
          <div className="text-center mb-20">
            <div className="eyebrow mb-5">גלריה</div>
            <h2 className="font-display text-4xl lg:text-5xl text-ink mb-3">מהמטבחים שלנו</h2>
            <p className="text-sm text-ink-soft font-light tracking-wide">
              באדיבות Israelevitz Architects
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 4, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden">
                <img
                  src={`/images/israelevitz/${i}-web.jpg`}
                  alt={`מטבח Modaco ${i}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-cream">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 text-center">
          <div className="eyebrow text-mocha-soft mb-6">בואו נתחיל</div>
          <h2 className="font-display text-4xl lg:text-6xl text-cream mb-6 leading-tight">
            מוכנים למטבח<br />
            <span className="text-mocha-soft font-display-light">החלומות?</span>
          </h2>
          <p className="text-cream font-light text-lg leading-loose max-w-xl mx-auto mb-12">
            הצעד הראשון הוא שיחה. ספרו לנו על החלל, על הסגנון שאתם אוהבים ועל הצרכים —
            ואנחנו נעשה את השאר.
          </p>
          <a
            href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%9E%D7%98%D7%91%D7%97%20%D7%91%D7%94%D7%AA%D7%90%D7%9E%D7%94%20%D7%90%D7%99%D7%A9%D7%99%D7%AA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-cream text-ink text-sm tracking-wide hover:bg-mocha-soft transition-colors"
          >
            לתיאום פגישת ייעוץ
          </a>
          <p className="text-cream text-xs mt-5 tracking-wider">
            הפגישה ללא עלות וללא התחייבות
          </p>
        </div>
      </section>
    </article>
  );
}
