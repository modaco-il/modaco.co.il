import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מטבחי יוקרה בהתאמה אישית — נגרות | Modaco",
  description:
    "מטבחי יוקרה בהתאמה אישית מוחלטת. למעלה מ-40 שנה של מומחיות בתכנון, ייצור והתקנת מטבחים ברמה הגבוהה ביותר.",
};

export default function CarpentryPage() {
  return (
    <div>
      {/* Hero with kitchen image */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/israelevitz/1-web.jpg"
            alt="מטבח Modaco Premium"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-36 text-center">
          <div className="text-sm text-mocha tracking-[0.3em] uppercase mb-6 font-medium">
            Modaco Premium
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-white">
            מטבחי יוקרה
            <br />
            <span className="text-mocha">בהתאמה אישית</span>
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            כל מטבח הוא עולם בפני עצמו. אנחנו מתכננים, מייצרים ומתקינים מטבחי יוקרה שמשלבים נגרות ברמה הגבוהה ביותר עם פרזול מתקדם מהמותגים המובילים בעולם.
          </p>
        </div>
      </section>

      {/* The story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-3">
              הסיפור שלנו
            </div>
            <h2 className="text-3xl font-bold mb-6">
              40+ שנה של מומחיות<br />בנגרות ומטבחים
            </h2>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
              Modaco נולדה מתוך אהבה לנגרות. לפני שהפכנו למומחי פרזול ואקססוריז, בנינו מטבחים. ולמעשה, אנחנו עדיין בונים — למי שמחפש את הטוב ביותר.
            </p>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
              הניסיון שצברנו בשני העולמות — נגרות ופרזול — נותן לנו יתרון שאין לאף אחד אחר. אנחנו מבינים את החומרים מבפנים, יודעים איך כל ציר, מסילה ומנגנון עובד, ומתכננים מטבח שלא רק נראה מושלם — אלא גם מתפקד מושלם לאורך שנים.
            </p>
            <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
              כל מטבח של Modaco הוא פרויקט בהתאמה אישית מוחלטת. אין תבניות, אין פשרות — רק דיוק מושלם לצרכים, לחלל ולסגנון של הלקוח.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
              <div className="text-3xl font-bold mb-2">40+</div>
              <div className="text-xs text-gray-500">שנות ניסיון</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
              <div className="text-3xl font-bold mb-2">Blum</div>
              <div className="text-xs text-gray-500">פרזול מתקדם</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-xs text-gray-500">התאמה אישית</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-sm p-8 text-center transition-colors">
              <div className="text-3xl font-bold mb-2">A-Z</div>
              <div className="text-xs text-gray-500">תכנון עד התקנה</div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-3 text-center">
            התהליך
          </div>
          <h2 className="text-3xl font-bold mb-12 text-center">איך זה עובד?</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "פגישת ייעוץ", desc: "נפגשים, מבינים את הצרכים, מודדים את החלל ומתחילים לחלום יחד" },
              { step: "02", title: "תכנון ועיצוב", desc: "תכנון מלא עם הדמיות תלת-ממד, בחירת חומרים, צבעים ופרזול" },
              { step: "03", title: "ייצור", desc: "ייצור בסדנה שלנו עם חומרי גלם מהשורה הראשונה ודיוק ללא פשרות" },
              { step: "04", title: "התקנה", desc: "התקנה מקצועית בבית הלקוח, כולל חיבור כל הפרזול והאביזרים" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-bold text-gray-200 dark:text-gray-800 mb-3 transition-colors">{item.step}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What sets us apart */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-sm text-gray-500 tracking-[0.2em] uppercase mb-3 text-center">
            מה מבדיל אותנו
          </div>
          <h2 className="text-3xl font-bold mb-12 text-center">למה Modaco?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { title: "נגרות + פרזול = שלמות", desc: "אנחנו גם נגרים וגם מומחי פרזול. השילוב הזה מאפשר לנו לבנות מטבח שכל חלק בו — מהמגירה הקטנה ביותר ועד הקלפה הגדולה — עובד בצורה מושלמת." },
              { title: "חומרים ללא פשרות", desc: "עובדים רק עם חומרי הגלם הטובים ביותר. פרזול Blum, ציפויים איכותיים, אביזרים מהמותגים המובילים." },
              { title: "ליווי אישי מ-A עד Z", desc: "לא מעבירים אתכם בין מחלקות. אותו צוות שמתכנן — גם מייצר ומתקין. שירות אישי לכל אורך הדרך." },
              { title: "אחריות ושקיפות", desc: "אחריות מלאה על כל מטבח. תמחור שקוף ללא הפתעות. ולאחר ההתקנה — אנחנו תמיד כאן." },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-gray-200 dark:border-gray-800 rounded-sm p-8 transition-colors"
              >
                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery placeholder */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="text-sm text-mocha tracking-[0.3em] uppercase mb-3 font-medium">
            גלריה
          </div>
          <h2 className="text-3xl font-bold mb-4">מהמטבחים שלנו</h2>
          <p className="text-sm text-gray-500 mb-10">
            באדיבות Israelevitz Architects
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 4, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-sm overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors"
              >
                <img
                  src={`/images/israelevitz/${i}-web.jpg`}
                  alt={`מטבח Modaco ${i}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="bg-gray-950 dark:bg-gray-900 rounded-sm p-10 lg:p-16 text-center text-white transition-colors">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              מוכנים למטבח החלומות?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              הצעד הראשון הוא שיחה. ספרו לנו על החלל, על הסגנון שאתם אוהבים ועל הצרכים — ואנחנו נעשה את השאר.
            </p>
            <a
              href="https://wa.me/972526804945?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%20%D7%91%D7%9E%D7%98%D7%91%D7%97%20%D7%91%D7%94%D7%AA%D7%90%D7%9E%D7%94%20%D7%90%D7%99%D7%A9%D7%99%D7%AA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-white text-black font-medium rounded-sm hover:bg-gray-200 transition-colors"
            >
              לתיאום פגישת ייעוץ
            </a>
            <p className="text-gray-500 text-sm mt-4">
              הפגישה ללא עלות וללא התחייבות
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
