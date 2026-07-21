import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Clock3, MessageCircle, Send, X } from "lucide-react";
import { classNames, gold } from "./layout";

export type QuoteStatus = "pending" | "responded" | "closed";

export type QuoteRequest = {
  id: string;
  name: string;
  identifier: string;
  identifierType: "email" | "phone";
  productOrService: string;
  quantity: string;
  destination: string;
  timeline: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt?: string;
  teamNote?: string;
};

type Identity = {
  name: string;
  identifier: string;
  identifierType: "email" | "phone";
};

const STORAGE_IDENTITY_KEY = "buysmartai:identity";

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function inferIdentifierType(value: string): Identity["identifierType"] | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";
  if (/^[+]?[\d\s()-]{7,}$/.test(trimmed)) return "phone";
  return null;
}

function quotesStorageKey(identifier: string) {
  return `buysmartai:quotes:${normalizeIdentifier(identifier)}`;
}

function loadLocalQuotes(identifier: string): QuoteRequest[] {
  try {
    const raw = window.localStorage.getItem(quotesStorageKey(identifier));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuoteRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalQuotes(identifier: string, quotes: QuoteRequest[]) {
  window.localStorage.setItem(quotesStorageKey(identifier), JSON.stringify(quotes));
}

async function fetchQuotes(identifier: string): Promise<{ quotes: QuoteRequest[]; source: "remote" | "local" }> {
  const local = loadLocalQuotes(identifier);
  try {
    const response = await fetch(`/api/buysmartai?identifier=${encodeURIComponent(identifier)}`);
    if (!response.ok) throw new Error("Remote fetch failed.");
    const payload = (await response.json()) as { quotes?: QuoteRequest[] };
    const quotes = Array.isArray(payload?.quotes) ? payload.quotes : [];
    saveLocalQuotes(identifier, quotes);
    return { quotes, source: "remote" };
  } catch {
    return { quotes: local, source: "local" };
  }
}

function generateLocalId() {
  return `BS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

async function createQuoteRequest(input: Omit<QuoteRequest, "id" | "status" | "createdAt">) {
  try {
    const response = await fetch("/api/buysmartai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; quote?: QuoteRequest; error?: string };
    if (response.ok && payload.ok && payload.quote) {
      return payload.quote;
    }
  } catch {
    /* API unavailable, fall through to local fallback */
  }

  const localQuote: QuoteRequest = {
    id: generateLocalId(),
    ...input,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  return localQuote;
}

export function BuySmartAiWidget({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [identityDraft, setIdentityDraft] = useState({ name: "", identifier: "" });
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"history" | "new">("history");
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ productOrService: "", quantity: "", destination: "", timeline: "" });
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => onOpenChange(true);
    window.addEventListener("buysmartai:open", handler as EventListener);
    return () => window.removeEventListener("buysmartai:open", handler as EventListener);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    setError("");

    try {
      const saved = window.localStorage.getItem(STORAGE_IDENTITY_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Identity;
      if (parsed?.identifier && parsed?.name && parsed?.identifierType) {
        setIdentity(parsed);
        setIdentityDraft({ name: parsed.name, identifier: parsed.identifier });
      }
    } catch {
      /* ignore */
    }
  }, [open]);

  useEffect(() => {
    if (!open || !identity) return;
    setLoading(true);
    setError("");
    fetchQuotes(identity.identifier)
      .then(({ quotes }) => setQuotes(quotes))
      .catch(() => setQuotes(loadLocalQuotes(identity.identifier)))
      .finally(() => setLoading(false));
  }, [identity, open]);

  const steps = useMemo(
    () =>
      [
        { label: "What product or service are you looking to source?", key: "productOrService" as const, placeholder: "e.g. Hotel towels, electronics, office chairs, supplier verification" },
        { label: "Approximate quantity needed?", key: "quantity" as const, placeholder: "e.g. 120 pieces, 3 cartons, 1 container" },
        { label: "Destination or delivery location?", key: "destination" as const, placeholder: "e.g. Lagos, Abuja, Accra, Nairobi" },
        { label: "Preferred timeline?", key: "timeline" as const, placeholder: "e.g. within 2 weeks, next month, flexible" },
      ] as const,
    [],
  );

  const currentStep = steps[step];

  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [quotes]);

  const startNew = () => {
    setMode("new");
    setStep(0);
    setDraft({ productOrService: "", quantity: "", destination: "", timeline: "" });
    setSubmittedId(null);
    setError("");
  };

  const resetToHistory = () => {
    setMode("history");
    setStep(0);
    setDraft({ productOrService: "", quantity: "", destination: "", timeline: "" });
    setSubmittedId(null);
    setError("");
  };

  const submitIdentity = async () => {
    const name = identityDraft.name.trim();
    const identifierRaw = identityDraft.identifier.trim();
    const identifierType = inferIdentifierType(identifierRaw);

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!identifierType) {
      setError("Enter a valid phone number or email address.");
      return;
    }

    const normalized = normalizeIdentifier(identifierRaw);
    const nextIdentity: Identity = { name, identifier: normalized, identifierType };
    window.localStorage.setItem(STORAGE_IDENTITY_KEY, JSON.stringify(nextIdentity));

    setIdentity(nextIdentity);
    setMode("history");
  };

  const goNext = async () => {
    setError("");
    const value = draft[currentStep.key].trim();
    if (!value) {
      setError("Please provide an answer so we can quote accurately.");
      return;
    }

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    if (!identity) {
      setError("Please enter your name and phone/email first.");
      return;
    }

    setLoading(true);
    try {
      const quote = await createQuoteRequest({
        name: identity.name,
        identifier: identity.identifier,
        identifierType: identity.identifierType,
        productOrService: draft.productOrService,
        quantity: draft.quantity,
        destination: draft.destination,
        timeline: draft.timeline,
        updatedAt: new Date().toISOString(),
        teamNote: "",
      });

      setSubmittedId(quote.id);
      setQuotes((prev) => {
        const next = [quote, ...prev.filter((q) => q.id !== quote.id)];
        saveLocalQuotes(identity.identifier, next);
        return next;
      });
    } catch {
      /* should not happen — createQuoteRequest always returns a local quote */
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    onOpenChange(false);
    setError("");
  };

  if (!open) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close BuySmartAi"
        onClick={close}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-[#E5E2DA] bg-white shadow-[0_30px_80px_rgba(17,17,17,0.28)]">
        <div className="flex items-center justify-between border-b border-[#EFEAE1] bg-[#FAFAF8] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" style={{ color: gold }}>
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
                BuySmartAi
              </div>
              <div className="text-xs text-[#7C746C]">
                Guided quote requests and tracking
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E2DA] bg-white text-[#111111] transition hover:border-[#C9A227]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          {!identity ? (
            <div className="grid gap-4">
              <div className="rounded-[22px] border border-[#E5E2DA] bg-[#FAFAF8] p-5">
                <div className="text-sm font-semibold text-[#111111]">Start by telling us who you are.</div>
                <p className="mt-2 text-sm leading-7 text-[#4A4A4A]">
                  Enter your name and a phone number or email. If you return with the same phone/email, you’ll see your previous requests and statuses.
                </p>
              </div>

              <label className="grid gap-2 text-sm font-medium text-[#111111]">
                Name
                <input
                  value={identityDraft.name}
                  onChange={(e) => setIdentityDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
                  placeholder="e.g. Ada Obi"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#111111]">
                Phone number or email
                <input
                  value={identityDraft.identifier}
                  onChange={(e) => setIdentityDraft((prev) => ({ ...prev, identifier: e.target.value }))}
                  className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
                  placeholder="e.g. ada@email.com or 0810 013 0714"
                />
              </label>

              {error ? <div className="text-sm text-[#B42318]" role="alert">{error}</div> : null}

              <button
                type="button"
                onClick={submitIdentity}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: gold }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : mode === "history" ? (
            <div className="grid gap-4">
              <div className="rounded-[22px] border border-[#E5E2DA] bg-[#FAFAF8] p-5">
                <div className="text-sm font-semibold text-[#111111]">Welcome back, {identity.name}.</div>
                <p className="mt-2 text-sm leading-7 text-[#4A4A4A]">
                  Your previous quote requests show below with status tracking. You can start a new request anytime.
                </p>
              </div>

              <button
                type="button"
                onClick={startNew}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: gold }}
              >
                Start new quote request <ArrowRight className="h-4 w-4" />
              </button>

              {loading ? (
                <div className="text-sm text-[#4A4A4A]">Loading your history…</div>
              ) : sortedQuotes.length === 0 ? (
                <div className="rounded-[22px] border border-[#E5E2DA] bg-white p-5 text-sm leading-7 text-[#4A4A4A]">
                  No quote requests found yet. Start your first request and it will appear here.
                </div>
              ) : (
                <div className="grid gap-3">
                  {sortedQuotes.map((quote) => (
                    <div key={quote.id} className="rounded-[22px] border border-[#E5E2DA] bg-white p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#111111]">{quote.productOrService}</div>
                          <div className="mt-1 text-xs text-[#7C746C]">
                            {new Date(quote.createdAt).toLocaleString()}
                            {" • "}
                            Quantity: {quote.quantity}
                            {" • "}
                            Destination: {quote.destination}
                          </div>
                        </div>
                        <span
                          className={classNames(
                            "rounded-full border px-3 py-1 text-xs font-semibold",
                            quote.status === "pending" && "border-[#E5E2DA] bg-[#FAFAF8] text-[#4A4A4A]",
                            quote.status === "responded" && "border-[#1F7A34]/20 bg-[#1F7A34]/10 text-[#1F7A34]",
                            quote.status === "closed" && "border-[#7C746C]/25 bg-[#7C746C]/10 text-[#4A4A4A]",
                          )}
                        >
                          {quote.status}
                        </span>
                      </div>

                      {quote.teamNote ? (
                        <div className="mt-3 rounded-2xl border border-[#E5E2DA] bg-[#FAFAF8] p-4 text-sm leading-7 text-[#4A4A4A]">
                          <span className="font-semibold text-[#111111]">Team note:</span> {quote.teamNote}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-[22px] border border-[#E5E2DA] bg-[#FAFAF8] p-5">
                <div className="text-sm font-semibold text-[#111111]">{currentStep.label}</div>
                <p className="mt-2 text-sm leading-7 text-[#4A4A4A]">
                  This keeps your request clear and reduces back-and-forth.
                </p>
              </div>

              <label className="grid gap-2 text-sm font-medium text-[#111111]">
                Your answer
                <input
                  value={draft[currentStep.key]}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [currentStep.key]: e.target.value }))}
                  className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
                  placeholder={currentStep.placeholder}
                />
              </label>

              {error ? <div className="text-sm text-[#B42318]" role="alert">{error}</div> : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={resetToHistory}
                  className="inline-flex items-center justify-center rounded-full border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#C9A227]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={goNext}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: gold }}
                >
                  {step < steps.length - 1 ? "Next" : "Submit request"} <Send className="h-4 w-4" />
                </button>
              </div>

              {submittedId ? (
                <div className="rounded-[22px] border border-[#C9A227]/35 bg-[#FBF6E8] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: gold }}>
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#111111]">Thanks, we’ve received your request.</div>
                      <div className="mt-2 text-sm leading-7 text-[#4A4A4A]">
                        Our team will get back to you with a quote in under <span className="font-semibold text-[#111111]">18 minutes</span> during business hours.
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E5E2DA] bg-white px-3 py-2 text-xs font-semibold text-[#4A4A4A]">
                        <Clock3 className="h-3.5 w-3.5" style={{ color: gold }} />
                        Status: pending
                      </div>
                      <button
                        type="button"
                        onClick={resetToHistory}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#111111]"
                      >
                        View history <ArrowRight className="h-4 w-4" style={{ color: gold }} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BuySmartAiContent() {
  const [identityDraft, setIdentityDraft] = useState({ name: "", identifier: "" });
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"history" | "new">("history");
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ productOrService: "", quantity: "", destination: "", timeline: "" });
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    setError("");
    try {
      const saved = window.localStorage.getItem(STORAGE_IDENTITY_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Identity;
      if (parsed?.identifier && parsed?.name && parsed?.identifierType) {
        setIdentity(parsed);
        setIdentityDraft({ name: parsed.name, identifier: parsed.identifier });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!identity) return;
    setLoading(true);
    setError("");
    fetchQuotes(identity.identifier)
      .then(({ quotes }) => setQuotes(quotes))
      .catch(() => setQuotes(loadLocalQuotes(identity.identifier)))
      .finally(() => setLoading(false));
  }, [identity]);

  const steps = useMemo(
    () =>
      [
        { label: "What product or service are you looking to source?", key: "productOrService" as const, placeholder: "e.g. Hotel towels, electronics, office chairs, supplier verification" },
        { label: "Approximate quantity needed?", key: "quantity" as const, placeholder: "e.g. 120 pieces, 3 cartons, 1 container" },
        { label: "Destination or delivery location?", key: "destination" as const, placeholder: "e.g. Lagos, Abuja, Accra, Nairobi" },
        { label: "Preferred timeline?", key: "timeline" as const, placeholder: "e.g. within 2 weeks, next month, flexible" },
      ] as const,
    [],
  );

  const currentStep = steps[step];

  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [quotes]);

  const startNew = () => {
    setMode("new");
    setStep(0);
    setDraft({ productOrService: "", quantity: "", destination: "", timeline: "" });
    setSubmittedId(null);
    setError("");
  };

  const resetToHistory = () => {
    setMode("history");
    setStep(0);
    setDraft({ productOrService: "", quantity: "", destination: "", timeline: "" });
    setSubmittedId(null);
    setError("");
  };

  const submitIdentity = async () => {
    const name = identityDraft.name.trim();
    const identifierRaw = identityDraft.identifier.trim();
    const identifierType = inferIdentifierType(identifierRaw);

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!identifierType) {
      setError("Enter a valid phone number or email address.");
      return;
    }

    const normalized = normalizeIdentifier(identifierRaw);
    const nextIdentity: Identity = { name, identifier: normalized, identifierType };
    window.localStorage.setItem(STORAGE_IDENTITY_KEY, JSON.stringify(nextIdentity));

    setIdentity(nextIdentity);
    setMode("history");
  };

  const goNext = async () => {
    setError("");
    const value = draft[currentStep.key].trim();
    if (!value) {
      setError("Please provide an answer so we can quote accurately.");
      return;
    }

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    if (!identity) {
      setError("Please enter your name and phone/email first.");
      return;
    }

    setLoading(true);
    try {
      const quote = await createQuoteRequest({
        name: identity.name,
        identifier: identity.identifier,
        identifierType: identity.identifierType,
        productOrService: draft.productOrService,
        quantity: draft.quantity,
        destination: draft.destination,
        timeline: draft.timeline,
        updatedAt: new Date().toISOString(),
        teamNote: "",
      });

      setSubmittedId(quote.id);
      setQuotes((prev) => {
        const next = [quote, ...prev.filter((q) => q.id !== quote.id)];
        saveLocalQuotes(identity.identifier, next);
        return next;
      });
    } catch {
      /* should not happen */
    } finally {
      setLoading(false);
    }
  };

  if (!identity) {
    return (
      <div className="grid gap-4">
        <div className="rounded-[22px] border border-[#E5E2DA] bg-[#FAFAF8] p-5">
          <div className="text-sm font-semibold text-[#111111]">Start by telling us who you are.</div>
          <p className="mt-2 text-sm leading-7 text-[#4A4A4A]">
            Enter your name and a phone number or email. If you return with the same phone/email, you'll see your previous requests and statuses.
          </p>
        </div>

        <label className="grid gap-2 text-sm font-medium text-[#111111]">
          Name
          <input
            value={identityDraft.name}
            onChange={(e) => setIdentityDraft((prev) => ({ ...prev, name: e.target.value }))}
            className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
            placeholder="e.g. Ada Obi"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#111111]">
          Phone number or email
          <input
            value={identityDraft.identifier}
            onChange={(e) => setIdentityDraft((prev) => ({ ...prev, identifier: e.target.value }))}
            className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
            placeholder="e.g. ada@email.com or 0810 013 0714"
          />
        </label>

        {error ? <div className="text-sm text-[#B42318]" role="alert">{error}</div> : null}

        <button
          type="button"
          onClick={submitIdentity}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: gold }}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (mode === "history") {
    return (
      <div className="grid gap-4">
        <div className="rounded-[22px] border border-[#E5E2DA] bg-[#FAFAF8] p-5">
          <div className="text-sm font-semibold text-[#111111]">Welcome back, {identity.name}.</div>
          <p className="mt-2 text-sm leading-7 text-[#4A4A4A]">
            Your previous quote requests show below with status tracking. You can start a new request anytime.
          </p>
        </div>

        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: gold }}
        >
          Start new quote request <ArrowRight className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="text-sm text-[#4A4A4A]">Loading your history...</div>
        ) : sortedQuotes.length === 0 ? (
          <div className="rounded-[22px] border border-[#E5E2DA] bg-white p-5 text-sm leading-7 text-[#4A4A4A]">
            No quote requests found yet. Start your first request and it will appear here.
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedQuotes.map((quote) => (
              <div key={quote.id} className="rounded-[22px] border border-[#E5E2DA] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#111111]">{quote.productOrService}</div>
                    <div className="mt-1 text-xs text-[#7C746C]">
                      {new Date(quote.createdAt).toLocaleString()}
                      {" \u2022 "}
                      Quantity: {quote.quantity}
                      {" \u2022 "}
                      Destination: {quote.destination}
                    </div>
                  </div>
                  <span
                    className={classNames(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      quote.status === "pending" && "border-[#E5E2DA] bg-[#FAFAF8] text-[#4A4A4A]",
                      quote.status === "responded" && "border-[#1F7A34]/20 bg-[#1F7A34]/10 text-[#1F7A34]",
                      quote.status === "closed" && "border-[#7C746C]/25 bg-[#7C746C]/10 text-[#4A4A4A]",
                    )}
                  >
                    {quote.status}
                  </span>
                </div>

                {quote.teamNote ? (
                  <div className="mt-3 rounded-2xl border border-[#E5E2DA] bg-[#FAFAF8] p-4 text-sm leading-7 text-[#4A4A4A]">
                    <span className="font-semibold text-[#111111]">Team note:</span> {quote.teamNote}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[22px] border border-[#E5E2DA] bg-[#FAFAF8] p-5">
        <div className="text-sm font-semibold text-[#111111]">{currentStep.label}</div>
        <p className="mt-2 text-sm leading-7 text-[#4A4A4A]">
          This keeps your request clear and reduces back-and-forth.
        </p>
      </div>

      <label className="grid gap-2 text-sm font-medium text-[#111111]">
        Your answer
        <input
          value={draft[currentStep.key]}
          onChange={(e) => setDraft((prev) => ({ ...prev, [currentStep.key]: e.target.value }))}
          className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
          placeholder={currentStep.placeholder}
        />
      </label>

      {error ? <div className="text-sm text-[#B42318]" role="alert">{error}</div> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={resetToHistory}
          className="inline-flex items-center justify-center rounded-full border border-[#E5E2DA] bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#C9A227]"
        >
          Back
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={goNext}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: gold }}
        >
          {step < steps.length - 1 ? "Next" : "Submit request"} <Send className="h-4 w-4" />
        </button>
      </div>

      {submittedId ? (
        <div className="rounded-[22px] border border-[#C9A227]/35 bg-[#FBF6E8] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: gold }}>
              <Check className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111111]">Thanks, we've received your request.</div>
              <div className="mt-2 text-sm leading-7 text-[#4A4A4A]">
                Our team will get back to you with a quote in under <span className="font-semibold text-[#111111]">18 minutes</span> during business hours.
              </div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E5E2DA] bg-white px-3 py-2 text-xs font-semibold text-[#4A4A4A]">
                <Clock3 className="h-3.5 w-3.5" style={{ color: gold }} />
                Status: pending
              </div>
              <button
                type="button"
                onClick={resetToHistory}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#111111]"
              >
                View history <ArrowRight className="h-4 w-4" style={{ color: gold }} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BuySmartAiPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-10">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAF8] shadow-sm" style={{ color: gold }}>
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-extrabold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
                  BuySmartAi
                </h1>
                <p className="text-sm text-[#7C746C]">Guided quote requests and tracking</p>
              </div>
            </div>
          </div>
          <BuySmartAiContent />
        </div>
      </section>
    </main>
  );
}

export function BuySmartAiFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full border border-[#E5E2DA] bg-white px-4 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_40px_rgba(17,17,17,0.12)] transition hover:border-[#C9A227]"
      aria-label="Open BuySmartAi"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "#1A2332" }}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="none">
          <rect x="2" y="4" width="20" height="14" rx="10" ry="10" fill="#C9A227" />
          <path d="M6 11h12M6 15h8" stroke="#1A2332" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="18" cy="8" r="1.5" fill="#1A2332" />
          <circle cx="20.5" cy="6" r="1" fill="#C9A227" />
          <circle cx="19" cy="10" r="0.8" fill="#C9A227" />
        </svg>
      </span>
      <span className="hidden sm:inline">Chat with BuySmart AI</span>
      <ArrowRight className="h-4 w-4" style={{ color: gold }} />
    </button>
  );
}

