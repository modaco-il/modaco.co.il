export interface Category {
  slug: string;
  name: string;
  brand: string;
  tagline: string;
  shortDesc: string;
  description: string;
  cover: string;
  index: string;
  /** featured = appears in homepage bento. all visible in /catalog regardless. */
  featured?: boolean;
  /** size hint for bento layout */
  bentoSize?: "xl" | "lg" | "md" | "sm";
}

export const CATEGORIES: Category[] = [
  {
    slug: "carpentry",
    name: "נגרות",
    brand: "Modaco Premium",
    tagline: "הסיפור הראשון, בנגרות מאז 1985",
    shortDesc: "מטבחי יוקרה מהתחלה ועד הסוף",
    description:
      "מטבחי יוקרה בהתאמה אישית מוחלטת. תכנון, ייצור והתקנה ב-A→Z. שילוב של נגרות איכותית עם כל הפרזול שאנו מציעים — בליווי אישי.",
    cover: "/images/israelevitz/4-web.jpg",
    index: "01",
    featured: true,
    bentoSize: "xl",
  },
  {
    slug: "handles",
    name: "ידיות",
    brand: "Domicile",
    tagline: "הפרט שמשלים את הקו",
    shortDesc: "ידיות לארונות, מטבחים ודלתות",
    description:
      "מבחר רחב של ידיות לארונות, מטבחים ודלתות. עיצובים מינימליסטיים, קלאסיים ויוקרתיים — בכל הגימורים. ליבת החנות שלנו.",
    cover: "/images/domicile/categories/handles.jpg",
    index: "02",
    featured: true,
    bentoSize: "lg",
  },
  {
    slug: "hinges",
    name: "צירים",
    brand: "Blum & Domicile",
    tagline: "הדיוק האוסטרי של פרזול עולמי",
    shortDesc: "פרזול גרמני בדיוק שווייצרי",
    description:
      "צירים בסטנדרט הגבוה ביותר. סגירה רכה, תנועה שקטה, אחריות יצרן עד 25 שנה. מהציר הקליפי הקטן ועד מנגנונים של 180°.",
    cover: "/images/domicile/categories/hinges.jpg",
    index: "03",
    featured: true,
    bentoSize: "md",
  },
  {
    slug: "slides",
    name: "מסילות",
    brand: "Blum & Domicile",
    tagline: "תנועה שאי אפשר להרגיש",
    shortDesc: "תנועה שקטה, סגירה רכה",
    description:
      "מסילות נסתרות, נשלפות וטיפ-און — לעומסים של 40 ו-70 קילו, עם סגירה רכה ופתיחה קלה. כל מידה, כל גודל, התאמה אישית מוחלטת.",
    cover: "/images/domicile/categories/slides.jpg",
    index: "04",
    featured: true,
    bentoSize: "md",
  },
  {
    slug: "lift-systems",
    name: "מנגנוני הרמה",
    brand: "Aventos · Exparo",
    tagline: "הקלפה נפתחת בנגיעה",
    shortDesc: "הקלפה נפתחת בנגיעה",
    description:
      "מנגנונים סטטיים ודינמיים לחזיתות עליונות. פתיחה רכה, סגירה אילמת, התאמה לדלתות זכוכית, עץ או אלומיניום בגדלים ומשקלים שונים.",
    cover: "/images/domicile/categories/lift-systems.jpg",
    index: "05",
    featured: true,
    bentoSize: "sm",
  },
  {
    slug: "bath",
    name: "מוצרי אמבט",
    brand: "Domicile",
    tagline: "פרטים שמרגישים נכון בידיים",
    shortDesc: "סדרות מלאות לחדרי רחצה",
    description:
      "סדרות מלאות לחדרי רחצה — רודיום, SHELL, RIVIERA, BINOVA, RONDO, EDGE, LUCY, SANDRA, PICCOLO. גם פחים, מראות, מחממי מגבות ומחזיקי יין.",
    cover: "/images/domicile/categories/bath.jpg",
    index: "06",
    featured: true,
    bentoSize: "md",
  },
  {
    slug: "faucets",
    name: "ברזים",
    brand: "Blanco · Delta",
    tagline: "מים ששופכים עיצוב",
    shortDesc: "ברזי מטבח Blanco ו-Delta",
    description:
      "ברזי מטבח ברמה אחרת — סדרות Blanco הגרמנית ו-Delta האמריקאית. עיצוב מודרני, ברזים נשלפים, מגוון גימורים וצבעים, אחריות יצרן מלאה.",
    cover: "/images/domicile/categories/faucets.jpg",
    index: "07",
    featured: true,
    bentoSize: "sm",
  },
  {
    slug: "legs",
    name: "רגליים",
    brand: "Domicile",
    tagline: "היסוד הנכון לכל רהיט",
    shortDesc: "רגליים, רגליי דלפק וגלגלים",
    description:
      "רגליים לשולחנות, רגליי דלפק ורגליים נמוכות לריהוט — במגוון גבהים, גימורים וסגנונות. כולל גלגלים לריהוט ניידים.",
    cover: "/images/domicile/categories/legs.jpg",
    index: "08",
    featured: true,
    bentoSize: "sm",
  },
  {
    slug: "mirrors",
    name: "מראות",
    brand: "Domicile",
    tagline: "השתקפות שמעצבת חלל",
    shortDesc: "מראות מעוצבות לאמבטיה וסלון",
    description:
      "מראות מעוצבות במגוון גדלים, מסגרות וגימורים — לחדרי אמבטיה, סלון, מסדרון או חדר שינה. עגולות, מלבניות ועם מסגרות עץ או מתכת.",
    cover: "/images/domicile/categories/mirrors.jpg",
    index: "09",
    featured: true,
    bentoSize: "sm",
  },
  {
    slug: "bins",
    name: "פחים",
    brand: "Domicile",
    tagline: "פתרונות חכמים למטבח ולאמבט",
    shortDesc: "פחי אשפה ופתרונות אחסון",
    description:
      "פחי אשפה למטבח ולאמבטיה — נסתרים בארונות או חיצוניים, במגוון נפחים וגימורים. כולל פתרונות הפרדה ומיחזור.",
    cover: "/images/domicile/categories/bins.jpg",
    index: "10",
    featured: true,
    bentoSize: "sm",
  },
  {
    slug: "decorative",
    name: "דקורטיבי",
    brand: "Domicile · Floralis",
    tagline: "פריטים שגומרים את הסיפור",
    shortDesc: "אקססוריז דקורטיביים לבית",
    description:
      "מתלי בקבוקי יין, חלוקות סכום, מארגני משטחים ופריטים דקורטיביים מיוחדים — לטאצ' המוגמר של מטבח או חלל מעוצב.",
    cover: "/images/domicile/categories/decorative.jpg",
    index: "11",
    featured: true,
    bentoSize: "sm",
  },
  {
    slug: "accessories",
    name: "אקססוריז",
    brand: "Floralis",
    tagline: "אגרטלים, מראות ופריטי בית",
    shortDesc: "אגרטלים, פריטי בית וריהוט קל",
    description:
      "אקססוריז מעוצבים לבית מהמותג Floralis — אגרטלים, פריטים משלימים שמחברים בין הפרזול הטכני לתחושה ביתית מוגמרת.",
    cover: "/images/modaco/5F7A9697.webp",
    index: "12",
    featured: true,
    bentoSize: "md",
  },
  {
    slug: "cladding",
    name: "לוח גמיש לחיפוי",
    brand: "Domicile",
    tagline: "חיפוי בכל צורה ומידה",
    shortDesc: "לוחות גמישים לחיפוי קירות",
    description:
      "לוחות גמישים לחיפוי קירות, חזיתות ארונות ומשטחים מעוקלים. מגוון טקסטורות וגימורים — פתרון אלגנטי למקומות שלוחות קשיחות לא מתאימות.",
    cover: "/images/domicile/categories/cladding.jpg",
    index: "13",
    featured: true,
    bentoSize: "sm",
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
    index: "14",
    featured: true,
    bentoSize: "md",
  },
];
