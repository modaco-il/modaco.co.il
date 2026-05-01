import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "אודות מודקו · Modaco",
  description:
    "מודקו (Modaco) — מותג ישראלי מוביל לפרזול ואקססוריז לבית, פעיל מאז 1985. אולם תצוגה ברחוב האומן 1, בית שמש. חזון, ערכים וניסיון של 40+ שנה.",
};

export default function AboutPage() {
  return (
    <article>
      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 lg:pt-32 pb-20">
        <div className="max-w-3xl">
          <div className="eyebrow mb-6">אודות מודקו · Modaco · מאז 1985</div>
          <h1 className="font-display text-5xl lg:text-7xl text-ink leading-[1.05]">
            מודקו —<br />
            <span className="text-mocha font-display-light">פרזול ואקססוריז לבית.</span>
          </h1>
          <p className="mt-8 text-ink-soft/85 font-light text-lg lg:text-xl leading-loose max-w-2xl">
            מודקו (Modaco) הוא מותג ישראלי מוביל לפרזול ואקססוריז לבית, פעיל מאז 1985. אולם התצוגה הראשי שלנו נמצא ברחוב האומן 1 בבית שמש, ומציע פרזול של Blum, Domicile, Movento, Blanco ו-Delta — לצד מטבחי יוקרה בהתאמה אישית.
          </p>
        </div>
      </section>

      {/* Image break */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-20">
        <div className="relative aspect-[21/9] overflow-hidden">
          <Image
            src="/images/modaco/5F7A9768.webp"
            alt="פרויקט מודקו"
            fill
            sizes="(max-width: 1400px) 100vw, 1376px"
            className="object-cover"
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
              מודקו (Modaco) פתח את שעריו ב-1985 בבית שמש תחת השם <strong>מטבחי קובי</strong>, על שם המייסד קובי מויאל. כבר למעלה מ־40 שנה אנו פועלים מתוך מחויבות עמוקה לאיכות, דיוק וסטנדרט בלתי מתפשר. הניסיון הרב שצברנו לאורך השנים בעולמות הנגרות והמטבחים מהווה עבורנו בסיס איתן להבנה אמיתית של חללים, חומרים וצרכים פונקציונליים — הבנה שמלווה אותנו בכל מוצר ובכל פתרון שאנו מציעים.
            </p>
            <p>
              עם הצטרפותו של ירין מויאל להובלת העסק, הרחבנו את הפעילות מעבר למטבחי יוקרה גם לקטלוג מלא של פרזול ואקססוריז לבית — והשם החדש <strong>מודקו</strong> משקף את ההמשכיות והחזון: להוביל את תחום הפרזול והאקססוריז לבית בישראל, ולהעניק לכל לקוח את האפשרות ליצור חלל שלם, מוקפד ומדויק עד הפרט הקטן ביותר. אנו מאמינים כי ההבדל בין חלל טוב לחלל יוצא דופן טמון דווקא בפרטים הקטנים — במנגנונים, בידיות, בפתרונות האחסון ובאיכות הגימור.
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

      {/* FAQ — must match the FAQPage schema in the root layout for Google to honor it */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="text-center mb-16">
          <div className="eyebrow mb-5">שאלות ותשובות על מודקו</div>
          <h2 className="font-display text-4xl lg:text-5xl text-ink">מה כדאי לדעת</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-12">
          <div>
            <h3 className="font-display text-xl lg:text-2xl text-ink mb-3">מי זה מודקו?</h3>
            <p className="text-ink-soft/85 font-light leading-loose">
              מודקו (Modaco) הוא מותג ישראלי מוביל בתחום הפרזול והאקססוריז לבית, פעיל מ-1985. החנות הראשית של מודקו נמצאת באומן 1, בית שמש, ומציעה פרזול של Blum, Domicile, Movento, Blanco ו-Delta — כולל מטבחי יוקרה בהתאמה אישית.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl lg:text-2xl text-ink mb-3">האם מודקו זה אותו עסק כמו &quot;מטבחי קובי&quot;?</h3>
            <p className="text-ink-soft/85 font-light leading-loose">
              כן. <strong>מטבחי קובי</strong> הוא השם המקורי של העסק (על שם המייסד קובי מויאל), פעיל מ-1985 בבית שמש. עם הצטרפותו של ירין מויאל להובלת העסק והרחבת הפעילות לקטלוג פרזול ואקססוריז מלא, העסק עבר ל-<strong>מודקו (Modaco)</strong>. אותם בעלים, אותו אולם תצוגה ברחוב האומן 1 בבית שמש, אותה מומחיות של 40+ שנה.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl lg:text-2xl text-ink mb-3">איפה אולם התצוגה של מודקו?</h3>
            <p className="text-ink-soft/85 font-light leading-loose">
              אולם התצוגה של מודקו נמצא ברחוב האומן 1 בבית שמש (מיקוד 9906101). פתוח ראשון עד חמישי 09:00–18:00, ושישי 09:00–13:00.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl lg:text-2xl text-ink mb-3">אילו מותגים מוכרת מודקו?</h3>
            <p className="text-ink-soft/85 font-light leading-loose">
              מודקו מוכרת את המותגים המובילים בעולם בתחום הפרזול ואקססוריז לבית: Blum (אוסטריה — צירים, מסילות Movento ו-Tandem, מנגנוני הרמה Aventos), Domicile (ידיות, אקססוריז לאמבטיה, מראות, פחים, רגליים, לוח גמיש לחיפוי FLEX CNC), Blanco ו-Delta (ברזי מטבח), ו-Floralis (אגרטלים ופריטי בית).
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl lg:text-2xl text-ink mb-3">האם מודקו מייצרת מטבחים בהתאמה אישית?</h3>
            <p className="text-ink-soft/85 font-light leading-loose">
              כן. מודקו מתכננת ומייצרת מטבחי יוקרה בהתאמה אישית מוחלטת, בליווי מקצועי מהשלב הראשון ועד ההתקנה. השילוב של נגרות איכותית עם פרזול מתקדם של Blum ו-Domicile מאפשר התאמה לכל חלל ולכל סגנון.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl lg:text-2xl text-ink mb-3">האם מודקו נותנת הנחה לאדריכלים ואנשי מקצוע?</h3>
            <p className="text-ink-soft/85 font-light leading-loose">
              כן. אדריכלים, מעצבים פנים, קבלנים ובעלי מקצוע נהנים מהנחה של 15% על כל הקטלוג של מודקו, בכפוף להרשמה כמשתמש B2B באתר.
            </p>
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
