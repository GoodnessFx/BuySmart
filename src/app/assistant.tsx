import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Bot, MessageCircle, Send, X } from "lucide-react";
import {
  ADDRESS_LINE_1,
  ADDRESS_LINE_2,
  BUSINESS_NAME,
  EMAIL,
  assistantFallback,
  customsGuide,
  faqItems,
  installmentPolicies,
  installmentSchedule,
  orderSteps,
  PHONE_DISPLAY,
  prohibitedItems,
  services,
  shippingModes,
  shippingNotes,
  shippingPreparation,
  volumetricFormula,
  WA_PHONE,
} from "./content";
import { WhatsAppBrandIcon, createWhatsAppUrl, gold } from "./layout";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  pending?: boolean;
  handoff?: boolean;
};

export type AssistantReply = {
  text: string;
  handoff?: boolean;
};

const greeting =
  "Hello! I'm the BuySmart AI assistant. Ask me about sourcing, shipping, inspections, installment plans, or how to place an order.";

const handoffMessage = `${assistantFallback} You can start a quote request on this page, or continue on WhatsApp.`;

const knowledge = [
  ...services.map((service) => ({
    patterns: [service.title.toLowerCase()],
    answer: `${service.title}: ${service.description}${service.note ? ` ${service.note}` : ""}`,
  })),
  ...faqItems.map((item) => ({
    patterns: [item.question.toLowerCase()],
    answer: item.answer,
  })),
  {
    patterns: ["shipping", "timeline", "how long", "delivery", "air", "sea"],
    answer: `Air shipping takes approximately 10 to 15 working days after shipment. Sea shipping takes approximately 8 to 12 weeks depending on the shipping schedule.`,
  },
  {
    patterns: ["volumetric", "chargeable weight", "dimension", "actual weight"],
    answer: `Volumetric weight is calculated as ${volumetricFormula}. BuySmart compares actual weight and volumetric weight, and whichever figure is higher is billed. ${shippingNotes.join(" ")}`,
  },
  {
    patterns: ["customs", "duty", "duties", "clearance", "import tax"],
    answer: customsGuide.join(" "),
  },
  {
    patterns: ["installment", "deposit", "pay in part", "part payment", "missed payment"],
    answer: `${installmentSchedule.map((s) => `${s.title}: ${s.description}`).join(" ")} ${installmentPolicies.map((p) => `${p.title}: ${p.description}`).join(" ")}`,
  },
  {
    patterns: ["inspect", "inspection", "verify", "supplier verification", "factory inspection"],
    answer:
      "BuySmart offers supplier verification, factory inspection, quality inspection, and product verification reports before shipment. Request inspection for custom, fragile, or high value items.",
  },
  {
    patterns: ["process", "how it works", "steps", "how to order", "place an order"],
    answer: `The order process is: ${orderSteps.map((s) => s.heading).join(" Then, ")}`,
  },
  {
    patterns: ["restricted", "prohibited", "battery", "liquid", "counterfeit", "cannot ship", "can't ship"],
    answer: `Some items are restricted or prohibited: ${prohibitedItems.join("; ")}. Contact us before ordering anything you are unsure about.`,
  },
  {
    patterns: ["payment", "pay", "transfer", "currency", "naira", "rMB", "how do i pay"],
    answer:
      "Payment is handled based on the agreed quote. Most customer payments are arranged in Naira, and supplier settlement can be handled in RMB where required. Selected orders can use installment plans with a deposit.",
  },
  {
    patterns: ["documents", "paperwork", "invoice", "packing list"],
    answer:
      "Import paperwork depends on the goods category and delivery method. Typically you need an invoice, packing list, and any relevant customs documents. BuySmart helps coordinate paperwork once your order is ready.",
  },
  {
    patterns: ["minimum order", "minimum quantity", "one item", "single item", "buy one", "personal shopping", "personal use"],
    answer:
      "No minimum order quantity. Personal shopping allows single item orders, while business procurement supports larger wholesale quantities.",
  },
  {
    patterns: ["refund", "return", "damaged", "damage"],
    answer:
      "Refunds are available where BuySmart fails to deliver the agreed specification due to our error. If your item arrives damaged, tell us immediately with clear photos and delivery details. Refunds are reviewed after deducting supplier fees, exchange impact, logistics costs, and other non recoverable commitments.",
  },
  {
    patterns: ["track", "tracking", "status", "where is my order", "update"],
    answer:
      "We share shipment updates through the agreed communication channel once your goods have been dispatched. For order-specific status, use the 'Get a quote' tab to view your request history.",
  },
  {
    patterns: ["contact", "reach", "phone", "number", "whatsapp", "email", "address", "location", "where are you"],
    answer: `You can reach BuySmart Procurement Limited on WhatsApp at ${PHONE_DISPLAY} (wa.me/${WA_PHONE}), by email at ${EMAIL}, or visit us at ${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}.`,
  },
  {
    patterns: ["who are you", "what do you do", "what is buysmart", "services offered", "how can you help", "company"],
    answer: `${BUSINESS_NAME} is a global procurement company with our strongest sourcing in China and Vietnam. We handle sourcing, supplier verification, quality inspection, logistics, customs and import/export support, procurement consulting, and complete end-to-end procurement solutions.`,
  },
];

function scoreEntry(query: string, patterns: string[]) {
  let score = 0;
  for (const pattern of patterns) {
    if (!pattern) continue;
    if (query.includes(pattern)) {
      score += 4;
    } else {
      const words = pattern.split(/\s+/).filter((word) => word.length > 4);
      for (const word of words) {
        if (query.includes(word)) score += 1;
      }
    }
  }
  return score;
}

export function findReply(input: string): AssistantReply {
  const query = input.toLowerCase().trim();

  if (/^(hi|hello|hey|good (morning|afternoon|evening)|yo)\b/.test(query)) {
    return { text: "Hello! I'm the BuySmart AI assistant. Ask me about sourcing, shipping, inspections, installment plans, or how to place an order." };
  }

  if (/\b(thanks|thank you|thank you so much)\b/.test(query)) {
    return { text: "You're welcome! Is there anything else I can help you with?" };
  }

  if (/\b(quote|price for|how much|cost for|pricing|estimate)\b/.test(query)) {
    return {
      text: "A quote depends on your specific item, supplier pricing, shipping route, and weight. Start a structured quote request using the 'Get a quote' tab on this page, or continue on WhatsApp for a quick estimate.",
      handoff: true,
    };
  }

  let best: { score: number; answer: string } | null = null;

  for (const entry of knowledge) {
    const patterns = entry.patterns || [];
    const score = scoreEntry(query, patterns);
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: entry.answer };
    }
  }

  if (best && best.score >= 2) {
    return { text: best.answer };
  }

  return { text: handoffMessage, handoff: true };
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
      className="fixed bottom-24 md:bottom-28 right-5 z-50 inline-flex items-center justify-center transition hover:scale-110"
      aria-label="Open WhatsApp"
      style={{ filter: "drop-shadow(0 0 12px rgba(37, 211, 102, 0.7)) drop-shadow(0 0 4px rgba(37, 211, 102, 0.5))" }}
    >
      <WhatsAppBrandIcon className="h-14 w-14" />
    </a>
  );
}

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-28 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(201,162,39,0.3)] transition-all duration-300 ${
        visible ? "scale-100 opacity-100" : "scale-75 opacity-0 pointer-events-none"
      }`}
      style={{ backgroundColor: gold }}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: greeting }]);

  useEffect(() => {
    const saved = window.sessionStorage.getItem("buysmart-assistant-messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        /* ignore invalid saved chat */
      }
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("buysmart-assistant-messages", JSON.stringify(messages));
  }, [messages]);

  const previewText = useMemo(() => messages[messages.length - 1]?.text ?? greeting, [messages]);

  const pushReply = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((current) => {
      const lastUser = [...current].reverse().find((message) => message.role === "user")?.text;
      if (lastUser?.toLowerCase() === trimmed.toLowerCase()) {
        return current;
      }

      return [
        ...current,
        { role: "user", text: trimmed },
        { role: "assistant", text: "Thinking...", pending: true },
      ];
    });

    const reply = findReply(trimmed);
    const delay = Math.min(1400, 600 + trimmed.length * 25);
    window.setTimeout(() => {
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
    pushReply(input);
    setInput("");
  };

  if (!open) {
    return (
      <div className="pointer-events-auto fixed bottom-24 right-6 z-50">
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
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/20 md:hidden" onClick={() => setOpen(false)} />
      <div
        onClick={(event) => event.stopPropagation()}
        className="pointer-events-auto fixed left-4 right-4 bottom-4 top-6 z-50 mx-auto w-full max-w-sm overflow-hidden rounded-[28px] border border-[#E5E2DA] bg-white shadow-[0_22px_54px_rgba(17,17,17,0.14)] md:left-auto md:right-6 md:bottom-6 md:top-auto md:w-[22rem] md:max-h-[calc(100vh-6rem)]"
      >
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
        <div className="max-h-[calc(100vh-22rem)] md:max-h-[24rem] space-y-3 overflow-y-auto px-5 py-4">
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
    </div>
  );
}
