import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://modaco.co.il"),
  title: {
    default: "מודקו | Modaco — פרזול ואקססוריז לבית · אולם תצוגה בבית שמש",
    template: "%s | מודקו · Modaco",
  },
  description:
    "Modaco (מודקו) — למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית. צירים, מסילות, ידיות, ברזי מטבח, רגליים ואקססוריז מהמותגים המובילים בעולם — Blum, Domicile, Movento. אולם תצוגה רחב + סדנת נגרות.",
  keywords: [
    "Modaco",
    "מודקו",
    "פרזול לבית",
    "פרזול למטבח",
    "ידיות לארונות",
    "צירי בלום",
    "מסילות",
    "ברזי מטבח",
    "Domicile",
    "Blum",
    "מטבחים בהתאמה אישית",
    "modaco.co.il",
  ],
  openGraph: {
    title: "Modaco — מודקו | פרזול ואקססוריז לבית",
    description:
      "המותגים המובילים בעולם — Blum, Domicile, Movento. קטלוג פרזול מלא, מטבחי יוקרה בהתאמה אישית.",
    url: "https://modaco.co.il",
    siteName: "Modaco — מודקו",
    locale: "he_IL",
    alternateLocale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/israelevitz/1-web.jpg",
        width: 2000,
        height: 1333,
        alt: "Modaco — מודקו",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Modaco — מודקו | פרזול ואקססוריז לבית",
    description: "המותגים המובילים בעולם. קטלוג פרזול מלא ומטבחי יוקרה.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://modaco.co.il",
    languages: {
      "he-IL": "https://modaco.co.il",
      "x-default": "https://modaco.co.il",
    },
  },
  // Verification — fill these in once GSC / Bing accounts give us tokens.
  // Until then, env-based fallback so we don't redeploy for verification.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION ?? "",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <head>
        <meta name="theme-color" content="#FAF6F0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["LocalBusiness", "Store", "HomeGoodsStore"],
                  "@id": "https://modaco.co.il/#organization",
                  name: "Modaco",
                  // Aliases that the brand has been known by over the years.
                  // "מטבחי קובי" is the older name (Kobi's Kitchens, after founder
                  // Kobi Moyal). Including it here helps Google merge the old
                  // Facebook page (facebook.com/modaco2000 — branded "מטבחי קובי
                  // | Bet Shemesh") into the same entity as modaco.co.il, so the
                  // ~25 years of accrued authority on that page transfers to us.
                  alternateName: [
                    "מודקו",
                    "Modaco — מודקו",
                    "מטבחי קובי",
                    "מטבחי קובי בית שמש",
                  ],
                  legalName: "Modaco",
                  foundingDate: "1985",
                  founder: { "@type": "Person", name: "קובי מויאל" },
                  url: "https://modaco.co.il",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://modaco.co.il/logo.png",
                    caption: "Modaco — מודקו",
                  },
                  image: [
                    "https://modaco.co.il/images/israelevitz/1-web.jpg",
                    "https://modaco.co.il/images/modaco/5F7A9697.webp",
                  ],
                  description:
                    "Modaco (מודקו) — למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית. צירי Blum, מסילות Movento, ידיות Domicile, ברזי Blanco ו-Delta, רגליים, מראות ומטבחי יוקרה בהתאמה אישית.",
                  telephone: "+972-52-680-4945",
                  email: "yarin@modaco.co.il",
                  priceRange: "₪₪",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "האומן 1",
                    addressLocality: "בית שמש",
                    postalCode: "9906101",
                    addressCountry: "IL",
                  },
                  contactPoint: [
                    {
                      "@type": "ContactPoint",
                      telephone: "+972-52-680-4945",
                      contactType: "Customer Service",
                      availableLanguage: ["Hebrew", "English"],
                      areaServed: "IL",
                    },
                    {
                      "@type": "ContactPoint",
                      telephone: "+972-52-680-4945",
                      contactType: "Sales",
                      availableLanguage: ["Hebrew", "English"],
                    },
                  ],
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
                      opens: "09:00",
                      closes: "18:00",
                    },
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: ["Friday"],
                      opens: "09:00",
                      closes: "13:00",
                    },
                  ],
                  // sameAs binds Google's "מודקו" / "Modaco" brand entity to every
                  // external profile we own. The Facebook page facebook.com/modaco2000
                  // ("מטבחי קובי | Bet Shemesh") is the original 25-year-old social
                  // presence — declaring it here is critical so Google merges its
                  // accrued authority into modaco.co.il instead of treating them as
                  // separate brands competing for the same query.
                  // Additional profiles (Instagram, Google Business, Wikidata, b144
                  // listing, etc) get added via NEXT_PUBLIC_SAMEAS_URLS env once Yarin
                  // sends them. We do NOT guess unknown URLs — invalid sameAs hurts.
                  sameAs: [
                    "https://wa.me/972526804945",
                    "https://www.facebook.com/modaco2000",
                    "https://he-il.facebook.com/modaco2000/",
                    ...(process.env.NEXT_PUBLIC_SAMEAS_URLS?.split(",")
                      .map((s) => s.trim())
                      .filter(Boolean) ?? []),
                  ],
                  knowsAbout: [
                    "פרזול לבית",
                    "פרזול מטבחים",
                    "ידיות לארונות",
                    "צירים",
                    "מסילות",
                    "מנגנוני הרמה",
                    "ברזי מטבח",
                    "אקססוריז לבית",
                    "מטבחים בהתאמה אישית",
                    "kitchen hardware",
                    "cabinet hinges",
                    "drawer slides",
                    "Blum",
                    "Domicile",
                    "Movento",
                  ],
                  brand: {
                    "@type": "Brand",
                    name: "Modaco",
                    alternateName: "מודקו",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://modaco.co.il/#website",
                  url: "https://modaco.co.il",
                  name: "Modaco — מודקו",
                  description: "פרזול ואקססוריז לבית — Modaco",
                  publisher: { "@id": "https://modaco.co.il/#organization" },
                  inLanguage: "he-IL",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://modaco.co.il/search?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Brand",
                  "@id": "https://modaco.co.il/#brand",
                  name: "Modaco",
                  alternateName: "מודקו",
                  url: "https://modaco.co.il",
                  logo: "https://modaco.co.il/logo.png",
                  description:
                    "Modaco (מודקו) — מותג ישראלי מוביל לפרזול ואקססוריז לבית, מאז 1985.",
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://modaco.co.il/#faq",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "מי זה מודקו?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "מודקו (Modaco) הוא מותג ישראלי מוביל בתחום הפרזול והאקססוריז לבית, פעיל מ-1985. החנות הראשית של מודקו נמצאת באומן 1, בית שמש, ומציעה פרזול של Blum, Domicile, Movento, Blanco ו-Delta — כולל מטבחי יוקרה בהתאמה אישית.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: 'האם מודקו זה אותו עסק כמו "מטבחי קובי"?',
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "כן. מטבחי קובי הוא השם המקורי של העסק על שם המייסד קובי מויאל, פעיל מ-1985 בבית שמש. עם הצטרפותו של ירין מויאל להובלת העסק והרחבת הפעילות לקטלוג פרזול ואקססוריז מלא, העסק עבר ל-מודקו (Modaco). אותם בעלים, אותו אולם תצוגה ברחוב האומן 1 בבית שמש, אותה מומחיות של 40+ שנה.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "איפה אולם התצוגה של מודקו?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "אולם התצוגה של מודקו נמצא ברחוב האומן 1 בבית שמש (מיקוד 9906101). פתוח ראשון עד חמישי 09:00–18:00, ושישי 09:00–13:00.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "אילו מותגים מוכרת מודקו?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "מודקו מוכרת את המותגים המובילים בעולם בתחום הפרזול ואקססוריז לבית: Blum (אוסטריה — צירים, מסילות Movento ו-Tandem, מנגנוני הרמה Aventos), Domicile (ידיות, אקססוריז לאמבטיה, מראות, פחים, רגליים, לוח גמיש לחיפוי FLEX CNC), Blanco ו-Delta (ברזי מטבח), ו-Floralis (אגרטלים ופריטי בית).",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "האם מודקו מייצרת מטבחים בהתאמה אישית?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "כן. מודקו מתכננת ומייצרת מטבחי יוקרה בהתאמה אישית מוחלטת, בליווי מקצועי מהשלב הראשון ועד ההתקנה. השילוב של נגרות איכותית עם פרזול מתקדם של Blum ו-Domicile מאפשר התאמה לכל חלל ולכל סגנון.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "האם מודקו נותנת הנחה לאדריכלים ואנשי מקצוע?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "כן. אדריכלים, מעצבים פנים, קבלנים ובעלי מקצוע נהנים מהנחה של 15% על כל הקטלוג של מודקו, בכפוף להרשמה כמשתמש B2B באתר.",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
