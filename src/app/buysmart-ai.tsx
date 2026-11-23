import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Clock3, PackageSearch, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { findReply } from "./assistant";
import { classNames, Container, createWhatsAppUrl, gold, WhatsAppBrandIcon } from "./layout";

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

function AiChatIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="none">
      <rect x="2" y="4" width="20" height="14" rx="10" ry="10" fill="#C9A227" />
      <path d="M6 11h12M6 15h8" stroke="#1A2332" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18" cy="8" r="1.5" fill="#1A2332" />
      <circle cx="20.5" cy="6" r="1" fill="#C9A227" />
      <circle cx="19" cy="10" r="0.8" fill="#C9A227" />
    </svg>
  );
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

  // Sync to BuySmart Admin Desk Quote Requests Inbox
  try {
    const raw = window.localStorage.getItem("buysmart_stored_quotes");
    const existing = raw ? JSON.parse(raw) : [];
    const adminQuote = {
      id: localQuote.id,
      clientName: localQuote.name || "Website Lead",
      clientEmail: localQuote.identifierType === "email" ? localQuote.identifier : "client@buysmart.ng",
      clientPhone: localQuote.identifierType === "phone" ? localQuote.identifier : "0810 013 0714",
      itemDescription: localQuote.productOrService || "Procurement Request",
      quantity: localQuote.quantity || "1",
      shippingMethod: "Air Freight",
      targetTimeline: localQuote.timeline || "Prompt",
      notes: `Destination: ${localQuote.destination || "Lagos, Nigeria"}`,
      status: "Pending",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    window.localStorage.setItem("buysmart_stored_quotes", JSON.stringify([adminQuote, ...existing]));
  } catch {}

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
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "#1A2332" }}>
              <AiChatIcon className="h-4 w-4" />
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

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  pending?: boolean;
  handoff?: boolean;
};

const CHAT_STORAGE_KEY = "buysmartai:chat";

const chatGreeting =
  "Hello! I'm the BuySmart AI assistant. Ask me anything about sourcing, shipping, inspections, installment plans, or how to place an order.";

const chatQuickQuestions = [
  "How long does shipping take?",
  "How is chargeable weight calculated?",
  "Can I pay in installments?",
  "What items can't be shipped?",
  "What services do you offer?",
];

function BuySmartAiChat({ onStartQuote }: { onStartQuote: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((message) => !message.pending);
        }
      }
    } catch {
      /* ignore invalid saved chat */
    }
    return [{ role: "assistant", text: chatGreeting }];
  });
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pushQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((current) => {
      const lastUser = [...current].reverse().find((message) => message.role === "user")?.text;
      if (lastUser?.toLowerCase() === trimmed.toLowerCase()) return current;
      return [...current, { role: "user", text: trimmed }, { role: "assistant", text: "Thinking...", pending: true }];
    });
    setInput("");

    const delay = Math.min(1200, 500 + trimmed.length * 20);
    window.setTimeout(() => {
      const reply = findReply(trimmed);
      setMessages((current) => {
        const updated = [...current];
        const pendingIndex = updated.map((message) => message.pending).lastIndexOf(true);
        if (pendingIndex >= 0) {
          updated[pendingIndex] = { role: "assistant", text: reply.text, handoff: reply.handoff };
        } else {
          updated.push({ role: "assistant", text: reply.text, handoff: reply.handoff });
        }
        return updated;
      });
    }, delay);
  };

  const handleSend = () => {
    pushQuestion(input);
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-[22px] border border-[#E5E2DA] bg-[#FAFAF8] p-5">
        <div className="text-sm font-semibold text-[#111111]">Ask BuySmart AI anything</div>
        <p className="mt-2 text-sm leading-7 text-[#4A4A4A]">
          Answers come from our published business information. If I can't answer correctly, I'll point you to our team on WhatsApp.
        </p>
      </div>

      <div className="max-h-[24rem] space-y-3 overflow-y-auto rounded-[22px] border border-[#E5E2DA] bg-white p-5">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "assistant"
                ? "mr-6 rounded-2xl bg-[#FAFAF8] px-4 py-3 text-sm leading-6 text-[#4A4A4A]"
                : "ml-6 rounded-2xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm leading-6 text-[#111111]"
            }
          >
            {message.pending ? (
              <div className="flex items-center gap-2 text-[#4A4A4A]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C9A227] animate-pulse" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#C9A227] animate-pulse" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#C9A227] animate-pulse" />
                Thinking...
              </div>
            ) : (
              <div className="grid gap-3">
                <p className="whitespace-pre-line">{message.text}</p>
                {message.handoff ? (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={createWhatsAppUrl("Hello BuySmart, I need help beyond what the assistant could answer.")}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      <WhatsAppBrandIcon className="h-4 w-4" /> Chat on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={onStartQuote}
                      className="inline-flex items-center gap-2 rounded-full border border-[#C9A227] px-4 py-2 text-xs font-semibold text-[#111111] transition hover:bg-[#FBF6E8]"
                    >
                      Get a quote instead <ArrowRight className="h-3.5 w-3.5" style={{ color: gold }} />
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-2">
        {chatQuickQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => pushQuestion(question)}
            className="rounded-full border border-[#E5E2DA] bg-[#FAFAF8] px-3 py-2 text-xs font-semibold text-[#4A4A4A] transition hover:border-[#C9A227] hover:text-[#111111]"
          >
            {question}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about shipping, services, or installments"
          className="flex-1 rounded-full border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
        />
        <button
          type="button"
          onClick={handleSend}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:opacity-90"
          style={{ backgroundColor: gold }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function BuySmartAiContent() {
  const [tab, setTab] = useState<"chat" | "quote">("chat");

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-2 rounded-full border border-[#E5E2DA] bg-[#FAFAF8] p-1">
        <button
          type="button"
          onClick={() => setTab("chat")}
          className={classNames(
            "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            tab === "chat" ? "bg-white text-[#111111] shadow-sm" : "text-[#7C746C] hover:text-[#111111]",
          )}
        >
          Ask a question
        </button>
        <button
          type="button"
          onClick={() => setTab("quote")}
          className={classNames(
            "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
            tab === "quote" ? "bg-white text-[#111111] shadow-sm" : "text-[#7C746C] hover:text-[#111111]",
          )}
        >
          Get a quote
        </button>
      </div>
      {tab === "chat" ? <BuySmartAiChat onStartQuote={() => setTab("quote")} /> : <BuySmartAiQuoteFlow />}
    </div>
  );
}

function BuySmartAiQuoteFlow() {
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
  const guideSteps = [
    {
      title: "Ask anything first",
      body: "Shipping times, duties, installments, restricted items — the assistant answers from our real service terms.",
    },
    {
      title: "Then request a quote",
      body: "Four short questions: product, quantity, destination, timeline. No account or login needed.",
    },
    {
      title: "Come back to track it",
      body: "Use the same phone or email and your requests reappear here with live status and team notes.",
    },
  ];

  return (
    <main className="bg-[#FAFAF8]">
      <section className="relative overflow-hidden bg-[#111111] py-12 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 90% at 15% 0%, rgba(201,162,39,0.22) 0%, rgba(17,17,17,0) 60%), radial-gradient(50% 80% at 90% 100%, rgba(37,99,235,0.16) 0%, rgba(17,17,17,0) 65%)",
          }}
        />
        <Container className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#E8C55A]">
            <Sparkles className="h-3.5 w-3.5" /> BuySmart AI desk
          </div>
          <h1
            className="mt-4 max-w-2xl text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-white"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Ask. Get quoted. <span style={{ color: gold }}>Track it.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
            One desk for questions and quote requests — answered by our team, usually in under 18 minutes during business hours.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { icon: Clock3, label: "Under 18 min reply" },
              { icon: ShieldCheck, label: "No login required" },
              { icon: PackageSearch, label: "Status tracking built in" },
            ].map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/85"
              >
                <chip.icon className="h-3.5 w-3.5" style={{ color: gold }} />
                {chip.label}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-8 lg:py-12">
        <Container className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-4 lg:sticky lg:top-28">
            <div className="rounded-[24px] border border-[#E5E2DA] bg-white p-5 sm:p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A6D14]">How this desk works</div>
              <div className="mt-4 grid gap-4">
                {guideSteps.map((step, index) => (
                  <div key={step.title} className="flex gap-3.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                      style={{ backgroundColor: gold }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-[#111111]">{step.title}</div>
                      <p className="mt-1 text-sm leading-6 text-[#4A4A4A]">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E5E2DA] bg-[#FBF6E8] p-5 sm:p-6">
              <div className="text-sm font-bold text-[#111111]">Prefer a human right away?</div>
              <p className="mt-1.5 text-sm leading-6 text-[#4A4A4A]">
                Message the same desk on WhatsApp — quotes, tracking IDs, and payment questions all welcome.
              </p>
              <a
                href={createWhatsAppUrl("Hello BuySmart, I need help with a procurement request.")}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                <WhatsAppBrandIcon className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E5E2DA] bg-white p-4 shadow-[0_18px_50px_rgba(17,17,17,0.06)] sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-[#EFEAE1] pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: "#1A2332" }}>
                <AiChatIcon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-base font-extrabold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
                  BuySmartAi
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F7A34]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1F7A34]" /> Online — guided quotes &amp; answers
                </div>
              </div>
            </div>
            <BuySmartAiContent />
          </div>
        </Container>
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
        <AiChatIcon className="h-5 w-5" />
      </span>
      <span className="hidden sm:inline">BuySmart AI</span>
      <ArrowRight className="h-4 w-4" style={{ color: gold }} />
    </button>
  );
}

