"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/categories/hinges", label: "צירים" },
  { href: "/categories/slides", label: "מסילות" },
  { href: "/categories/lift-systems", label: "מנגנוני הרמה" },
  { href: "/categories/accessories", label: "אקססוריז" },
  { href: "/categories/aluminum", label: "אלומיניום" },
  { href: "/categories/carpentry", label: "נגרות" },
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

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-bone">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20 lg:h-24" dir="ltr">
            <Link href="/" className="flex-shrink-0">
              <img src="/logo.png" alt="Modaco" className="h-10 lg:h-11" />
            </Link>

            <nav className="hidden lg:flex items-center gap-9" dir="rtl">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[13px] tracking-wide text-ink-soft hover:text-mocha transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-5">
              <Link
                href="/search"
                className="text-ink-soft hover:text-mocha transition-colors hidden lg:block"
                aria-label="חיפוש"
              >
                <SearchIcon />
              </Link>
              <Link
                href="/contact"
                className="text-ink-soft hover:text-mocha transition-colors"
                aria-label="צרו קשר"
              >
                <UserIcon />
              </Link>
              <button
                className="lg:hidden text-ink-soft hover:text-mocha transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="תפריט"
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-bone bg-cream" dir="rtl">
            <div className="px-6 py-4 border-b border-bone">
              <form action="/search" method="GET" className="relative">
                <input
                  type="text"
                  name="q"
                  placeholder="חיפוש..."
                  className="w-full bg-cream-deep text-ink placeholder:text-ink-soft/50 rounded-sm px-4 py-3 pr-10 text-sm outline-none focus:ring-1 focus:ring-mocha"
                />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/60" />
              </form>
            </div>
            <nav className="px-6 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-3 text-ink-soft hover:text-mocha transition-colors border-b border-bone last:border-0"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="block py-3 text-ink-soft hover:text-mocha transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                צרו קשר
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-ink text-cream mt-32" dir="rtl">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            <div className="lg:col-span-5">
              <img src="/logo.png" alt="Modaco" className="h-10 mb-6 invert opacity-95" />
              <p className="text-sm text-cream/60 leading-loose max-w-md font-light">
                למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית.
                המותגים המובילים בעולם, בקפידה אישית — ישירות אליכם.
              </p>
            </div>
            <div className="lg:col-span-3">
              <div className="eyebrow text-mocha-soft mb-5">קטגוריות</div>
              <ul className="space-y-3 text-sm text-cream/70 font-light">
                <li><Link href="/categories/hinges" className="hover:text-mocha-soft transition-colors">צירים</Link></li>
                <li><Link href="/categories/slides" className="hover:text-mocha-soft transition-colors">מסילות</Link></li>
                <li><Link href="/categories/accessories" className="hover:text-mocha-soft transition-colors">אקססוריז</Link></li>
                <li><Link href="/categories/aluminum" className="hover:text-mocha-soft transition-colors">אלומיניום</Link></li>
                <li><Link href="/categories/carpentry" className="hover:text-mocha-soft transition-colors">נגרות</Link></li>
              </ul>
            </div>
            <div className="lg:col-span-4">
              <div className="eyebrow text-mocha-soft mb-5">צרו קשר</div>
              <ul className="space-y-3 text-sm text-cream/70 font-light">
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
          <div className="border-t border-cream/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-cream/40 font-light">
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
