import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אודות — Modaco",
  description:
    "למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית. חזון, ערכים וניסיון.",
};

export default function AboutPage() {
  return (
    <article>
      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 lg:pt-32 pb-20">
        <div className="max-w-3xl">
          <div className="eyebrow mb-6">אודות Modaco</div>
          <h1 className="font-display text-5xl lg:text-7xl text-ink leading-[1.05]">
            ההבדל בין חלל טוב<br />
            לחלל יוצא דופן<br />
            <span className="text-mocha font-display-light">טמון בפרטים.</span>
          </h1>
        </div>
      </section>

      {/* Image break */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-20">
        <div className="aspect-[21/9] overflow-hidden">
          <img
            src="/images/modaco/5F7A9768.webp"
            alt="פרויקט מודקו"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Story — two columns of editorial text */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4">
            <div className="eyebrow mb-5">הסיפור שלנו</div>
            <h2 className="font-display text-3xl lg:text-4xl text-ink leading-tight">
              40+ שנה של<br />מחויבות ל<span className="text-mocha font-display-light">איכות</span>
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-6 text-ink-soft/85 font-light text-lg leading-loose">
            <p>
              כבר למעלה מ־40 שנה אנו פועלים מתוך מחויבות עמוקה לאיכות, דיוק
              וסטנדרט בלתי מתפשר. הניסיון הרב שצברנו לאורך השנים בעולמות הנגרות
              והמטבחים מהווה עבורנו בסיס איתן להבנה אמיתית של חללים, חומרים וצרכים
              פונקציונליים — הבנה שמלווה אותנו בכל מוצר ובכל פתרון שאנו מציעים.
            </p>
            <p>
              החזון שלנו הוא להוביל את תחום הפרזול והאקססוריז לבית בישראל, ולהעניק
              לכל לקוח את האפשרות ליצור חלל שלם, מוקפד ומדויק עד הפרט הקטן ביותר.
              אנו מאמינים כי ההבדל בין חלל טוב לחלל יוצא דופן טמון דווקא בפרטים
              הקטנים — במנגנונים, בידיות, בפתרונות האחסון ובאיכות הגימור.
            </p>
          </div>
        </div>
      </section>

      {/* Pillar — Hardware */}
      <section className="bg-cream-deep">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-4">
              <div className="eyebrow mb-5">פרזול ואקססוריז</div>
              <h2 className="font-display text-3xl lg:text-4xl text-ink leading-tight">
                לב הפעילות.<br />
                <span className="text-mocha font-display-light">לב הבית.</span>
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-6 text-ink-soft/85 font-light text-lg leading-loose">
              <p>
                תחום הפרזול והאקססוריז מהווה את לב הפעילות שלנו, ומתמקד בהבאת
                המוצרים, הפתרונות והמותגים המובילים בעולם אל הלקוח הישראלי. אנו
                בוחרים בקפידה כל פריט ופריט — מתוך ראייה רחבה של עמידות לאורך זמן,
                נוחות שימוש יומיומית, עיצוב מתקדם והתאמה מושלמת לסטנדרטים הגבוהים
                ביותר של המטבח והבית המודרני.
              </p>
              <p>
                המגוון הרחב שאנו מציעים כולל פתרונות חכמים לאחסון, מנגנוני פתיחה
                וסגירה מתקדמים, אביזרי מטבח, ידיות מעוצבות ואקססוריז משלימים — כולם
                נבחרים מתוך מטרה אחת: לייצר חוויית שימוש מושלמת לאורך שנים.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar — Carpentry */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4">
            <div className="eyebrow mb-5">מטבחי יוקרה</div>
            <h2 className="font-display text-3xl lg:text-4xl text-ink leading-tight">
              העוגן<br />
              <span className="text-mocha font-display-light">המקצועי</span>
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-6 text-ink-soft/85 font-light text-lg leading-loose">
            <p>
              לצד זאת, פעילות המטבחים שלנו ממשיכה להוות עוגן מקצועי חשוב, עם
              התמחות בתכנון וייצור מטבחי יוקרה בהתאמה אישית. החיבור בין נגרות
              איכותית לבין פרזול מתקדם מאפשר לנו להציע ללקוחותינו ראייה שלמה
              ומדויקת — כזו שמתייחסת גם למבנה וגם לפרטים שמרכיבים אותו.
            </p>
            <p>
              אנו מלווים את לקוחותינו, מעצבים ואנשי מקצוע מתוך גישה של שירות אישי,
              מקצועיות ושקיפות מלאה, תוך הבנה שכל פרויקט הוא עולם בפני עצמו ודורש
              התאמה מדויקת לצרכים ולסטנדרטים של הלקוח.
            </p>
            <p>
              החזון שלנו הוא להמשיך ולהתפתח כבית מוביל לפרזול ואקססוריז בישראל,
              המשלב ניסיון של עשרות שנים עם חדשנות מתמדת, ולהוות כתובת אחת מקצועית,
              אמינה ומדויקת לכל מי שמחפש איכות ללא פשרות.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-cream-deep">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
          <div className="text-center mb-16">
            <div className="eyebrow mb-5">הנהלה</div>
            <h2 className="font-display text-4xl lg:text-5xl text-ink">
              פנים מאחורי המותג
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-2xl mx-auto text-center">
            <div>
              <div className="font-display text-2xl text-ink mb-2">קובי מויאל</div>
              <div className="text-sm tracking-wider uppercase text-mocha">בעלים ומייסד</div>
            </div>
            <div>
              <div className="font-display text-2xl text-ink mb-2">ירין מויאל</div>
              <div className="text-sm tracking-wider uppercase text-mocha">מנכ&quot;ל</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-cream">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 text-center">
          <div className="eyebrow text-mocha-soft mb-6">צרו קשר</div>
          <h2 className="font-display text-4xl lg:text-5xl text-cream mb-6">
            רוצים לשמוע עוד?
          </h2>
          <p className="text-cream/70 font-light text-lg mb-10 max-w-md mx-auto">
            נשמח לעמוד לרשותכם בכל שאלה.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="tel:0526804945"
              className="px-9 py-4 bg-cream text-ink text-sm tracking-wide hover:bg-mocha-soft transition-colors"
            >
              052-680-4945
            </a>
            <Link
              href="/contact"
              className="px-9 py-4 border border-cream/40 text-cream text-sm tracking-wide hover:border-cream hover:bg-cream/5 transition-all"
            >
              טופס יצירת קשר
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
