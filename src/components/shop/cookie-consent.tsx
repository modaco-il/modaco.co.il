"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "modaco-cookie-consent";
const STORAGE_VERSION = "v1";

interface ConsentState {
  version: string;
  timestamp: number;
  essential: true; // always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    version: STORAGE_VERSION,
    timestamp: 0,
    essential: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setVisible(true);
        return;
      }
      const parsed = JSON.parse(raw) as ConsentState;
      if (parsed.version !== STORAGE_VERSION) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (state: ConsentState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setVisible(false);
    setSettingsOpen(false);
  };

  const acceptAll = () => {
    save({
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptEssentialOnly = () => {
    save({
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const savePreferences = () => {
    save({ ...consent, timestamp: Date.now() });
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pt-6 lg:p-6"
      role="dialog"
      aria-modal="false"
      aria-label="הסכמת עוגיות"
      dir="rtl"
    >
      <div
        className="max-w-[1400px] mx-auto rounded-sm border border-bone shadow-2xl overflow-hidden"
        style={{ background: "#FAF6F0" }}
      >
        {!settingsOpen ? (
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="eyebrow mb-3">עוגיות · Cookies</div>
                <h2 className="font-display font-bold text-xl lg:text-2xl text-ink mb-2 leading-snug">
                  אנחנו מכבדים את הפרטיות שלכם
                </h2>
                <p className="text-sm text-ink-soft font-light leading-relaxed">
                  האתר משתמש בעוגיות הכרחיות להפעלתו, ובעוגיות נוספות — אנליטיות ושיווקיות — שיופעלו רק בהסכמתכם.
                  ניתן לשנות את ההגדרות בכל עת.{" "}
                  <Link href="/privacy" className="text-mocha underline">
                    למדיניות הפרטיות המלאה
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-wrap gap-2 lg:flex-col lg:w-56">
                <button
                  onClick={acceptAll}
                  className="flex-1 lg:flex-initial h-11 px-6 text-sm tracking-wide transition-colors"
                  style={{ background: "#0A0908", color: "#FAF6F0" }}
                >
                  אישור הכל
                </button>
                <button
                  onClick={acceptEssentialOnly}
                  className="flex-1 lg:flex-initial h-11 px-6 text-sm tracking-wide transition-all"
                  style={{
                    border: "1px solid #0A0908",
                    color: "#0A0908",
                    background: "transparent",
                  }}
                >
                  רק הכרחי
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="flex-1 lg:flex-initial h-11 px-6 text-xs tracking-[0.2em] uppercase text-mocha hover:text-mocha-hover transition-colors"
                >
                  הגדרות מפורטות
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 lg:p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="eyebrow mb-2">הגדרות עוגיות</div>
                <h2 className="font-display font-bold text-xl lg:text-2xl text-ink">
                  בחרו למה אתם מסכימים
                </h2>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-ink-soft hover:text-ink text-2xl leading-none"
                aria-label="סגירה"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <CookieRow
                title="עוגיות הכרחיות"
                description="נחוצות להפעלת האתר — סשן, סל קניות, אבטחה. לא ניתן לכבות."
                checked={true}
                disabled={true}
                onChange={() => {}}
              />
              <CookieRow
                title="עוגיות פונקציונליות"
                description="זיכרון העדפות (מצב תצוגה, שפה, העדפות נגישות) לשיפור חוויית השימוש."
                checked={consent.functional}
                onChange={(v) => setConsent({ ...consent, functional: v })}
              />
              <CookieRow
                title="עוגיות אנליטיות"
                description="מדידת תנועה מצטברת באתר, לתיקון תקלות ושיפור האתר. ללא זיהוי אישי."
                checked={consent.analytics}
                onChange={(v) => setConsent({ ...consent, analytics: v })}
              />
              <CookieRow
                title="עוגיות שיווקיות"
                description="התאמה אישית של מודעות ובחירת תוכן רלוונטי. לא מופעלות ללא הסכמה מפורשת."
                checked={consent.marketing}
                onChange={(v) => setConsent({ ...consent, marketing: v })}
              />
            </div>

            <div className="mt-8 flex gap-3 flex-wrap">
              <button
                onClick={savePreferences}
                className="flex-1 lg:flex-initial h-11 px-8 text-sm tracking-wide"
                style={{ background: "#0A0908", color: "#FAF6F0" }}
              >
                שמור העדפות
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 lg:flex-initial h-11 px-8 text-sm tracking-wide"
                style={{ border: "1px solid #0A0908", color: "#0A0908" }}
              >
                אישור הכל
              </button>
            </div>

            <p className="text-xs text-ink-soft mt-6 leading-relaxed">
              ניתן לעדכן את ההעדפות בכל עת דרך הקישור &quot;עוגיות&quot; בפוטר.
              ההעדפות שמורות ב-localStorage של הדפדפן שלכם ולא משותפות עם אף צד שלישי.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CookieRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-4 p-4 border border-bone rounded-sm cursor-pointer transition-colors ${
        disabled ? "opacity-70 cursor-not-allowed" : "hover:border-mocha"
      }`}
    >
      <div className="relative shrink-0 mt-1">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className="w-10 h-6 rounded-full transition-colors"
          style={{ background: checked ? "#0A0908" : "#D9D2C1" }}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full transition-transform"
            style={{
              background: "#FAF6F0",
              right: checked ? "calc(100% - 1.25rem)" : "0.25rem",
            }}
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="font-bold text-ink">{title}</div>
        <div className="text-sm text-ink-soft font-light mt-0.5">{description}</div>
      </div>
    </label>
  );
}
