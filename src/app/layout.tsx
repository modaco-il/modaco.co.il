import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://modaco.co.il"),
  title: {
    default: "Modaco — פרזול ואקססוריז לבית",
    template: "%s | Modaco",
  },
  description:
    "למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית. צירים, מסילות, ידיות, ברזי מטבח ואקססוריז מהמותגים המובילים בעולם.",
  openGraph: {
    title: "Modaco — פרזול ואקססוריז לבית",
    description:
      "המותגים המובילים בעולם — Blum, Domicile, Movento. קטלוג פרזול מלא, מטבחי יוקרה בהתאמה אישית.",
    url: "https://modaco.co.il",
    siteName: "Modaco",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "/images/israelevitz/1-web.jpg",
        width: 2000,
        height: 1333,
        alt: "Modaco",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Modaco — פרזול ואקססוריז לבית",
    description: "המותגים המובילים בעולם. קטלוג פרזול מלא ומטבחי יוקרה.",
  },
  robots: {
    index: true,
    follow: true,
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
              "@type": "Organization",
              name: "Modaco",
              alternateName: "מודקו",
              url: "https://modaco.co.il",
              logo: "https://modaco.co.il/logo.png",
              image: "https://modaco.co.il/images/israelevitz/1-web.jpg",
              description:
                "למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית. צירים, מסילות, ידיות, ברזי מטבח ומטבחי יוקרה בהתאמה אישית.",
              telephone: "+972-52-680-4945",
              email: "yarin@modaco.co.il",
              address: {
                "@type": "PostalAddress",
                addressCountry: "IL",
                addressLocality: "ישראל",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+972-52-680-4945",
                contactType: "Customer Service",
                availableLanguage: ["Hebrew", "English"],
              },
              sameAs: ["https://wa.me/972526804945"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Modaco",
              url: "https://modaco.co.il",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://modaco.co.il/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
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
