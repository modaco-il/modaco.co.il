import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modaco — פרזול ואקססוריז לבית",
  description:
    "למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית. צירים, מסילות, ידיות, ברזי מטבח ואקססוריז מהמותגים המובילים בעולם.",
};

// Set to false to show the full site
const COMING_SOON = true;

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
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "'Heebo', sans-serif" }}
      >
        {COMING_SOON ? <ComingSoon /> : children}
      </body>
    </html>
  );
}

function ComingSoon() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-lg">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Modaco"
          className="h-24 mx-auto mb-4 invert"
        />
        <div className="text-gray-400 text-sm tracking-[0.3em] uppercase mb-12">
          פרזול ואקססוריז לבית
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-gray-700 mx-auto mb-12" />

        {/* Coming soon */}
        <h2 className="text-2xl text-white font-light mb-4">
          האתר החדש שלנו בדרך
        </h2>
        <p className="text-gray-400 leading-relaxed mb-12">
          למעלה מ-40 שנה של מומחיות בפרזול, מטבחי יוקרה ואקססוריז לבית.
          <br />
          המוצרים המובילים בעולם, בקרוב גם אונליין.
        </p>

        {/* Contact */}
        <div className="space-y-3">
          <a
            href="tel:0526804945"
            className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition-colors text-lg"
          >
            052-680-4945
          </a>
          <div className="text-gray-500 text-sm">
            לפרטים נוספים צרו קשר
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-gray-600 text-xs">
        &copy; {new Date().getFullYear()} Modaco. כל הזכויות שמורות.
      </div>
    </div>
  );
}
