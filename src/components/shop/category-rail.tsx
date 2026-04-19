"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export function CategoryRail({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname() || "";
  const textBase = transparent
    ? "text-cream/75 hover:text-cream"
    : "text-ink-soft/70 hover:text-mocha";
  const activeColor = transparent ? "text-cream" : "text-mocha";
  const indicator = transparent ? "bg-cream" : "bg-mocha";

  return (
    <aside
      aria-label="קטגוריות"
      className="hidden lg:flex fixed top-1/2 -translate-y-1/2 right-3 xl:right-5 z-30 flex-col gap-0.5 pointer-events-auto"
      dir="rtl"
    >
      {CATEGORIES.map((cat) => {
        const href = `/categories/${cat.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={cat.slug}
            href={href}
            className={`group relative flex items-center gap-2 py-1.5 pr-2 pl-3 text-[11px] tracking-[0.12em] transition-colors ${
              active ? activeColor : textBase
            }`}
          >
            <span
              className={`inline-block h-px transition-all duration-300 ${indicator} ${
                active
                  ? "w-5 opacity-100"
                  : "w-2 opacity-40 group-hover:w-4 group-hover:opacity-80"
              }`}
              aria-hidden
            />
            <span className="whitespace-nowrap">{cat.name}</span>
          </Link>
        );
      })}
    </aside>
  );
}
