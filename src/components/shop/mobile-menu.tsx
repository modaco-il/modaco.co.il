"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  brand: string;
  img: string;
}

const items: NavItem[] = [
  { href: "/categories/hinges", label: "צירים", brand: "Blum", img: "/images/modaco/5F7A9761.webp" },
  { href: "/categories/slides", label: "מסילות", brand: "Movento", img: "/images/modaco/5F7A9286.webp" },
  { href: "/categories/lift-systems", label: "מנגנוני הרמה", brand: "Aventos", img: "/images/modaco/5F7A9411.webp" },
  { href: "/categories/accessories", label: "אקססוריז", brand: "Domicile", img: "/images/modaco/5F7A9697.webp" },
  { href: "/categories/aluminum", label: "אלומיניום וזכוכית", brand: "Profile 19", img: "/images/modaco/5F7A9450.webp" },
  { href: "/categories/carpentry", label: "נגרות", brand: "Modaco Premium", img: "/images/israelevitz/4-web.jpg" },
];

const secondaryItems = [
  { href: "/catalog", label: "הקטלוג המלא" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צרו קשר" },
  { href: "/search", label: "חיפוש" },
];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setActiveIdx(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Track finger/pointer over the nav and switch image accordingly
  const handlePointerMove = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY);
    const item = el?.closest("[data-idx]") as HTMLElement | null;
    if (item) {
      const idx = Number(item.getAttribute("data-idx"));
      if (!Number.isNaN(idx) && idx !== activeIdx) setActiveIdx(idx);
    }
  };

  return (
    <div
      className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-500 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop layer: ink + image (visible from open) + readable scrim */}
      <div className="absolute inset-0 bg-ink overflow-hidden">
        {items.map((item, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={item.img + i}
            src={item.img}
            alt=""
            aria-hidden
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              activeIdx === i ? "opacity-55" : "opacity-0"
            }`}
          />
        ))}
        {/* Readable scrim — keeps text area dark even with bright image */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,9,8,0.65) 0%, rgba(10,9,8,0.55) 30%, rgba(10,9,8,0.7) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full w-full flex flex-col" dir="rtl">
        <div className="h-20 flex-shrink-0" />

        {/* Categories */}
        <nav
          ref={navRef}
          className="flex-1 px-8 flex flex-col justify-start gap-1 overflow-y-auto"
          onTouchMove={(e) => {
            const t = e.touches[0];
            handlePointerMove(t.clientX, t.clientY);
          }}
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        >
          {items.map((item, i) => {
            const active = activeIdx === i;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-idx={i}
                onClick={onClose}
                className={`group flex items-baseline justify-between gap-4 py-3.5 border-b border-mocha-soft/15 transition-all duration-700 ${
                  open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{
                  transitionDelay: open ? `${140 + i * 55}ms` : "0ms",
                  borderBottomColor: "rgba(217, 195, 165, 0.15)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[10px] tracking-[0.3em] uppercase mb-1 font-medium"
                    style={{ color: "#D9C3A5" }}
                  >
                    <span style={{ opacity: 0.7 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="mx-2" style={{ opacity: 0.5 }}>/</span>
                    <span>{item.brand}</span>
                  </div>
                  <div
                    className="font-display font-bold text-3xl transition-colors"
                    style={{ color: active ? "#D9C3A5" : "#FAF6F0" }}
                  >
                    {item.label}
                  </div>
                </div>
                <span
                  className={`text-2xl flex-shrink-0 transition-all duration-300 ${
                    active ? "-translate-x-1" : "translate-x-0"
                  }`}
                  style={{
                    color: "#D9C3A5",
                    opacity: active ? 1 : 0.4,
                  }}
                  aria-hidden
                >
                  ←
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Secondary */}
        <div
          className={`px-8 pb-12 pt-6 transition-all duration-700 ${
            open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: open ? `${140 + items.length * 55 + 80}ms` : "0ms" }}
        >
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
            {secondaryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="text-sm tracking-wide"
                style={{ color: "rgba(250, 246, 240, 0.8)" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <a
            href="tel:0526804945"
            className="font-display text-2xl tracking-wide block"
            style={{ color: "#FAF6F0" }}
            dir="ltr"
          >
            052-680-4945
          </a>
        </div>
      </div>
    </div>
  );
}
