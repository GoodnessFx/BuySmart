import { useCallback, useEffect, useState } from "react";
import { gold } from "./layout";

const STORAGE_KEY = "buysmart-cookie-consent-v1";

export type ConsentCategories = {
  analytics: boolean;
  marketing: boolean;
};

const defaultConsent: ConsentCategories = {
  analytics: false,
  marketing: false,
};

export function getConsent(): ConsentCategories | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentCategories;
  } catch {
    return null;
  }
}

function saveConsent(categories: ConsentCategories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const all: ConsentCategories = { analytics: true, marketing: true };
    saveConsent(all);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: all }));
  }, []);

  const rejectNonEssential = useCallback(() => {
    saveConsent({ ...defaultConsent });
    setVisible(false);
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: defaultConsent }));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E2DA] bg-white shadow-[0_-8px_30px_rgba(17,17,17,0.08)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-[#4A4A4A]">
            BuySmart uses cookies and similar technologies to improve site performance, analyse traffic, and support
            marketing on platforms like Google, Meta, and TikTok.{" "}
            <a
              href="/cookie-policy"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, "", "/cookie-policy");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              className="font-semibold underline underline-offset-2 transition hover:no-underline"
              style={{ color: gold }}
            >
              Cookie Policy
            </a>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={rejectNonEssential}
              className="rounded-full border border-[#DED9CF] px-5 py-2.5 text-sm font-semibold text-[#4A4A4A] transition hover:border-[#C9A227] hover:text-[#111111]"
            >
              Reject non-essential
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: gold }}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
