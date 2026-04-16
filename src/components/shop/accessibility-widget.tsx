"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "modaco-a11y-prefs";

interface A11yPrefs {
  fontSize: number; // 1 = default
  contrast: "normal" | "high" | "dark";
  highlightLinks: boolean;
  reduceMotion: boolean;
  bigCursor: boolean;
  readableFont: boolean;
}

const defaultPrefs: A11yPrefs = {
  fontSize: 1,
  contrast: "normal",
  highlightLinks: false,
  reduceMotion: false,
  bigCursor: false,
  readableFont: false,
};

function apply(p: A11yPrefs) {
  const root = document.documentElement;
  root.style.fontSize = `${p.fontSize * 16}px`;

  root.classList.toggle("a11y-contrast-high", p.contrast === "high");
  root.classList.toggle("a11y-contrast-dark", p.contrast === "dark");
  root.classList.toggle("a11y-highlight-links", p.highlightLinks);
  root.classList.toggle("a11y-reduce-motion", p.reduceMotion);
  root.classList.toggle("a11y-big-cursor", p.bigCursor);
  root.classList.toggle("a11y-readable-font", p.readableFont);
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(defaultPrefs);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...defaultPrefs, ...JSON.parse(raw) };
        setPrefs(parsed);
        apply(parsed);
      }
    } catch {}
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const update = (updates: Partial<A11yPrefs>) => {
    const next = { ...prefs, ...updates };
    setPrefs(next);
    apply(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const reset = () => {
    setPrefs(defaultPrefs);
    apply(defaultPrefs);
    document.documentElement.style.fontSize = "";
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="תפריט נגישות"
        className="fixed bottom-5 right-5 lg:bottom-8 lg:right-8 z-40 w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        style={{ background: "#0A0908", color: "#FAF6F0" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="12" cy="4" r="2" />
          <path d="M12 8c-3 0-6 .5-6 1.5v.5h3v10c0 1 1 1 1 1s1 0 1-1v-5h2v5c0 1 1 1 1 1s1 0 1-1V10h3v-.5c0-1-3-1.5-6-1.5z" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-ink/50 z-40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed bottom-0 right-0 left-0 lg:bottom-8 lg:right-8 lg:left-auto lg:w-[420px] z-50 bg-cream border border-bone shadow-2xl max-h-[85vh] overflow-y-auto"
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-label="הגדרות נגישות"
          >
            <div className="flex items-center justify-between p-5 border-b border-bone sticky top-0 bg-cream">
              <div>
                <div className="eyebrow">נגישות</div>
                <h2 className="font-display font-bold text-lg text-ink mt-1">התאמה אישית</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-ink-soft hover:text-ink text-2xl leading-none p-1"
                aria-label="סגירה"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-5">
              <Control label="גודל טקסט">
                <div className="flex gap-2">
                  <A11yButton onClick={() => update({ fontSize: Math.max(0.85, prefs.fontSize - 0.1) })} aria-label="הקטנה">
                    −
                  </A11yButton>
                  <div className="flex-1 flex items-center justify-center text-sm font-medium">
                    {Math.round(prefs.fontSize * 100)}%
                  </div>
                  <A11yButton onClick={() => update({ fontSize: Math.min(1.5, prefs.fontSize + 0.1) })} aria-label="הגדלה">
                    +
                  </A11yButton>
                </div>
              </Control>

              <Control label="ניגודיות">
                <div className="grid grid-cols-3 gap-2">
                  <Chip active={prefs.contrast === "normal"} onClick={() => update({ contrast: "normal" })}>רגיל</Chip>
                  <Chip active={prefs.contrast === "high"} onClick={() => update({ contrast: "high" })}>גבוהה</Chip>
                  <Chip active={prefs.contrast === "dark"} onClick={() => update({ contrast: "dark" })}>חשוך</Chip>
                </div>
              </Control>

              <Toggle
                label="הבלטת קישורים"
                description="קישורים יוצגו בקו תחתון וצבע מודגש"
                checked={prefs.highlightLinks}
                onChange={(v) => update({ highlightLinks: v })}
              />
              <Toggle
                label="ללא אנימציות"
                description="עצירת כל התנועה והמעברים"
                checked={prefs.reduceMotion}
                onChange={(v) => update({ reduceMotion: v })}
              />
              <Toggle
                label="סמן עכבר גדול"
                description="מגדיל את הסמן לזיהוי קל"
                checked={prefs.bigCursor}
                onChange={(v) => update({ bigCursor: v })}
              />
              <Toggle
                label="פונט קריא"
                description="החלפה לפונט ברור וקריא יותר"
                checked={prefs.readableFont}
                onChange={(v) => update({ readableFont: v })}
              />
            </div>

            <div className="p-5 border-t border-bone bg-cream-deep">
              <button
                onClick={reset}
                className="w-full h-10 text-sm text-ink-soft hover:text-ink border border-bone hover:border-ink transition-colors mb-3"
              >
                איפוס להגדרות ברירת מחדל
              </button>
              <Link
                href="/accessibility"
                className="block w-full h-10 leading-[2.5rem] text-center text-xs tracking-[0.25em] uppercase text-mocha hover:text-mocha-hover"
                onClick={() => setOpen(false)}
              >
                להצהרת הנגישות המלאה →
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">{label}</div>
      {children}
    </div>
  );
}

function A11yButton({ onClick, children, ...rest }: { onClick: () => void; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 flex items-center justify-center bg-cream-deep border border-bone hover:border-ink transition-colors text-lg"
      {...rest}
    >
      {children}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="h-10 text-sm transition-colors"
      style={{
        background: active ? "#0A0908" : "#F2EBDD",
        color: active ? "#FAF6F0" : "#0A0908",
        border: "1px solid #E8DFCC",
      }}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative shrink-0 mt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className="w-10 h-6 rounded-full transition-colors"
          style={{ background: checked ? "#0A0908" : "#D9D2C1" }}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full transition-all"
            style={{
              background: "#FAF6F0",
              right: checked ? "calc(100% - 1.25rem)" : "0.25rem",
            }}
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="font-medium text-ink">{label}</div>
        <div className="text-xs text-ink-soft font-light mt-0.5">{description}</div>
      </div>
    </label>
  );
}
