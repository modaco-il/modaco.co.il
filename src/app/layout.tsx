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
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
      </body>
    </html>
  );
}
