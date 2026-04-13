"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  brand: string;
  img: string;
}

const items: NavItem[] = [
  { href: "/categories/hinges", label: "צירים", brand: "Blum", img: "/images/israelevitz/3-web.jpg" },
  { href: "/categories/slides", label: "מסילות", brand: "Movento", img: "/images/israelevitz/2-web.jpg" },
  { href: "/categories/lift-systems", label: "מנגנוני הרמה", brand: "Aventos", img: "/images/israelevitz/1-web.jpg" },
  { href: "/categories/accessories", label: "אקססוריז", brand: "Domicile", img: "/images/israelevitz/3-web.jpg" },
  { href: "/categories/aluminum", label: "אלומיניום וזכוכית", brand: "Profile 19", img: "/images/israelevitz/2-web.jpg" },
  { href: "/categories/carpentry", label: "נגרות", brand: "Modaco Premium", img: "/images/israelevitz/4-web.jpg" },
];

const secondaryItems = [
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צרו קשר" },
  { href: "/search", label: "חיפוש" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeImg, setActiveImg] = useState<string | null>(null);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setActiveImg(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`lg:hidden fixed inset-0 z-40 transition-all duration-500 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop image — fades in based on hovered item */}
      <div className="absolute inset-0 bg-ink overflow-hidden">
        {items.map((item) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={item.img}
            src={item.img}
            alt=""
            aria-hidden
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              activeImg === item.img ? "opacity-25" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/60 to-ink" />
      </div>

      {/* Content */}
      <div className="relative h-full w-full flex flex-col" dir="rtl">
        <div className="h-16 flex-shrink-0" />

        {/* Categories */}
        <nav className="flex-1 px-8 flex flex-col justify-center gap-1">
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              onTouchStart={() => setActiveImg(item.img)}
              onMouseEnter={() => setActiveImg(item.img)}
              onMouseLeave={() => setActiveImg(null)}
              className={`group block py-3 transition-all duration-700 ${
                open
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
            >
              <div className="text-[10px] tracking-[0.32em] uppercase text-mocha-soft mb-1">
                {item.brand}
              </div>
              <div className="font-display font-bold text-3xl text-cream group-active:text-mocha-soft transition-colors">
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Secondary */}
        <div
          className={`px-8 pb-12 pt-8 border-t border-cream/15 transition-all duration-700 ${
            open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: open ? `${120 + items.length * 60 + 80}ms` : "0ms" }}
        >
          <div className="flex flex-wrap gap-x-8 gap-y-3 mb-6">
            {secondaryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="text-sm text-cream/70 hover:text-mocha-soft tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <a
            href="tel:0526804945"
            className="font-display text-2xl text-cream tracking-wide"
            dir="ltr"
          >
            052-680-4945
          </a>
        </div>
      </div>
    </div>
  );
}
