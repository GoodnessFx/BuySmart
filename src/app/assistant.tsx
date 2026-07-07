import { useMemo, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { faqItems, services, volumetricFormula } from "./content";
import { WhatsAppBrandIcon, createWhatsAppUrl, gold } from "./layout";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  pending?: boolean;
};

const greeting =
  "Hello. I can answer questions about services, shipping, inspections, order steps, customs basics, and installment plans. Ask me anything and I’ll think it through before replying.";

const fallback =
  "I can answer from the information published on this site. For exact quotes, account-specific issues, complaints, or anything outside the published information, please continue on WhatsApp.";

const handoffTerms = [
  "quote",
  "price for",
  "my order",
  "complaint",
  "issue",
  "problem",
  "refund status",
  "track my order",
  "tracking number",
  "account",
  "invoice",
  "specific cost",
];

const knowledge = [
  {
    patterns: ["shipping", "timeline", "air", "sea", "how long", "delivery"],
    answer:
      "Air shipping is approximately 10 to 15 working days after shipment. Sea shipping is approximately 8 to 12 weeks depending on the shipping schedule.",
  },
  {
    patterns: ["volumetric", "chargeable weight", "dimension", "actual weight"],
    answer: `Volumetric weight is calculated as ${volumetricFormula}. BuySmart compares actual weight and volumetric weight, and whichever figure is higher is billed.`,
  },
  {
    patterns: ["customs", "duty", "duties", "clearance"],
    answer:
      "Customs duties depend on product category, declared value, documentation, and current import rules. When duties apply, the customer is responsible unless a written quote states otherwise.",
  },
  {
    patterns: ["installment", "deposit", "late payment", "missed payment", "balance"],
    answer:
      "Selected products qualify for installment payments. The minimum deposit starts from 50 percent, and late or missed payments can pause procurement, release, or shipment until the outstanding balance is cleared.",
  },
  {
    patterns: ["inspect", "inspection", "verify", "supplier verification", "factory inspection"],
    answer:
      "BuySmart offers supplier verification, factory inspection, quality inspection, and product verification reports before shipment.",
  },
  {
    patterns: ["process", "how it works", "steps", "order process"],
    answer:
      "The process is simple: send your product link or description, BuySmart verifies the supplier and sends a quotation, you make payment, the goods are inspected and shipped, then you receive your order anywhere in Nigeria.",
  },
  {
    patterns: ["restricted", "prohibited", "battery", "liquid", "counterfeit"],
    answer:
      "Some items are restricted or prohibited, including batteries and battery-powered devices without prior approval, flammable liquids, hazardous chemicals, counterfeit goods, weapons, and illegal or regulated products. It is best to confirm before ordering.",
  },
  {
    patterns: ["quote", "cost", "price", "fee", "pricing", "how much", "amount"],
    answer:
      "A quote depends on your specific item, supplier pricing, shipping route, and weight. BuySmart compares actual and volumetric weight, shipping costs, and supplier charges before sending a total landed cost estimate.",
  },
  {
    patterns: ["payment", "deposit", "installment", "pay", "transfer"],
    answer:
      "Payment is handled based on the agreed quote. Selected orders can use installment plans with a deposit, and the final balance is cleared before shipment or release.",
  },
  {
    patterns: ["customs documents", "documents", "paperwork", "invoice", "packing list"],
    answer:
      "Import paperwork depends on the goods category and delivery method. Typically, you need an invoice, packing list, and any relevant customs documents. BuySmart helps coordinate paperwork once your order is ready.",
  },
  {
    patterns: ["who are you", "what do you do", "what is buysmart", "services offered", "how can you help"],
    answer:
      "I’m the BuySmart Assistant. I answer questions about procurement, supplier verification, shipping, inspections, customs, and installment plans using the published site information.",
  },
];

function matchFaq(query: string) {
  return faqItems.find((item) => {
    const normalizedQuestion = item.question.toLowerCase();
    return (
      query.includes(normalizedQuestion) ||
      normalizedQuestion
        .split(" ")
        .some((word) => word.length > 4 && query.includes(word))
    );
  });
}

function matchService(query: string) {
  return services.find(
    (service) =>
      query.includes(service.title.toLowerCase()) ||
      service.title
        .toLowerCase()
        .split(" ")
        .some((word) => word.length > 4 && query.includes(word)),
  );
}

function findReply(input: string) {
  const query = input.toLowerCase().trim();

  if (handoffTerms.some((term) => query.includes(term))) {
    return fallback;
  }

  const serviceMatch = matchService(query);
  if (serviceMatch) {
    return `${serviceMatch.title}: ${serviceMatch.description}${serviceMatch.note ? ` ${serviceMatch.note}` : ""}`;
  }

  const faqMatch = matchFaq(query);
  if (faqMatch) {
    return faqMatch.answer;
  }

  const bestKnowledge = knowledge
    .map((item) => ({
      score: item.patterns.reduce((count, pattern) => count + (query.includes(pattern) ? 1 : 0), 0),
      answer: item.answer,
    }))
    .sort((a, b) => b.score - a.score)[0];

  return bestKnowledge && bestKnowledge.score > 0 ? bestKnowledge.answer : fallback;
}

const quickQuestions = [
  "How long does shipping take?",
  "How is chargeable weight calculated?",
  "Can I pay in installments?",
];

export function FloatingWhatsAppButton() {
  return (
    <a
      href={createWhatsAppUrl("Hello BuySmart, I would like to continue this conversation on WhatsApp.")}
      target="_blank"
      rel="noreferrer"
      className="group fixed bottom-5 right-5 z-50 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white p-1 shadow-[0_22px_50px_rgba(37,211,102,0.35)] transition hover:scale-[1.04]"
      aria-label="Open WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-20 blur-xl transition group-hover:opacity-30" aria-hidden="true" />
      <span className="absolute inset-[-8px] animate-pulse rounded-full border border-[#25D366]/35" aria-hidden="true" />
      <WhatsAppBrandIcon className="relative h-16 w-16" />
    </a>
  );
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: greeting }]);

  const previewText = useMemo(() => messages[messages.length - 1]?.text ?? greeting, [messages]);

  const pushReply = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const reply = findReply(trimmed);
    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      { role: "assistant", text: "Thinking...", pending: true },
    ]);

    const delay = Math.min(1400, 600 + trimmed.length * 25);
    window.setTimeout(() => {
      setMessages((current) => {
        const updated = [...current];
        const pendingIndex = updated.map((message) => message.pending).lastIndexOf(true);
        if (pendingIndex >= 0) {
          updated[pendingIndex] = { role: "assistant", text: reply };
        } else {
          updated.push({ role: "assistant", text: reply });
        }
        return updated;
      });
    }, delay);
  };

  const handleSend = () => {
    pushReply(input);
    setInput("");
  };

  return (
    <>
      {!open ? (
        <div className="fixed bottom-24 right-6 z-40 hidden max-w-xs rounded-2xl border border-[#E5E2DA] bg-white p-4 shadow-[0_18px_40px_rgba(17,17,17,0.12)] md:block">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAF8]" style={{ color: gold }}>
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-[#111111]">Need a quick answer?</div>
              <p className="mt-1 text-xs leading-6 text-[#4A4A4A]">{previewText}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-24 right-6 z-40">
        {open ? (
          <div className="w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[28px] border border-[#E5E2DA] bg-white shadow-[0_22px_54px_rgba(17,17,17,0.14)]">
            <div className="flex items-center justify-between border-b border-[#EFEAE1] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAF8]" style={{ color: gold }}>
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#111111]">BuySmart Assistant</div>
                  <div className="text-xs text-[#7C746C]">Published site knowledge only</div>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-[#4A4A4A]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[24rem] space-y-3 overflow-y-auto px-5 py-4">
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
                      Typing...
                    </div>
                  ) : (
                    message.text
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-[#EFEAE1] p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => pushReply(question)}
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
                  className="flex-1 rounded-full border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-sm text-[#111111] outline-none"
                />
                <button type="button" onClick={handleSend} className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ backgroundColor: gold }}>
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <a
                href={createWhatsAppUrl("Hello BuySmart, I need a live quote or support beyond the website FAQs.")}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#7C746C]"
              >
                Continue on WhatsApp if you need a live quote
              </a>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-3 rounded-full border border-[#E5E2DA] bg-white px-4 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_40px_rgba(17,17,17,0.12)] transition hover:border-[#C9A227]"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FAFAF8]" style={{ color: gold }}>
              <Bot className="h-5 w-5" />
            </span>
            Ask BuySmart
          </button>
        )}
      </div>
    </>
  );
}
