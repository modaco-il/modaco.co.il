import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://modaco.co.il"),
  title: {
    default: "Modaco — מודקו — פרזול ואקססוריז לבית",
    template: "%s | Modaco — מודקו",
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
                  alternateName: ["מודקו", "Modaco — מודקו"],
                  legalName: "Modaco",
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
                  sameAs: ["https://wa.me/972526804945"],
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
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
      </body>
    </html>
  );
}
