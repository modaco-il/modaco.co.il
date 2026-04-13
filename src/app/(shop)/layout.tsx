"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MobileMenu } from "@/components/shop/mobile-menu";

const navItems = [
  { href: "/categories/hinges", label: "צירים" },
  { href: "/categories/slides", label: "מסילות" },
  { href: "/categories/lift-systems", label: "מנגנוני הרמה" },
  { href: "/categories/accessories", label: "אקססוריז" },
  { href: "/categories/aluminum", label: "אלומיניום" },
  { href: "/categories/carpentry", label: "נגרות" },
  { href: "/catalog", label: "הקטלוג" },
  { href: "/about", label: "אודות" },
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
          <div className="flex items-center justify-between h-16 lg:h-20" dir="ltr">
            <Link href="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="Modaco"
                className={`h-9 lg:h-10 transition-all duration-300 ${logoFilter}`}
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-7" dir="rtl">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[13px] tracking-wide transition-colors ${linkColor}`}
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
                href="/contact"
                className={`transition-colors ${linkColor}`}
                aria-label="צרו קשר"
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
        </div>

      </header>

      {/* Mobile full-screen takeover */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />


      {/* Main — no top padding on hero pages (image goes under header), padding on others */}
      <main className={`flex-1 ${hasHero ? "" : "pt-16 lg:pt-20"}`}>{children}</main>

      {/* Footer */}
      <footer className="bg-ink text-cream mt-32" dir="rtl">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            <div className="lg:col-span-5">
              <img src="/logo.png" alt="Modaco" className="h-10 mb-6 invert opacity-95" />
              <p className="text-sm text-cream leading-loose max-w-md font-light">
                למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית.
                המותגים המובילים בעולם, בקפידה אישית — ישירות אליכם.
              </p>
            </div>
            <div className="lg:col-span-3">
              <div className="eyebrow text-mocha-soft mb-5">קטגוריות</div>
              <ul className="space-y-3 text-sm text-cream font-light">
                <li><Link href="/categories/hinges" className="hover:text-mocha-soft transition-colors">צירים</Link></li>
                <li><Link href="/categories/slides" className="hover:text-mocha-soft transition-colors">מסילות</Link></li>
                <li><Link href="/categories/accessories" className="hover:text-mocha-soft transition-colors">אקססוריז</Link></li>
                <li><Link href="/categories/aluminum" className="hover:text-mocha-soft transition-colors">אלומיניום</Link></li>
                <li><Link href="/categories/carpentry" className="hover:text-mocha-soft transition-colors">נגרות</Link></li>
              </ul>
            </div>
            <div className="lg:col-span-4">
              <div className="eyebrow text-mocha-soft mb-5">צרו קשר</div>
              <ul className="space-y-3 text-sm text-cream font-light">
                <li>
                  <a href="tel:0526804945" className="hover:text-mocha-soft transition-colors text-base" dir="ltr">
                    052-680-4945
                  </a>
                </li>
                <li>
                  <a href="mailto:info@modaco.co.il" className="hover:text-mocha-soft transition-colors">
                    info@modaco.co.il
                  </a>
                </li>
                <li><Link href="/about" className="hover:text-mocha-soft transition-colors">אודות</Link></li>
                <li><Link href="/contact" className="hover:text-mocha-soft transition-colors">יצירת קשר</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cream/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-cream font-light">
            <div>&copy; {new Date().getFullYear()} Modaco. כל הזכויות שמורות.</div>
            <div dir="ltr">
              Crafted by{" "}
              <a href="https://ozkabala.com" target="_blank" rel="noopener noreferrer" className="hover:text-mocha-soft transition-colors">
                Oz Kabala
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
