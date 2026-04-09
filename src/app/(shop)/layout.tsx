"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/", label: "ראשי" },
  { href: "/categories/hinges", label: "צירים" },
  { href: "/categories/slides", label: "מסילות" },
  { href: "/categories/faucets", label: "ברזי מטבח" },
  { href: "/categories/handles", label: "ידיות" },
  { href: "/categories/accessories", label: "אקססוריז" },
  { href: "/categories/lift-systems", label: "מנגנוני הרמה" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צרו קשר" },
];

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20" dir="ltr">
            {/* Logo — always on the left */}
            <Link href="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="Modaco"
                className="h-10 lg:h-12 invert"
              />
            </Link>

            {/* Desktop nav — center */}
            <nav className="hidden lg:flex items-center gap-8" dir="rtl">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side icons */}
            <div className="flex items-center gap-4">
              {/* User icon — no circle */}
              <Link
                href="/login"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <UserIcon />
              </Link>

              {/* Hamburger — mobile only */}
              <button
                className="lg:hidden text-gray-400 hover:text-white transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-800 bg-black" dir="rtl">
            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-800">
              <form action="/search" method="GET" className="relative">
                <input
                  type="text"
                  name="q"
                  placeholder="חיפוש מוצרים, קטגוריות, מותגים..."
                  className="w-full bg-gray-900 text-white placeholder-gray-500 rounded-sm px-4 py-3 pr-10 text-sm outline-none focus:ring-1 focus:ring-gray-700"
                />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </form>
            </div>

            {/* Nav links */}
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-3 text-gray-300 hover:text-white transition-colors border-b border-gray-900 last:border-0"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src="/logo.png" alt="Modaco" className="h-10 invert mb-4" />
              <p className="text-sm text-gray-500 leading-relaxed">
                למעלה מ-40 שנה של מומחיות בפרזול ואקססוריז לבית.
                המותגים המובילים בעולם, ישירות אליכם.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-4 text-gray-300">קטגוריות</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/categories/hinges" className="hover:text-white">צירים</Link></li>
                <li><Link href="/categories/slides" className="hover:text-white">מסילות</Link></li>
                <li><Link href="/categories/faucets" className="hover:text-white">ברזי מטבח</Link></li>
                <li><Link href="/categories/handles" className="hover:text-white">ידיות</Link></li>
                <li><Link href="/categories/accessories" className="hover:text-white">אקססוריז לבית</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-4 text-gray-300">צרו קשר</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="tel:0526804945" className="hover:text-white">
                    052-680-4945
                  </a>
                </li>
                <li><Link href="/about" className="hover:text-white">אודות</Link></li>
                <li><Link href="/contact" className="hover:text-white">יצירת קשר</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-600 space-y-1">
            <div>&copy; {new Date().getFullYear()} Modaco. כל הזכויות שמורות.</div>
            <div dir="ltr">
              Built by{" "}
              <a href="https://ozkabala.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors underline underline-offset-2">
                Oz Kabala
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
