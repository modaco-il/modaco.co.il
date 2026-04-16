import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "הצהרת נגישות Modaco — מחויבות לתקן WCAG 2.0 AA בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ותקנות הנגישות של מדינת ישראל.",
  robots: { index: true, follow: true },
};

export default function AccessibilityPage() {
  return (
    <article className="max-w-[900px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
      <div className="eyebrow mb-5">מסמך משפטי · נגישות</div>
      <h1 className="font-display font-bold text-4xl lg:text-5xl text-ink leading-[1.05] mb-4">
        הצהרת נגישות
      </h1>
      <p className="text-sm text-ink-soft font-light mb-12">
        עדכון אחרון: 16 באפריל 2026 · סקירה תקופתית: מדי 12 חודשים
      </p>

      <div className="prose prose-lg max-w-none space-y-8 text-ink-soft font-light leading-loose text-[15px]">
        <Section n="1" title="מחויבות">
          <p>
            Modaco רואה באנשים עם מוגבלות לקוחות שווי-זכויות, ומחויבת להנגיש את שירותיה ואת אתר האינטרנט שלה
            <span dir="ltr"> modaco.co.il</span> (להלן: <strong>&ldquo;האתר&rdquo;</strong>) לכל אדם — על פי חוק
            שוויון זכויות לאנשים עם מוגבלות, התשנ&quot;ח-1998, ותקנות שוויון זכויות לאנשים עם מוגבלות
            (התאמות נגישות לשירות) התשע&quot;ג-2013.
          </p>
          <p>
            מטרתנו לאפשר לכל לקוחותינו, לרבות אנשים עם מוגבלויות ראייה, שמיעה, ניידות, קוגניטיבית ונוירולוגית,
            לגלוש, ללמוד, להתרשם ולרכוש באתר בחוויה טבעית ושוויונית.
          </p>
        </Section>

        <Section n="2" title="תקן הנגישות">
          <p>
            האתר נבנה ומתוחזק בהתאם ל<strong>תקן ישראלי ת&quot;י 5568</strong> ברמה AA, הנסמך על תקן בינלאומי
            <strong> WCAG 2.0 (Web Content Accessibility Guidelines)</strong> — הנדרש על פי החוק בישראל.
          </p>
        </Section>

        <Section n="3" title="רכיבי נגישות באתר">
          <p>האתר כולל כיום את רכיבי הנגישות הבאים:</p>
          <ul className="list-disc pr-6 space-y-2">
            <li>
              <strong>תפריט נגישות ייעודי</strong> — פינה תחתונה של המסך, מאפשר:
              <ul className="list-disc pr-6 space-y-1 mt-1 text-sm">
                <li>הגדלה והקטנה של גודל הטקסט</li>
                <li>שינוי ניגודיות (ניגודיות גבוהה / תצוגה חשוכה)</li>
                <li>הבלטת קישורים וכותרות</li>
                <li>עצירת אנימציות ותנועה</li>
                <li>עכבר גדול וסמן ברור</li>
                <li>איפוס הגדרות לברירת מחדל</li>
              </ul>
            </li>
            <li><strong>ניווט מקלדת מלא</strong> — ניתן להגיע לכל רכיבי האתר באמצעות מקש <kbd>Tab</kbd> ומקשי החץ.</li>
            <li><strong>תגיות Alt לתמונות</strong> — לכל תמונה משמעותית באתר יש טקסט חלופי מתאר.</li>
            <li><strong>תאימות לקוראי מסך</strong> — האתר תואם לקוראי מסך נפוצים (NVDA, JAWS, VoiceOver, TalkBack).</li>
            <li><strong>מבנה סמנטי</strong> — שימוש בכותרות H1-H6 נכון, landmarks ו-ARIA roles.</li>
            <li><strong>ניגודיות צבעים</strong> — ניגודיות בין טקסט לרקע עומדת ביחס 4.5:1 לטקסט רגיל ו-3:1 לטקסט גדול.</li>
            <li><strong>גודל פונטים מותאם</strong> — הפונטים שניתן להגדיל עד 200% ללא פגיעה בתצוגה.</li>
            <li><strong>RTL מלא</strong> — תמיכה מלאה בעברית וכיוון מימין לשמאל.</li>
            <li><strong>ללא טקסט בתמונות</strong> — טקסטים אינם משולבים כתמונה, מלבד לוגו המותג.</li>
            <li><strong>טפסים נגישים</strong> — תוויות ברורות, הודעות שגיאה מפורטות, ניווט לוגי.</li>
          </ul>
        </Section>

        <Section n="4" title="נגישות פיזית — אולם תצוגה / משרדים">
          <p>
            במועד פרסום ההצהרה, Modaco פועלת בעיקר באופן מקוון. בעת קבלת לקוחות באולם תצוגה פיזי או בסדנה —
            תינתן התאמה לפי בקשה מוקדמת (כניסה נגישה, שירותים, ליווי). יש לתאם מראש מול שירות הלקוחות.
          </p>
        </Section>

        <Section n="5" title="מגבלות ידועות">
          <p>
            למרות מאמצינו להנגיש את כל רכיבי האתר, ייתכנו מגבלות מסוימות:
          </p>
          <ul className="list-disc pr-6 space-y-2">
            <li>
              <strong>תוכן חיצוני:</strong> אתר זה כולל קישורים לאתרים חיצוניים (יצרנים, ספקים) שאינם בשליטתנו ואין ערובה לרמת נגישותם.
            </li>
            <li>
              <strong>תיאורי מוצרים חסרים:</strong> לחלק קטן מהמוצרים (פחות מ-5%) ייתכן שחסר תיאור מפורט. התיאורים מתעדכנים באופן שוטף.
            </li>
            <li>
              <strong>תמונות מורכבות:</strong> בעבור תרשימים טכניים של מוצרי פרזול מסוימים, ייתכן שטקסט ה-alt חסר או שאינו מלא.
              במידה ויש צורך בתיאור מפורט — פנה לרכז הנגישות.
            </li>
            <li>
              <strong>וידאו:</strong> אם יהיה בעתיד תוכן וידאו, הוא יכלול כתוביות ותמלול בהתאם לתקן.
            </li>
          </ul>
          <p>
            אנו פועלים באופן שוטף לאיתור ותיקון מגבלות. אם נתקלת בבעיית נגישות שלא דווחה — אנא דווח לרכז הנגישות.
          </p>
        </Section>

        <Section n="6" title="רכז הנגישות">
          <div className="bg-cream-deep border border-bone p-6 not-prose font-normal">
            <p className="mb-3">
              רכז הנגישות של Modaco זמין לשאלות, פניות, דיווח על בעיות נגישות והתאמות מיוחדות:
            </p>
            <ul className="space-y-1">
              <li><strong>שם:</strong> ירין מויאל, מנכ&quot;ל Modaco</li>
              <li><strong>טלפון:</strong> <a href="tel:0526804945" className="text-mocha" dir="ltr">052-680-4945</a></li>
              <li><strong>דוא&quot;ל:</strong> <a href="mailto:Modacopirzul@gmail.com?subject=נגישות" className="text-mocha" dir="ltr">Modacopirzul@gmail.com</a></li>
              <li><strong>שעות מענה:</strong> א&apos;–ה&apos; 08:00–18:00 · ו&apos; 08:00–13:00</li>
            </ul>
            <p className="mt-4 text-sm">
              זמן מענה מוצהר — עד 7 ימי עסקים מקבלת הפנייה, בכל ערוץ תקשורת.
            </p>
          </div>
        </Section>

        <Section n="7" title="תהליך פנייה ותיעוד">
          <p>כדי לסייע בטיפול מהיר ויעיל בפנייה, מומלץ לכלול:</p>
          <ul className="list-disc pr-6 space-y-1">
            <li>תיאור הבעיה (מה ניסית לעשות, באיזה עמוד, איזה רכיב)</li>
            <li>סוג המכשיר (מחשב / טלפון / טאבלט)</li>
            <li>הדפדפן ומערכת ההפעלה</li>
            <li>האם משתמש בטכנולוגיה מסייעת (קורא מסך, זכוכית מגדלת, הקראה קולית)</li>
            <li>צילום מסך (אם אפשר)</li>
          </ul>
          <p>כל פנייה מתועדת ומטופלת ברצף מול רכז הנגישות.</p>
        </Section>

        <Section n="8" title="סקירה תקופתית">
          <p>
            Modaco עורכת סקירת נגישות שנתית (לפחות אחת ל-12 חודשים) על ידי בדיקה פנימית וניסויי שימוש.
            תוצאות הסקירה משמשות לעדכון האתר ולעדכון הצהרה זו.
          </p>
          <p>תאריך סקירה הבאה המתוכננת: <strong>אפריל 2027</strong>.</p>
        </Section>

        <Section n="9" title="זכות ערעור">
          <p>
            אם פנייתך לא טופלה לשביעות רצונך, או אם אתה סבור שזכויותיך כאדם עם מוגבלות נפגעו —
            עומדת לרשותך הזכות לפנות לגורמים הבאים:
          </p>
          <div className="bg-cream-deep border border-bone p-6 not-prose font-normal text-sm">
            <ul className="space-y-3">
              <li>
                <strong>נציבות שוויון זכויות לאנשים עם מוגבלות</strong><br />
                טלפון: <span dir="ltr">02-5088001</span><br />
                אתר: <a href="https://www.gov.il/he/departments/the_commission_for_equal_rights_of_persons_with_disabilities" target="_blank" rel="noopener noreferrer" className="text-mocha underline" dir="ltr">gov.il — נציבות שוויון</a>
              </li>
              <li>
                <strong>מוקד פניות ציבור — משרד המשפטים</strong><br />
                טלפון: <span dir="ltr">*6050</span>
              </li>
            </ul>
          </div>
        </Section>

        <Section n="10" title="הגבלת אחריות">
          <p>
            הצהרת נגישות זו מתארת את מחויבותנו ואת מצב הנגישות הנוכחי של האתר. על אף מאמצינו להנגיש את כל התכנים,
            ייתכנו מגבלות זמניות שנובעות מעדכוני תוכן, שינויים טכנולוגיים או תוכן צד שלישי.
            Modaco אינה נוטלת אחריות בלתי-מוגבלת לתקלות זמניות, אך מתחייבת לטפל בכל פנייה בתוך המועדים המוצהרים.
          </p>
        </Section>
      </div>

      <div className="mt-16 pt-8 border-t border-bone flex justify-between text-sm flex-wrap gap-3">
        <Link href="/terms" className="text-mocha hover:text-mocha-hover">תנאי שימוש →</Link>
        <Link href="/privacy" className="text-mocha hover:text-mocha-hover">מדיניות פרטיות →</Link>
      </div>
    </article>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-bold text-2xl lg:text-3xl text-ink mb-4 mt-12 flex items-baseline gap-4">
        <span className="text-mocha text-lg font-normal">{n}</span>
        <span>{title}</span>
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
