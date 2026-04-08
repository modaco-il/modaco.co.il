import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modaco — פרזול ואקססוריז לבית",
  description:
    "למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית. צירים, מסילות, ידיות, ברזי מטבח ואקססוריז מהמותגים המובילים בעולם.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Heebo', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
