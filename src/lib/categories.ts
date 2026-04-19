export interface Category {
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  shortDesc: string;
  description: string;
  cover: string;
  index: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "handles",
    name: "ידיות",
    brand: "Domicile",
    tagline: "הפרט שמשלים את הקו",
    shortDesc: "ידיות לארונות, מטבחים ודלתות",
    description:
      "מבחר רחב של ידיות לארונות, מטבחים ודלתות. עיצובים מינימליסטיים, קלאסיים ויוקרתיים — בכל הגימורים. ליבת החנות שלנו.",
    cover: "/images/israelevitz/3-web.jpg",
    index: "01",
  },
  {
    slug: "hinges",
    name: "צירים",
    brand: "Blum & Domicile",
    tagline: "הדיוק האוסטרי של פרזול עולמי",
    shortDesc: "פרזול גרמני בדיוק שווייצרי",
    description:
      "צירים בסטנדרט הגבוה ביותר. סגירה רכה, תנועה שקטה, אחריות יצרן עד 25 שנה. מהציר הקליפי הקטן ועד מנגנונים של 180°.",
    cover: "/images/blum/blum-hinges.jpg",
    index: "02",
  },
  {
    slug: "slides",
    name: "מסילות",
    brand: "Blum & Domicile",
    tagline: "תנועה שאי אפשר להרגיש",
    shortDesc: "תנועה שקטה, סגירה רכה",
    description:
      "מסילות נסתרות, נשלפות וטיפ-און — לעומסים של 40 ו-70 קילו, עם סגירה רכה ופתיחה קלה. כל מידה, כל גודל, התאמה אישית מוחלטת.",
    cover: "/images/blum/blum-slides.jpg",
    index: "03",
  },
  {
    slug: "lift-systems",
    name: "מנגנוני הרמה",
    brand: "Aventos · Exparo",
    tagline: "הקלפה נפתחת בנגיעה",
    shortDesc: "הקלפה נפתחת בנגיעה",
    description:
      "מנגנונים סטטיים ודינמיים לחזיתות עליונות. פתיחה רכה, סגירה אילמת, התאמה לדלתות זכוכית, עץ או אלומיניום בגדלים ומשקלים שונים.",
    cover: "/images/blum/blum-lift.jpg",
    index: "04",
  },
  {
    slug: "legs",
    name: "רגליים לריהוט",
    brand: "Modaco",
    tagline: "היסוד הנכון לכל רהיט",
    shortDesc: "רגליים, רגליי דלפק וגלגלים",
    description:
      "רגליים לשולחנות, רגליי דלפק ורגליים נמוכות לריהוט — במגוון גבהים, גימורים וסגנונות. כולל גלגלים לריהוט ניידים.",
    cover: "/images/modaco/5F7A9768.webp",
    index: "05",
  },
  {
    slug: "bath",
    name: "מוצרי אמבט",
    brand: "Domicile",
    tagline: "פרטים שמרגישים נכון בידיים",
    shortDesc: "סדרות מלאות לחדרי רחצה",
    description:
      "סדרות מלאות לחדרי רחצה — רודיום, SHELL, RIVIERA, BINOVA, RONDO, EDGE, LUCY, SANDRA, PICCOLO. גם פחים, מראות, מחממי מגבות ומחזיקי יין.",
    cover: "/images/domicile/lucy.jpg",
    index: "06",
  },
  {
    slug: "accessories",
    name: "אקססוריז",
    brand: "Floralis",
    tagline: "אגרטלים, מראות ופריטי בית",
    shortDesc: "אגרטלים, מראות ופריטי בית",
    description:
      "אקססוריז מעוצבים לבית מהמותג Floralis — אגרטלים, מראות ופריטים משלימים שמחברים בין הפרזול הטכני לתחושה ביתית מוגמרת.",
    cover: "/images/modaco/5F7A9697.webp",
    index: "07",
  },
  {
    slug: "aluminum",
    name: "אלומיניום וזכוכית",
    brand: "Profile 19",
    tagline: "חיתוך מדויק. למידות שלכם.",
    shortDesc: "מסגרות בהתאמה אישית",
    description:
      "פרופילי אלומיניום בעובי 19 מ\"מ עם משטחי זכוכית. לחזיתות ארונות, ויטרינות, מחיצות חלל ודלתות הזזה. כל פרופיל נחתך בהתאמה אישית.",
    cover: "/images/israelevitz/2-web.jpg",
    index: "08",
  },
  {
    slug: "carpentry",
    name: "נגרות",
    brand: "Modaco Premium",
    tagline: "הסיפור הראשון, בנגרות מאז 1985",
    shortDesc: "מטבחי יוקרה מהתחלה ועד הסוף",
    description:
      "מטבחי יוקרה בהתאמה אישית מוחלטת. תכנון, ייצור והתקנה ב-A→Z. שילוב של נגרות איכותית עם כל הפרזול שאנו מציעים — בליווי אישי.",
    cover: "/images/israelevitz/4-web.jpg",
    index: "09",
  },
];
