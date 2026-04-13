"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already in viewport on mount, reveal immediately with delay
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }

    // Otherwise wait until scrolled into view
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);

    // Failsafe: reveal after 1.5s no matter what (e.g. SSR snapshot)
    const fallback = setTimeout(() => setVisible(true), 1500);
    return () => {
      obs.disconnect();
      clearTimeout(fallback);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[800ms] ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}
