"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MobileMenu } from "@/components/shop/mobile-menu";
import { CookieConsent } from "@/components/shop/cookie-consent";
import { AccessibilityWidget } from "@/components/shop/accessibility-widget";
import { CategoryRail } from "@/components/shop/category-rail";
import { CATEGORIES } from "@/lib/categories";

const utilityItems = [
  { href: "/catalog", label: "הקטלוג" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צרו קשר" },
];

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const HERO_PATHS = ["/", "/categories/aluminum", "/categories/carpentry"];

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const hasHero = HERO_PATHS.includes(pathname || "/");
  const transparent = (hasHero && !scrolled) || menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dynamic mobile theme-color — black over hero image, cream elsewhere
  useEffect(() => {
    const color = transparent ? "#0A0908" : "#FAF6F0";
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = color;
  }, [transparent]);

  const headerBg = transparent
    ? "bg-transparent border-transparent"
    : "bg-cream/95 backdrop-blur-md border-bone";
  const linkColor = transparent
    ? "text-cream hover:text-mocha-soft"
    : "text-ink-soft hover:text-mocha";
  const logoFilter = transparent ? "invert" : "";

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${headerBg}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Main row: logo + icons (+ utility links desktop) */}
          <div className="flex items-center justify-between h-16 lg:h-18" dir="ltr">
            <Link href="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="Modaco"
                className={`h-9 lg:h-10 transition-all duration-300 ${logoFilter}`}
              />
            </Link>

            {/* Utility links — desktop only, centered */}
            <nav className="hidden lg:flex items-center gap-6" dir="rtl">
              {utilityItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[11px] tracking-[0.25em] uppercase transition-colors ${linkColor}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-5">
              <Link
                href="/search"
                className={`hidden lg:block transition-colors ${linkColor}`}
                aria-label="חיפוש"
              >
                <SearchIcon />
              </Link>
              <Link
                href="/login"
                className={`transition-colors ${linkColor}`}
                aria-label="הרשמה / התחברות"
              >
                <UserIcon />
              </Link>
              <button
                className={`lg:hidden transition-colors ${linkColor}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="תפריט"
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>

          {/* Categories row — desktop only */}
          <nav
            className={`hidden lg:flex items-center justify-center gap-7 h-11 border-t transition-colors duration-300 ${
              transparent ? "border-cream/10" : "border-bone"
            }`}
            dir="rtl"
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={`text-[13px] tracking-wide transition-colors ${linkColor}`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>

      </header>

      {/* Mobile full-screen takeover */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Legal + Accessibility */}
      <CookieConsent />
      <AccessibilityWidget />

      {/* Persistent category rail — desktop only, transparent over hero */}
      <CategoryRail transparent={transparent} />


      {/* Main — no top padding on hero pages (image goes under header), padding on others */}
      <main className={`flex-1 ${hasHero ? "" : "pt-16 lg:pt-[116px]"}`}>{children}</main>

      {/* Footer */}
      <footer className="bg-ink text-cream mt-32" dir="rtl">
        {/* Editorial brand statement */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-24 lg:pt-28 pb-16 border-b border-cream/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
            <div className="lg:col-span-7">
              <div
                className="text-[11px] tracking-[0.32em] uppercase font-medium mb-6"
                style={{ color: "#D9C3A5" }}
              >
                Modaco — מודקו · מאז 1985
              </div>
              <h2 className="font-display text-3xl lg:text-5xl text-cream leading-[1.1] mb-8">
                פרזול שעובד קשה.<br />
                <span className="font-display-light text-mocha-soft">אסתטיקה שנשארת.</span>
              </h2>
              <p className="text-cream/80 leading-loose font-light text-base lg:text-lg max-w-2xl">
                למעלה מ-40 שנה אנו מביאים את המותגים המובילים בעולם — Blum, Domicile, Movento, Blanco, Delta — לבית, למטבח ולכל חלל שמגיע לו את הטוב ביותר. אולם תצוגה רחב בבית שמש, ייצור מטבחי יוקרה בהתאמה אישית, וקטלוג מלא של פרזול לבית, אקססוריז וחיפויים מעוצבים.
              </p>
            </div>

            {/* Showroom card */}
            <div className="lg:col-span-5 lg:col-start-8">
              <div className="bg-cream/[0.04] border border-cream/10 p-8 lg:p-10">
                <div
                  className="text-[10px] tracking-[0.32em] uppercase font-medium mb-5"
                  style={{ color: "#D9C3A5" }}
                >
                  אולם תצוגה
                </div>
                <div className="font-display text-2xl lg:text-3xl text-cream mb-2 leading-snug">
                  האומן 1, בית שמש
                </div>
                <div className="text-sm text-cream/60 mb-6 font-light">
                  מיקוד 9906101
                </div>
                <div className="space-y-1 text-sm text-cream/80 font-light mb-6">
                  <div className="flex justify-between">
                    <span>ראשון – חמישי</span>
                    <span dir="ltr">09:00 – 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>שישי</span>
                    <span dir="ltr">09:00 – 13:00</span>
                  </div>
                </div>
                <a
                  href="https://waze.com/ul?q=האומן%201%20בית%20שמש&navigate=yes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-mocha-soft border-b border-mocha-soft/40 pb-1 hover:border-mocha-soft transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  ניווט ב-Waze
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation columns */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Categories — split to 2 visual columns on lg */}
            <div className="col-span-2 lg:col-span-7">
              <div className="eyebrow text-mocha-soft mb-6">הקולקציה</div>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-cream/85 font-light">
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="hover:text-mocha-soft transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div className="lg:col-span-2">
              <div className="eyebrow text-mocha-soft mb-6">ניווט</div>
              <ul className="space-y-3 text-sm text-cream/85 font-light">
                <li><Link href="/catalog" className="hover:text-mocha-soft transition-colors">הקטלוג</Link></li>
                <li><Link href="/about" className="hover:text-mocha-soft transition-colors">אודות</Link></li>
                <li><Link href="/contact" className="hover:text-mocha-soft transition-colors">יצירת קשר</Link></li>
                <li><Link href="/login" className="hover:text-mocha-soft transition-colors">איזור אישי</Link></li>
                <li><Link href="/register" className="hover:text-mocha-soft transition-colors">הרשמה</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <div className="eyebrow text-mocha-soft mb-6">צרו קשר</div>
              <ul className="space-y-4 text-sm text-cream/85 font-light">
                <li>
                  <a
                    href="https://wa.me/972526804945"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-mocha-soft transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="tel:0526804945"
                    className="hover:text-mocha-soft transition-colors inline-block font-display text-lg text-cream"
                    dir="ltr"
                  >
                    052-680-4945
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:yarin@modaco.co.il"
                    className="hover:text-mocha-soft transition-colors inline-block break-all"
                    dir="ltr"
                  >
                    yarin@modaco.co.il
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal + signature */}
        <div className="border-t border-cream/10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] tracking-wider text-cream/50 font-light">
              <span>&copy; {new Date().getFullYear()} Modaco · כל הזכויות שמורות</span>
              <span className="opacity-30">·</span>
              <Link href="/terms" className="hover:text-mocha-soft transition-colors">תנאי שימוש</Link>
              <span className="opacity-30">·</span>
              <Link href="/privacy" className="hover:text-mocha-soft transition-colors">מדיניות פרטיות</Link>
              <span className="opacity-30">·</span>
              <Link href="/accessibility" className="hover:text-mocha-soft transition-colors">הצהרת נגישות</Link>
              <span className="opacity-30">·</span>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem("modaco-cookie-consent");
                    window.location.reload();
                  } catch {}
                }}
                className="hover:text-mocha-soft transition-colors"
              >
                עוגיות
              </button>
            </div>
            <a
              href="https://ozkabala.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-40 hover:opacity-70 transition-opacity self-center lg:self-auto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ozkabala-logo.svg" alt="Oz Kabala" className="h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
