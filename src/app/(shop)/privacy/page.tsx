import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "מדיניות פרטיות של Modaco — התאמה מלאה לחוק הגנת הפרטיות ולתיקון 13 משנת 2025. זכויות המשתמש, אבטחה, שיתוף מידע ושקיפות מלאה.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-[900px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
      <div className="eyebrow mb-5">מסמך משפטי · תואם תיקון 13</div>
      <h1 className="font-display font-bold text-4xl lg:text-5xl text-ink leading-[1.05] mb-4">
        מדיניות פרטיות
      </h1>
      <p className="text-sm text-ink-soft font-light mb-8">
        עדכון אחרון: 16 באפריל 2026 · תוקף: מיום הפרסום
      </p>
      <p className="text-sm text-ink-soft font-light mb-12 border-r-2 border-mocha pr-5">
        מסמך זה מנוסח בהתאם לחוק הגנת הפרטיות, התשמ&quot;א-1981, לרבות תיקון מס&apos; 13 לחוק אשר נכנס לתוקף באוגוסט 2025,
        ובהתאם לתקנות הגנת הפרטיות (אבטחת מידע) התשע&quot;ז-2017.
      </p>

      <div className="prose prose-lg max-w-none space-y-8 text-ink-soft font-light leading-loose text-[15px]">
        <Section n="1" title="כללי ותחולה">
          <p>
            מדיניות זו (להלן: <strong>&ldquo;המדיניות&rdquo;</strong>) חלה על כלל שירותי האתר המופעל בכתובת
            <span dir="ltr"> modaco.co.il</span> (להלן: <strong>&ldquo;האתר&rdquo;</strong>) וכל שירות הניתן על ידי
            מודקו פרזול ואקססוריז (להלן: <strong>&ldquo;Modaco&rdquo;</strong> או <strong>&ldquo;החברה&rdquo;</strong>).
            המדיניות מתארת כיצד אנו אוספים, משתמשים, שומרים, מגנים ומשתפים מידע אישי של המשתמשים.
          </p>
          <p>
            השימוש באתר, לרבות רישום, ביצוע הזמנה או יצירת קשר, מהווה אישור המשתמש לקריאת מדיניות זו ולהסכמתו
            לאופן העיבוד המתואר בה, בכפוף לזכויותיו על פי דין.
          </p>
        </Section>

        <Section n="2" title="פרטי האחראי על המידע וממונה הגנת הפרטיות">
          <div className="bg-cream-deep border border-bone p-6 not-prose font-normal">
            <p className="mb-3"><strong>בעל מאגר המידע (האחראי על המידע):</strong></p>
            <ul className="space-y-1 mb-5">
              <li>מודקו פרזול ואקססוריז (&quot;Modaco&quot;)</li>
              <li>אתר: <span dir="ltr">modaco.co.il</span></li>
            </ul>
            <p className="mb-3"><strong>ממונה הגנת הפרטיות (Data Protection Officer):</strong></p>
            <ul className="space-y-1">
              <li><strong>שם:</strong> ירין מויאל, מנכ&quot;ל</li>
              <li><strong>דוא&quot;ל:</strong> <a href="mailto:Modacopirzul@gmail.com" className="text-mocha" dir="ltr">Modacopirzul@gmail.com</a></li>
              <li><strong>טלפון:</strong> <a href="tel:0526804945" className="text-mocha" dir="ltr">052-680-4945</a></li>
            </ul>
            <p className="mt-4 text-sm">
              הממונה זמין לפניות המשתמשים בכל נושא הקשור לפרטיות, זכויות סובייקט, בקשות מחיקה/עיון/תיקון,
              ותלונות על עיבוד מידע.
            </p>
          </div>
        </Section>

        <Section n="3" title="סוגי המידע הנאסף">
          <p>Modaco אוספת את סוגי המידע הבאים:</p>
          <div className="space-y-3">
            <Subsection title="3.1 מידע מזהה שתמסור ביוזמתך">
              <ul className="list-disc pr-6 space-y-1 text-sm">
                <li>שם מלא, כתובת דוא&quot;ל, מספר טלפון, כתובת למשלוח</li>
                <li>בעסקאות B2B: שם עסק, ח.פ. / עוסק מורשה, מספר עוסק לצורכי חשבונית</li>
                <li>פרטי כניסה לחשבון (דוא&quot;ל וסיסמה מוצפנת bcrypt, או חשבון Google בעת כניסה דרך OAuth)</li>
                <li>פרטי אמצעי תשלום אינם נשמרים אצלנו — הם מועברים ישירות לספק הסליקה (ראה סעיף 8)</li>
              </ul>
            </Subsection>
            <Subsection title="3.2 מידע הנאסף אוטומטית בעת השימוש באתר">
              <ul className="list-disc pr-6 space-y-1 text-sm">
                <li>כתובת IP, מיקום גיאוגרפי גס, שפת דפדפן, סוג דפדפן ומערכת הפעלה</li>
                <li>מסלול הגלישה באתר, דפים שנצפו, משך שהייה, מקור ההפניה (referrer)</li>
                <li>מזהה מכשיר וקובצי Cookie (ראה סעיף 10)</li>
                <li>נתוני לוג מערכת (timestamp, שגיאות, בקשות לשרת)</li>
              </ul>
            </Subsection>
            <Subsection title="3.3 מידע עסקי ושימושי">
              <ul className="list-disc pr-6 space-y-1 text-sm">
                <li>היסטוריית הזמנות, מוצרים בסל, עגלות נטושות</li>
                <li>תקשורת כתובה איתנו (דוא&quot;ל, טופס יצירת קשר, וואטסאפ)</li>
                <li>ביקורות ותגובות שתבחר לפרסם (במידה שתהיה אפשרות כזו)</li>
              </ul>
            </Subsection>
            <Subsection title="3.4 מידע רגיש (כהגדרתו בתיקון 13)">
              <p className="text-sm">
                Modaco אינה אוספת, מבקשת או מעבדת במודע מידע בעל רגישות מיוחדת כגון: מצב בריאות, נתונים ביומטריים,
                אמונה/דת, מוצא אתני, דעות פוליטיות, נטייה מינית או מידע פיננסי מעבר לנדרש לעסקה.
                במידה שמידע רגיש נמסר בטעות — נפנה להסרתו מיידית.
              </p>
            </Subsection>
          </div>
        </Section>

        <Section n="4" title="מטרות עיבוד המידע">
          <p>אנו מעבדים מידע לצרכים הבאים בלבד, ולפי עקרון מזעור המידע (<em>data minimization</em>):</p>
          <ul className="list-disc pr-6 space-y-2">
            <li><strong>ביצוע הזמנות ומתן שירות:</strong> אימות זהות, גביית תשלום, אספקה, הפקת חשבונית, שירות לקוחות, אחריות.</li>
            <li><strong>ניהול חשבון משתמש:</strong> התחברות, שחזור סיסמה, היסטוריית הזמנות.</li>
            <li><strong>שיפור האתר והחוויה:</strong> ניתוח שימוש מצטבר, תיקון שגיאות, פיתוח תכונות.</li>
            <li><strong>שיווק ישיר — אך ורק בהסכמה מפורשת:</strong> דיוור חדשות, מבצעים והמלצות. ניתן להסיר בכל עת.</li>
            <li><strong>ציות לדין:</strong> עמידה בחוקי מס, הגנת הצרכן, מאבק בהונאות.</li>
            <li><strong>הגנה על זכויות Modaco:</strong> זיהוי שימוש לרעה, מניעת הונאה, הגנה משפטית.</li>
          </ul>
        </Section>

        <Section n="5" title="הבסיסים החוקיים לעיבוד">
          <p>עיבוד המידע מבוסס על אחד או יותר מהבסיסים הבאים (סעיפים 1, 7, 11 לחוק הגנת הפרטיות):</p>
          <ul className="list-disc pr-6 space-y-2">
            <li><strong>הסכמה מפורשת</strong> של המשתמש (לדוגמה: הרשמה לדיוור).</li>
            <li><strong>ביצוע חוזה</strong> — הכרחי למילוי ההזמנה.</li>
            <li><strong>חובה חוקית</strong> — שמירת רישומי עסקאות לצרכי מס, חוק הגנת הצרכן.</li>
            <li><strong>אינטרס לגיטימי</strong> של Modaco — מניעת הונאות, אבטחת מידע, ניתוח פנימי.</li>
          </ul>
        </Section>

        <Section n="6" title="שיתוף מידע עם צדדים שלישיים">
          <p>
            Modaco לא מוכרת, משכירה או סוחרת במידע אישי. אנו משתפים מידע רק עם הגורמים הבאים, ובהיקף הנדרש למילוי מטרת השיתוף:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm not-prose border border-bone">
              <thead className="bg-cream-deep">
                <tr>
                  <th className="text-right px-4 py-2 border-b border-bone">גורם</th>
                  <th className="text-right px-4 py-2 border-b border-bone">מטרה</th>
                  <th className="text-right px-4 py-2 border-b border-bone">מידע משותף</th>
                </tr>
              </thead>
              <tbody className="font-light">
                <tr className="border-b border-bone">
                  <td className="px-4 py-3">ספק סליקה (Morning / Tranzila)</td>
                  <td className="px-4 py-3">גביית תשלום</td>
                  <td className="px-4 py-3">שם, דוא&quot;ל, סכום, פרטי אשראי (ישירות לספק, לא אלינו)</td>
                </tr>
                <tr className="border-b border-bone">
                  <td className="px-4 py-3">שירות חשבוניות (Green Invoice)</td>
                  <td className="px-4 py-3">הפקת חשבונית מס כחוק</td>
                  <td className="px-4 py-3">שם, כתובת, ח.פ./ת.ז., פרטי עסקה</td>
                </tr>
                <tr className="border-b border-bone">
                  <td className="px-4 py-3">חברת שליחויות</td>
                  <td className="px-4 py-3">משלוח חבילות</td>
                  <td className="px-4 py-3">שם, כתובת, טלפון</td>
                </tr>
                <tr className="border-b border-bone">
                  <td className="px-4 py-3">ספקי ענן / אחסון (Vercel, Supabase)</td>
                  <td className="px-4 py-3">אחסון נתוני האתר</td>
                  <td className="px-4 py-3">כל נתוני המערכת בשרתים מאובטחים</td>
                </tr>
                <tr className="border-b border-bone">
                  <td className="px-4 py-3">שירותי דוא&quot;ל (SMTP / SendGrid)</td>
                  <td className="px-4 py-3">שליחת אישורי הזמנה, עדכונים</td>
                  <td className="px-4 py-3">דוא&quot;ל, שם, תוכן ההודעה</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">רשויות מוסמכות</td>
                  <td className="px-4 py-3">ציות לדרישת חוק / צו שיפוטי</td>
                  <td className="px-4 py-3">לפי ההוראה הספציפית</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm">
            כל ספק צד שלישי המעבד מידע עבורנו מחויב לפעול במסגרת הסכם עיבוד מידע (<em>Data Processing Agreement</em>)
            העומד בדרישות תיקון 13, ולהשתמש במידע אך ורק למטרה שלשמה הועבר.
          </p>
        </Section>

        <Section n="7" title="העברת מידע מחוץ לישראל">
          <p>
            חלק מספקי השירות שלנו (לדוגמה Vercel, Supabase, SendGrid) מאחסנים נתונים בשרתים במדינות האיחוד האירופי
            וארה&quot;ב. העברות אלה מבוצעות בהתאם להוראות סעיף 2(ב) לתקנות הגנת הפרטיות (העברת מידע אל מחוץ לגבולות המדינה) תשס&quot;א-2001,
            למדינות המבטיחות רמת הגנה נאותה או תחת מנגנונים חוזיים סטנדרטיים (<em>Standard Contractual Clauses</em>).
          </p>
        </Section>

        <Section n="8" title="אבטחת מידע">
          <p>
            Modaco נוקטת באמצעי אבטחה טכניים וארגוניים סבירים בהתאם לתקנות הגנת הפרטיות (אבטחת מידע) התשע&quot;ז-2017,
            ברמת האבטחה המתאימה לסיווג המאגר כ<strong>מאגר ברמה בינונית</strong>:
          </p>
          <ul className="list-disc pr-6 space-y-2">
            <li><strong>הצפנה בתנועה:</strong> כל התעבורה באתר מוצפנת ב-HTTPS / TLS 1.3.</li>
            <li><strong>הצפנה באחסון:</strong> סיסמאות מוצפנות b-hash (bcrypt), בסיס הנתונים מוגן בהרשאות גישה.</li>
            <li><strong>אימות:</strong> גישה לחשבון משתמש באמצעות דוא&quot;ל וסיסמה או OAuth, הרשאות ADMIN מוגבלות לצוות Modaco בלבד.</li>
            <li><strong>אין אחסון פרטי אשראי מלאים</strong> במערכות Modaco. ספק הסליקה הוא PCI-DSS Level 1.</li>
            <li><strong>גיבויים אוטומטיים</strong> של בסיס הנתונים.</li>
            <li><strong>ניטור שוטף</strong> לאיתור גישות חשודות, ניסיונות פריצה ודליפות מידע.</li>
            <li><strong>מזעור נתונים:</strong> איננו אוספים מידע שאינו נחוץ למטרה.</li>
          </ul>
          <p className="text-sm">
            למרות אמצעי האבטחה, אין אתר אינטרנט חסין לחלוטין. המשתמש מכיר בסיכון המובנה ונוטל על עצמו אחריות לשמירה על סודיות סיסמתו.
          </p>
        </Section>

        <Section n="9" title="הפרת אבטחת מידע — פרוטוקול תיקון 13">
          <p>
            במקרה של אירוע אבטחת מידע חמור העלול להוביל לפגיעה בפרטיות המשתמשים, Modaco תפעל כדלקמן:
          </p>
          <ul className="list-disc pr-6 space-y-2">
            <li>
              <strong>הודעה לרשות הגנת הפרטיות</strong> בתוך 24 שעות מרגע זיהוי הפרה חמורה,
              בהתאם לחובה החדשה שנקבעה בתיקון 13.
            </li>
            <li>
              <strong>הודעה לנפגעים</strong> בתוך פרק זמן סביר, כאשר להפרה השלכה משמעותית על זכויותיהם,
              בדוא&quot;ל או באמצעי מתאים אחר.
            </li>
            <li>
              <strong>תיעוד מלא</strong> של האירוע, השלכותיו ופעולות התיקון.
            </li>
            <li>
              <strong>שיתוף פעולה</strong> מלא עם רשויות מוסמכות.
            </li>
          </ul>
        </Section>

        <Section n="10" title="עוגיות (Cookies) וטכנולוגיות דומות">
          <p>
            האתר משתמש בעוגיות — קובצי טקסט קטנים הנשמרים בדפדפן — לצרכים הבאים:
          </p>
          <ul className="list-disc pr-6 space-y-2">
            <li><strong>עוגיות הכרחיות:</strong> לניהול סשן, סל קניות, העדפות שפה, אבטחה. אינן דורשות הסכמה.</li>
            <li><strong>עוגיות פונקציונליות:</strong> זיכרון העדפות (לדוגמה: מצב תצוגה), משופרות את חוויית השימוש.</li>
            <li><strong>עוגיות אנליטיות:</strong> למדידת תנועה מצטברת באתר (Google Analytics / Vercel Analytics), מחייבות הסכמה.</li>
            <li><strong>עוגיות שיווקיות:</strong> לטירגוט פרסומות — יופעלו אך ורק לאחר הסכמה מפורשת.</li>
          </ul>
          <p>
            בכניסה ראשונה לאתר מוצג Banner הסכמה, המאפשר למשתמש לבחור באילו קטגוריות עוגיות הוא מסכים.
            ניתן לבטל הסכמה בכל עת באמצעות הגדרות הדפדפן או פנייה לממונה הפרטיות.
          </p>
        </Section>

        <Section n="11" title="זכויות המשתמש (לפי תיקון 13)">
          <p>כמשתמש באתר, עומדות לרשותך הזכויות הבאות ביחס למידע האישי שלך:</p>
          <div className="space-y-4">
            <Right title="11.1 זכות עיון" body="זכות לקבל אישור האם מידע אישי עליך מעובד, וכן עותק של המידע." />
            <Right title="11.2 זכות תיקון" body="זכות לתקן מידע לא מדויק או בלתי שלם." />
            <Right title="11.3 זכות מחיקה (&quot;זכות להישכח&quot;)" body="זכות לבקש מחיקת המידע — למעט מידע שאנו מחויבים לשמור לפי חוק (לדוגמה: רישומי מס 7 שנים)." />
            <Right title="11.4 זכות הגבלת עיבוד" body="זכות לדרוש הגבלת העיבוד בנסיבות מסוימות (לדוגמה: ערעור על דיוק המידע)." />
            <Right title="11.5 זכות ניוד המידע" body="זכות לקבל את המידע האישי במבנה מובנה, נפוץ וקריא מכונה, ולהעבירו לספק אחר." />
            <Right title="11.6 זכות התנגדות" body="זכות להתנגד לעיבוד מידע לצרכי שיווק ישיר, או מטעמים של המצב האישי שלך — לגבי עיבוד המבוסס על אינטרס לגיטימי." />
            <Right title="11.7 זכות ביחס לקבלת החלטות אוטומטיות" body="אין באתר מערכת המקבלת החלטות אוטומטיות משמעותיות ללא התערבות אנושית. במידה שתופעל — יימסר לך מידע מלא על לוגיקת הקבלטה וזכותך לערעור אנושי." />
          </div>
          <p>
            לממש כל אחת מהזכויות — פנה לממונה הגנת הפרטיות בדרכים המפורטות בסעיף 2.
            המענה יינתן בתוך 30 יום, ובדרך כלל ללא עלות.
          </p>
        </Section>

        <Section n="12" title="תקופות שמירת המידע">
          <table className="w-full text-sm not-prose border border-bone">
            <thead className="bg-cream-deep">
              <tr>
                <th className="text-right px-4 py-2 border-b border-bone">סוג מידע</th>
                <th className="text-right px-4 py-2 border-b border-bone">תקופת שמירה</th>
              </tr>
            </thead>
            <tbody className="font-light">
              <tr className="border-b border-bone">
                <td className="px-4 py-3">חשבון משתמש פעיל</td>
                <td className="px-4 py-3">לאורך חיי החשבון + 3 שנים מחוסר פעילות</td>
              </tr>
              <tr className="border-b border-bone">
                <td className="px-4 py-3">היסטוריית הזמנות וחשבוניות</td>
                <td className="px-4 py-3">7 שנים (חובה על פי פקודת מס הכנסה)</td>
              </tr>
              <tr className="border-b border-bone">
                <td className="px-4 py-3">עגלות נטושות</td>
                <td className="px-4 py-3">90 ימים ואז מחיקה אוטומטית</td>
              </tr>
              <tr className="border-b border-bone">
                <td className="px-4 py-3">נתוני לוג ושרתים</td>
                <td className="px-4 py-3">12 חודשים</td>
              </tr>
              <tr className="border-b border-bone">
                <td className="px-4 py-3">תקשורת שירות לקוחות</td>
                <td className="px-4 py-3">3 שנים</td>
              </tr>
              <tr>
                <td className="px-4 py-3">הסכמות שיווקיות (או ביטולן)</td>
                <td className="px-4 py-3">לצמיתות (הוכחת הסכמה / ביטול)</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section n="13" title="שיווק ישיר">
          <p>
            בהתאם לסעיף 30א לחוק התקשורת (בזק ושידורים) — שליחת דיוור שיווקי מחייבת הסכמה מפורשת ומראש של הנמען,
            בדרך של <strong>opt-in ברור שאינו מסומן מראש</strong>.
          </p>
          <p>
            כל הודעת שיווק שתשלח כוללת אפשרות קלה להסרה (<em>unsubscribe</em>) בלחיצת כפתור. ההסרה תיכנס לתוקף
            תוך 3 ימי עסקים לכל היותר.
          </p>
          <p>
            המשתמש רשאי להגיש בקשה למחיקה ממאגר השיווק בכל עת באמצעות פנייה ישירה לממונה הפרטיות.
          </p>
        </Section>

        <Section n="14" title="קטינים">
          <p>
            האתר אינו מיועד לילדים מתחת לגיל 18. איננו אוספים במודע מידע מקטינים. הורה/אפוטרופוס שזיהה כי ילדו
            מסר מידע — מתבקש לפנות לממונה הפרטיות להסרה מיידית.
          </p>
        </Section>

        <Section n="15" title="הצגת מודעות מותאמות אישית (Profiling)">
          <p>
            Modaco אינה מפעילה כיום מנגנוני פרופילינג מתקדמים או החלטות אוטומטיות בעלות השפעה משמעותית על המשתמש.
            במקרה של שינוי מדיניות זו — תישלח התראה מראש ותוענק זכות התנגדות.
          </p>
        </Section>

        <Section n="16" title="תלונה לרשות הגנת הפרטיות">
          <p>
            מבלי לפגוע בכל זכות אחרת, עומדת לך הזכות להגיש תלונה לרשות הגנת הפרטיות במשרד המשפטים:
          </p>
          <div className="bg-cream-deep border border-bone p-6 not-prose font-normal text-sm">
            <p><strong>הרשות להגנת הפרטיות</strong></p>
            <ul className="space-y-1 mt-2">
              <li>אתר: <a href="https://www.gov.il/he/departments/the_privacy_protection_authority" target="_blank" rel="noopener noreferrer" className="text-mocha underline" dir="ltr">gov.il/he/departments/the_privacy_protection_authority</a></li>
              <li>טופס תלונה מקוון זמין באתר הרשות</li>
            </ul>
          </div>
        </Section>

        <Section n="17" title="שינויים במדיניות">
          <p>
            Modaco רשאית לעדכן מדיניות זו מעת לעת. עדכונים מהותיים יפורסמו באתר 30 יום לפני כניסתם לתוקף ובהודעה
            לחשבונות הרשומים. המשך שימוש באתר לאחר העדכון מהווה הסכמה למדיניות החדשה.
          </p>
        </Section>

        <Section n="18" title="דין ושיפוט">
          <p>
            על מדיניות זו חל דין מדינת ישראל בלבד. סמכות השיפוט הבלעדית לכל עניין הנובע ממנה נתונה לבתי המשפט המוסמכים
            במחוז תל אביב-יפו.
          </p>
        </Section>

        <Section n="19" title="יצירת קשר לעניין פרטיות">
          <div className="bg-cream-deep border border-bone p-6 not-prose font-normal">
            <p className="mb-3">פניות, שאלות ומימוש זכויות — יש לפנות לממונה הגנת הפרטיות:</p>
            <ul className="space-y-1">
              <li><strong>ירין מויאל</strong> · מנכ&quot;ל Modaco</li>
              <li><strong>דוא&quot;ל:</strong> <a href="mailto:Modacopirzul@gmail.com" className="text-mocha" dir="ltr">Modacopirzul@gmail.com</a></li>
              <li><strong>טלפון:</strong> <a href="tel:0526804945" className="text-mocha" dir="ltr">052-680-4945</a></li>
            </ul>
            <p className="mt-4 text-sm">
              זמן מענה מוצהר: בתוך 30 יום; בדרישות דחופות (אירוע אבטחה) — תוך 72 שעות.
            </p>
          </div>
        </Section>
      </div>

      <div className="mt-16 pt-8 border-t border-bone flex justify-between text-sm flex-wrap gap-3">
        <Link href="/terms" className="text-mocha hover:text-mocha-hover">תנאי שימוש →</Link>
        <Link href="/accessibility" className="text-mocha hover:text-mocha-hover">הצהרת נגישות →</Link>
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

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display font-bold text-lg text-ink mb-2 mt-6">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function Right({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-r-2 border-mocha pr-5 py-2">
      <div className="font-bold text-ink mb-1">{title}</div>
      <div className="text-sm">{body}</div>
    </div>
  );
}
