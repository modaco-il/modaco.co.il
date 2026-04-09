import Link from "next/link";

const navItems = [
  { href: "/", label: "ראשי" },
  { href: "/categories/hinges", label: "צירים" },
  { href: "/categories/slides", label: "מסילות" },
  { href: "/categories/faucets", label: "ברזי מטבח" },
  { href: "/categories/handles", label: "ידיות" },
  { href: "/categories/accessories", label: "אקססוריז" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צרו קשר" },
];

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo — left side (in RTL this appears on the right visually, so we use flex-row-reverse) */}
            <Link href="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="Modaco"
                className="h-12 invert"
              />
            </Link>

            {/* Nav — center */}
            <nav className="hidden lg:flex items-center gap-8">
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

            {/* User icon — right side */}
            <Link
              href="/login"
              className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto">
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
