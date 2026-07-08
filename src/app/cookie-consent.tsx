import { useCallback, useEffect, useState } from "react";
import { gold, dark } from "./layout";

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
  const [customising, setCustomising] = useState(false);
  const [choices, setChoices] = useState<ConsentCategories>({ ...defaultConsent });

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

  const saveCustom = useCallback(() => {
    saveConsent(choices);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("consent-updated", { detail: choices }));
  }, [choices]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E5E2DA] bg-white shadow-[0_-8px_30px_rgba(17,17,17,0.08)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6">
        {!customising ? (
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
                onClick={() => setCustomising(true)}
                className="rounded-full border border-[#DED9CF] px-5 py-2.5 text-sm font-semibold text-[#4A4A4A] transition hover:border-[#C9A227] hover:text-[#111111]"
              >
                Customise
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: gold }}
              >
                Allow all
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5">
            <p className="text-sm font-semibold text-[#111111]">Customise cookie preferences</p>
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-2xl border border-[#E5E2DA] bg-[#FAFAF8] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#111111]">Essential</div>
                  <div className="text-xs leading-5 text-[#4A4A4A]">Required for the site to function. Includes core navigation, session storage for the assistant, and form handling.</div>
                </div>
                <div className="flex h-6 w-11 items-center rounded-full bg-[#DED9CF] opacity-50">
                  <div className="ml-0.5 h-5 w-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <label className="flex items-center justify-between rounded-2xl border border-[#E5E2DA] bg-[#FAFAF8] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#111111]">Analytics</div>
                  <div className="text-xs leading-5 text-[#4A4A4A]">Google Analytics (GA4) — helps us understand how visitors use the site so we can improve it.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={choices.analytics}
                  onClick={() => setChoices((prev) => ({ ...prev, analytics: !prev.analytics }))}
                  className={`flex h-6 w-11 rounded-full transition-colors ${choices.analytics ? "bg-[#C9A227]" : "bg-[#DED9CF]"}`}
                >
                  <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${choices.analytics ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </button>
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-[#E5E2DA] bg-[#FAFAF8] px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-[#111111]">Marketing</div>
                  <div className="text-xs leading-5 text-[#4A4A4A]">Meta Pixel and TikTok Pixel — used to measure campaign performance and show relevant ads.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={choices.marketing}
                  onClick={() => setChoices((prev) => ({ ...prev, marketing: !prev.marketing }))}
                  className={`flex h-6 w-11 rounded-full transition-colors ${choices.marketing ? "bg-[#C9A227]" : "bg-[#DED9CF]"}`}
                >
                  <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${choices.marketing ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </button>
              </label>
            </div>
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
                onClick={saveCustom}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: gold }}
              >
                Save preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
