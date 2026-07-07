import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Send,
  Star,
  X,
} from "lucide-react";
import {
  ADDRESS_LINE_1,
  ADDRESS_LINE_2,
  BUSINESS_NAME,
  EMAIL,
  GOOGLE_MAPS_URL,
  PHONE_DISPLAY,
  WA_GREETING,
  WA_PHONE,
  analyticsConfig,
  footerConsent,
  socialLinks,
  whyChoose,
} from "./content";

export type QuoteFormState = {
  name: string;
  phoneNumber: string;
  whatsappNumber: string;
  productLink: string;
  quantity: string;
  preferredShippingMethod: string;
  additionalInformation: string;
  contactPreference: "WhatsApp" | "Email";
  honeypot: string;
  productImageName: string;
};

export type RouteMeta = {
  title: string;
  description: string;
};

export const gold = "#C9A227";
export const dark = "#111111";
export const bodyText = "#4A4A4A";
export const cardBorder = "border-[#E5E2DA]";

export const pageLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Installment", href: "/installment-plan" },
  { label: "Shipping", href: "/shipping-information" },
  { label: "Estimator", href: "/shipment-cost-estimator" },
  { label: "Projects", href: "/recent-projects" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
];

export const homeSectionLinks = [
  { label: "What We Do", href: "/#what-we-do" },
  { label: "Verified in Lagos", href: "/#verified-lagos" },
  { label: "Gallery", href: "/#recent-imports" },
  { label: "Who It's For", href: "/#who-its-for" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

export const routeMeta: Record<string, RouteMeta> = {
  "/": {
    title: "BuySmart Procurement Limited | Procurement Services Lagos",
    description:
      "Premium procurement services in Lagos for sourcing, inspection, and shipping from China and Vietnam to Nigeria.",
  },
  "/services": {
    title: "Services | China Importation in Nigeria",
    description:
      "Explore BuySmart services for China importation in Nigeria, supplier verification, inspections, customs clearance, and delivery.",
  },
  "/installment-plan": {
    title: "Installment Purchase Plan | BuySmart",
    description:
      "Learn how BuySmart installment purchase plans work for hair products and approved general goods.",
  },
  "/shipping-information": {
    title: "Shipping Information | Air Freight Nigeria, Sea Freight Nigeria",
    description:
      "Understand air freight Nigeria and sea freight Nigeria timelines, volumetric weight, customs duties, and restricted items.",
  },
  "/shipment-cost-estimator": {
    title: "Shipment Cost Estimator | BuySmart",
    description:
      "Estimate chargeable weight and see a BuySmart shipping cost range for air or sea freight to Lagos and beyond.",
  },
  "/recent-projects": {
    title: "Recent Projects | BuySmart Imports Gallery",
    description:
      "See recent BuySmart imports across electronics, baby products, and general goods with proof media and delivery timelines.",
  },
  "/testimonials": {
    title: "Testimonials | BuySmart Reviews",
    description:
      "Read BuySmart customer reviews, longer success stories, and supporting proof from recent deliveries.",
  },
  "/faq": {
    title: "FAQ | BuySmart Procurement",
    description:
      "Find answers about shipping time, inspections, installments, refunds, destinations, and payment options.",
  },
  "/blog": {
    title: "Blog & Updates | BuySmart",
    description:
      "Read BuySmart articles on importation tips, shipping updates, market trends, new arrivals, and buying guides.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | BuySmart Procurement",
    description:
      "Read how BuySmart collects, uses, stores, and protects customer information under NDPR-aligned privacy terms.",
  },
};

export function normalizePath(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function createWhatsAppUrl(message: string) {
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
}

export function setMetaTag(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let meta = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement("meta");
    if (property) {
      meta.setAttribute("property", name);
    } else {
      meta.name = name;
    }
    document.head.appendChild(meta);
  }

  meta.content = content;
}

export function upsertLink(rel: string, href: string) {
  let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }

  link.href = href;
}

export function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Logo() {
  return <img src="/brand/logo.png" alt="BuySmart logo" className="h-11 w-11 rounded-2xl object-cover" />;
}

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={classNames("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}

export function SectionTag({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#D6C18A]/35 bg-white/95 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] shadow-[0_4px_12px_rgba(201,162,39,0.05)] backdrop-blur-sm" style={{ color: gold }}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      <span className="text-[#111111]/90">{children}</span>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  center,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  center?: boolean;
}) {
  return (
    <div className={classNames("mb-12", center && "text-center")}>
      <SectionTag>{eyebrow}</SectionTag>
      <h2
        className="max-w-3xl text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]"
        style={{ color: dark, fontFamily: "'Sora', sans-serif", marginInline: center ? "auto" : undefined }}
      >
        {title}
      </h2>
      {body ? (
        <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: bodyText, marginInline: center ? "auto" : undefined }}>
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function GoldCheck() {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border"
      style={{ borderColor: "rgba(201,162,39,0.24)", backgroundColor: "rgba(201,162,39,0.08)" }}
      aria-hidden="true"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2.75 7.35L5.55 10.15L11.25 4.45"
          stroke={gold}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function WhatsAppBrandIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 175.216 175.552"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#25D366"
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928Z"
      />
      <path
        fill="#FFF"
        fillRule="evenodd"
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
      />
    </svg>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === "WhatsApp") {
    return <WhatsAppBrandIcon className="h-5 w-5" />;
  }

  if (name === "Telegram") {
    return <Send className="h-4 w-4" />;
  }

  return <MapPin className="h-4 w-4" />;
}

export function SocialLinks({ compact = false }: { compact?: boolean }) {
  const enabledSocials = socialLinks.filter((item) => item.enabled);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {enabledSocials.map((item) => (
        <a
          key={item.name}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className={classNames(
            "inline-flex items-center justify-center rounded-full border border-[#E5E2DA] bg-white text-[#111111] transition hover:border-[#C9A227] hover:text-[#C9A227]",
            compact ? "h-9 w-9" : "h-10 w-10",
          )}
          aria-label={item.name}
          title={item.name}
        >
          <SocialIcon name={item.name} />
        </a>
      ))}
    </div>
  );
}

export function NavAnchor({
  href,
  label,
  currentPath,
  onNavigate,
  onClick,
}: {
  href: string;
  label: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  onClick?: () => void;
}) {
  const active = href === "/" ? currentPath === "/" : currentPath === href || currentPath.startsWith(`${href}/`);

  return (
    <a
      href={href}
      onClick={(event) => {
        if (href.startsWith("/#")) {
          onClick?.();
          return;
        }

        event.preventDefault();
        onNavigate(href);
        onClick?.();
      }}
      className={classNames(
        "text-sm font-medium transition",
        active ? "text-[#C9A227]" : "text-[#66615B] hover:text-[#C9A227]",
      )}
    >
      {label}
    </a>
  );
}

export function Header({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#ECE8DF] bg-[#FAFAF8]/95 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-6">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/");
            setMenuOpen(false);
          }}
          className="flex min-w-0 items-center gap-3"
        >
          <Logo />
          <div className="min-w-0">
            <div style={{ fontFamily: "'Sora', sans-serif" }} className="truncate text-[16px] font-bold tracking-[-0.02em] text-[#111111]">
              BuySmart
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: gold }}>
              Procurement Limited
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {pageLinks.map((item) => (
            <NavAnchor key={item.href} href={item.href} label={item.label} currentPath={currentPath} onNavigate={onNavigate} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <SocialLinks compact />
          <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="text-sm font-medium text-[#4A4A4A] transition hover:text-[#C9A227]">
            {PHONE_DISPLAY}
          </a>
          <a
            href={createWhatsAppUrl(WA_GREETING)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: gold }}
          >
            WhatsApp <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E2DA] bg-white text-[#111111] lg:hidden"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {menuOpen ? (
        <div className="border-t border-[#ECE8DF] bg-white lg:hidden">
          <Container className="flex flex-col gap-5 py-6">
            {pageLinks.map((item) => (
              <NavAnchor
                key={item.href}
                href={item.href}
                label={item.label}
                currentPath={currentPath}
                onNavigate={onNavigate}
                onClick={() => setMenuOpen(false)}
              />
            ))}
            <div className="border-t border-[#ECE8DF] pt-4">
              <div className="mb-3 text-xs uppercase tracking-[0.2em] text-[#7C746C]">Homepage sections</div>
              <div className="flex flex-col gap-3">
                {homeSectionLinks.map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-[#4A4A4A]">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="border-t border-[#ECE8DF] pt-4">
              <SocialLinks />
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

export function NewsletterSignup({
  inline = false,
  title = "Newsletter",
  body = "Get importation tips, shipping updates, and selected product updates in your inbox.",
}: {
  inline?: boolean;
  title?: string;
  body?: string;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const submitNewsletter = async (payload: {
    email: string;
    consent: boolean;
    source: string;
    website: string;
  }) => {
    if (!analyticsConfig.newsletterAction) {
      return {
        message: "You’re subscribed — you’ll hear from us occasionally with import tips and updates.",
      };
    }

    const fallbackEndpoint = analyticsConfig.newsletterAction || "/newsletter.php";
    const endpoints = ["/api/newsletter", fallbackEndpoint].filter(
      (endpoint, index, values) => endpoint && values.indexOf(endpoint) === index,
    );

    let lastError = "We couldn’t complete your signup right now. Please try again.";

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = (await response.json().catch(() => null)) as { message?: string; error?: string } | null;

        if (response.ok) {
          return result;
        }

        lastError = result?.error ?? lastError;

        if (response.status >= 500 || response.status === 404) {
          continue;
        }

        throw new Error(lastError);
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError;
      }
    }

    throw new Error(lastError);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (honeypot) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      setStatus("error");
      setFeedback("Enter a valid email address.");
      return;
    }

    if (!consent) {
      setStatus("error");
      setFeedback("Please confirm you want to receive the newsletter.");
      return;
    }

    setStatus("loading");
    setFeedback("");

    try {
      const payload = await submitNewsletter({
        email: normalizedEmail,
        consent: true,
        source: inline ? "inline-newsletter" : "site-newsletter",
        website: honeypot,
      });

      setStatus("success");
      setFeedback(
        payload?.message ??
          "You’re subscribed — you’ll hear from us occasionally with import tips and updates.",
      );
      setEmail("");
      setConsent(false);
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof Error
          ? error.message
          : "We couldn’t complete your signup right now. Please try again.",
      );
    }
  };

  const content = (
    <>
      <div className={classNames("text-xs uppercase tracking-[0.18em] text-[#7C746C]", inline && "text-[#8A8379]")}>{title}</div>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[#4A4A4A]">{body}</p>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <input
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
          className="hidden"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            className="min-w-0 flex-1 rounded-full border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: gold }}
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <label className="flex items-start gap-3 rounded-2xl border border-[#E5E2DA] bg-white px-4 py-3 text-sm leading-6 text-[#4A4A4A]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#CFC8BB] accent-[#C9A227]"
          />
          <span>Yes, I want occasional BuySmart emails about import tips, shipping updates, and selected product updates.</span>
        </label>
        {feedback ? (
          <p
            className={classNames(
              "text-sm leading-6",
              status === "success" ? "text-[#1F7A34]" : "text-[#B42318]",
            )}
            role={status === "error" ? "alert" : "status"}
          >
            {feedback}
          </p>
        ) : null}
      </form>
      <p className="mt-3 text-xs leading-6 text-[#7C746C]">{footerConsent}</p>
    </>
  );

  if (inline) {
    return (
      <div className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
        {content}
      </div>
    );
  }

  return content;
}

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const [form, setForm] = useState<QuoteFormState>({
    name: "",
    phoneNumber: "",
    whatsappNumber: "",
    productLink: "",
    quantity: "",
    preferredShippingMethod: "Air",
    additionalInformation: "",
    contactPreference: "WhatsApp",
    honeypot: "",
    productImageName: "",
  });

  const setField = (field: keyof QuoteFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const formattedMessage = useMemo(
    () =>
      [
        "New Quote Request",
        `Name: ${form.name}`,
        `Phone Number: ${form.phoneNumber}`,
        `WhatsApp Number: ${form.whatsappNumber}`,
        `Product Link: ${form.productLink}`,
        `Quantity: ${form.quantity}`,
        `Preferred Shipping Method: ${form.preferredShippingMethod}`,
        `Preferred Response: ${form.contactPreference}`,
        `Additional Information: ${form.additionalInformation || "Not provided"}`,
        `Product Image: ${form.productImageName || "No image attached"}`,
      ].join("\n"),
    [form],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (form.honeypot) {
      return;
    }

    if (form.contactPreference === "WhatsApp") {
      window.open(createWhatsAppUrl(formattedMessage), "_blank", "noopener,noreferrer");
      return;
    }

    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent("BuySmart Quote Request")}&body=${encodeURIComponent(formattedMessage)}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} className={classNames("grid gap-4", compact && "gap-3")}>
      <input
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        value={form.honeypot}
        onChange={(event) => setField("honeypot", event.target.value)}
        className="hidden"
      />
      {[
        ["Name", "name", "e.g. Emeka Okafor"],
        ["Phone Number", "phoneNumber", "e.g. 0810 013 0714"],
        ["WhatsApp Number", "whatsappNumber", "e.g. 0810 013 0714"],
        ["Product Link", "productLink", "Paste product link or short item description"],
        ["Quantity", "quantity", "e.g. 50 pieces"],
      ].map(([label, field, placeholder]) => (
        <label key={field} className="grid gap-2 text-sm font-medium text-[#111111]">
          {label}
          <input
            required={field !== "whatsappNumber"}
            value={form[field as keyof QuoteFormState]}
            onChange={(event) => setField(field as keyof QuoteFormState, event.target.value)}
            className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
            placeholder={placeholder}
          />
        </label>
      ))}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[#111111]">
          Preferred Shipping Method
          <select
            value={form.preferredShippingMethod}
            onChange={(event) => setField("preferredShippingMethod", event.target.value)}
            className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
          >
            <option>Air</option>
            <option>Sea</option>
            <option>Not sure yet</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-[#111111]">
          Response Preference
          <select
            value={form.contactPreference}
            onChange={(event) => setField("contactPreference", event.target.value as QuoteFormState["contactPreference"])}
            className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
          >
            <option>WhatsApp</option>
            <option>Email</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-[#111111]">
        Product Image (optional upload)
        <span className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-sm text-[#4A4A4A] transition hover:border-[#C9A227]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#C9A227]">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span className="flex-1">{form.productImageName || "Choose an image to reference in your quote request"}</span>
          <span className="rounded-full border border-[#E5E2DA] bg-white px-3 py-2 text-xs font-semibold text-[#111111]">Select file</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setField("productImageName", event.target.files?.[0]?.name ?? "")}
          />
        </span>
      </label>
      <label className="grid gap-2 text-sm font-medium text-[#111111]">
        Additional Information
        <textarea
          value={form.additionalInformation}
          onChange={(event) => setField("additionalInformation", event.target.value)}
          rows={4}
          className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
          placeholder="Add colour, size, quantity split, preferred delivery location, or any other details."
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: gold }}
      >
        Submit Request <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

export function WhyChooseGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {whyChoose.map((item) => (
        <div
          key={item}
          className={`flex items-center gap-3 rounded-[22px] border bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}
        >
          <GoldCheck />
          <span className="text-sm font-semibold text-[#111111]">{item}</span>
        </div>
      ))}
    </div>
  );
}

export function FaqList({
  items,
}: {
  items: Array<{
    question: string;
    answer: string;
  }>;
}) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <details
          key={item.question}
          className={`group rounded-[24px] border bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-[#111111]">
            <span>{item.question}</span>
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" style={{ color: gold }} />
          </summary>
          <p className="mt-4 text-sm leading-7 text-[#4A4A4A]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function TestimonialsPreview() {
  return (
    <section className="border-b border-[#EFEAE1] bg-white py-20">
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="Proof, reviews, and trust signals sit together instead of living in separate corners."
          body="The Google rating is integrated into the testimonial area so every review reinforces the rest of the social proof."
        />
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_18px_48px_rgba(17,17,17,0.06)] ${cardBorder}`}>
            <div className="text-xs uppercase tracking-[0.18em]" style={{ color: gold }}>
              Google rating
            </div>
            <div style={{ fontFamily: "'Sora', sans-serif" }} className="mt-3 text-6xl font-bold tracking-[-0.05em] text-[#111111]">
              5.0
            </div>
            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-[#C9A227] text-[#C9A227]" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-[#4A4A4A]">
              Integrated with written feedback and visual proof so the trust story feels cohesive, not pieced together.
            </p>
            <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#111111]">
              View business profile <ArrowRight className="h-4 w-4" style={{ color: gold }} />
            </a>
          </div>
          <div className={`rounded-[28px] border bg-white p-6 shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Written reviews and longer success stories",
                "Privacy-safe WhatsApp screenshot proof",
                "Customer photos and delivery visuals",
                "Trust reinforcement from the visible 5.0 rating",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#E5E2DA] bg-[#FAFAF8] p-4">
                  <GoldCheck />
                  <span className="text-sm leading-6 text-[#4A4A4A]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function ContactSection({ compact = false }: { compact?: boolean }) {
  return (
    <section id="contact" className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
      <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <SectionHeading
            eyebrow="Request a quote"
            title="Ready to order? Let BuySmart handle the sourcing, inspection, and shipping."
            body="Share your product link or description and BuySmart will review it, verify the sourcing path, and respond through your preferred contact channel."
          />
          <div className="grid gap-4">
            <div className={`rounded-2xl border bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4" style={{ color: gold }} />
                <div>
                  <div className="text-sm font-semibold text-[#111111]">{PHONE_DISPLAY}</div>
                  <div className="text-sm leading-6 text-[#4A4A4A]">Call or continue on WhatsApp for live support.</div>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl border bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-4 w-4" style={{ color: gold }} />
                <div>
                  <div className="text-sm font-semibold text-[#111111]">{EMAIL}</div>
                  <div className="text-sm leading-6 text-[#4A4A4A]">Email is available if the customer prefers a documented reply thread.</div>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl border bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4" style={{ color: gold }} />
                <div>
                  <div className="text-sm font-semibold text-[#111111]">
                    {ADDRESS_LINE_1}, {ADDRESS_LINE_2}
                  </div>
                  <div className="text-sm leading-6 text-[#4A4A4A]">Delivery support is coordinated from Lagos, with onward arrangement outside Lagos where needed.</div>
                </div>
              </div>
            </div>
            {!compact ? <NewsletterSignup inline title="Newsletter updates" body="Join the BuySmart newsletter to receive import tips, shipping updates, and product news. Each signup is also sent to the business email for follow-up." /> : null}
          </div>
        </div>

        <div className={`rounded-[30px] border bg-white p-6 shadow-[0_18px_48px_rgba(17,17,17,0.06)] ${cardBorder}`}>
          <div className="mb-5 text-xl font-bold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
            Request a Quote
          </div>
          <QuoteForm compact={compact} />
        </div>
      </Container>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="py-16" style={{ backgroundColor: "rgba(201,162,39,0.12)" }}>
      <Container>
        <div className={`flex flex-col gap-6 rounded-[32px] border bg-white p-8 shadow-[0_18px_48px_rgba(17,17,17,0.05)] lg:flex-row lg:items-center lg:justify-between ${cardBorder}`}>
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D6C18A] bg-[#FAFAF8] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7C746C]">
              <CalendarDays className="h-4 w-4" style={{ color: gold }} />
              Ready to order
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#111111]">
              Ready to Buy from China or Vietnam?
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#4A4A4A]">
              Let BuySmart handle the sourcing, inspection, and shipping while you focus on your business.
            </p>
          </div>
          <a
            href="/#contact"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: gold }}
          >
            Request a Quote <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </Container>
    </section>
  );
}

export function Footer({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <footer className="border-t border-[#ECE8DF] bg-white py-14">
      <Container className="grid gap-10 lg:grid-cols-[1fr_0.8fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-lg font-bold tracking-[-0.02em] text-[#111111]">
                {BUSINESS_NAME}
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: gold }}>
                Procurement services
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#4A4A4A]">
            Built as a premium, responsive procurement site with published service detail, clear FAQs, proof-backed projects, and direct lead capture.
          </p>
          <div className="mt-6">
            <SocialLinks />
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Pages</div>
          <div className="mt-4 grid gap-3">
            {[...pageLinks, { label: "Privacy Policy", href: "/privacy-policy" }].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item.href);
                }}
                className="text-sm font-medium text-[#4A4A4A] transition hover:text-[#C9A227]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Contact</div>
            <div className="mt-4 grid gap-4">
              <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="flex items-start gap-3 text-sm text-[#4A4A4A]">
                <Phone className="mt-1 h-4 w-4" style={{ color: gold }} />
                <span>{PHONE_DISPLAY}</span>
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-start gap-3 text-sm text-[#4A4A4A]">
                <Mail className="mt-1 h-4 w-4" style={{ color: gold }} />
                <span>{EMAIL}</span>
              </a>
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-sm text-[#4A4A4A]">
                <MapPin className="mt-1 h-4 w-4" style={{ color: gold }} />
                <span>
                  {ADDRESS_LINE_1}, {ADDRESS_LINE_2}
                </span>
              </a>
              <div className="flex items-start gap-3 text-sm text-[#4A4A4A]">
                <CircleHelp className="mt-1 h-4 w-4" style={{ color: gold }} />
                <span>{footerConsent}</span>
              </div>
            </div>
          </div>
          <NewsletterSignup title="Newsletter signup" body="Subscribe for importation tips, shipping updates, market trends, and selected product updates." />
        </div>
      </Container>
      <Container className="mt-10 border-t border-[#ECE8DF] pt-6 text-xs text-[#7C746C]">
        © {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
      </Container>
    </footer>
  );
}
