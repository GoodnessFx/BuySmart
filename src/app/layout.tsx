import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Download,
  ExternalLink,
  FileText,
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
  { label: "About Us", href: "/about-us" },
  { label: "Company Profile", href: "/company-profile" },
  { label: "Installment", href: "/installment-plan" },
  { label: "Shipping", href: "/shipping-information" },
  { label: "Estimator", href: "/shipment-cost-estimator" },
  { label: "Projects", href: "/recent-projects" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
  { label: "Why Choose Us", href: "/why-choose-us" },
  { label: "Verified in Lagos", href: "/verified-lagos" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Contact Us", href: "/contact" },
];

export type MenuItem = {
  label: string;
  href: string;
};

export type MenuGroup = {
  label: string;
  links: MenuItem[];
};

export const menuGroups: MenuGroup[] = [
  {
    label: "Services",
    links: [
      { label: "Our Services", href: "/services" },
      { label: "Order Process", href: "/how-it-works" },
      { label: "Installment Plan", href: "/installment-plan" },
    ],
  },
  {
    label: "Shipping",
    links: [
      { label: "Shipping Info", href: "/shipping-information" },
      { label: "Cost Estimator", href: "/shipment-cost-estimator" },
      { label: "Recent Imports", href: "/recent-projects" },
    ],
  },
  {
    label: "About Us",
    links: [
      { label: "About BuySmart", href: "/about-us" },
      { label: "Company Profile", href: "/company-profile" },
      { label: "Why Choose Us", href: "/why-choose-us" },
      { label: "Verified in Lagos", href: "/verified-lagos" },
      { label: "Testimonials", href: "/testimonials" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "FAQs", href: "/faq" },
      { label: "Blog & Updates", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
      { label: "Company Policy", href: "/company-policy" },
    ],
  },
];

export const homeSectionLinks = [
  { label: "What We Do", href: "/#what-we-do" },
];

export const routeMeta: Record<string, RouteMeta> = {
  "/": {
    title: "BuySmart Procurement Limited | Global Procurement Services",
    description:
      "BuySmart provides global procurement solutions — sourcing, supplier verification, inspection, logistics coordination, and import/export support, with deep expertise in China and Vietnam sourcing.",
  },
  "/services": {
    title: "Services | BuySmart Procurement Limited",
    description:
      "Explore BuySmart procurement services — strategic sourcing, supplier verification and audits, quality inspection, logistics coordination, import/export support, and complete procurement solutions. China and Vietnam remain a core strength.",
  },
  "/about-us": {
    title: "About Us | BuySmart Procurement Limited",
    description:
      "Learn how BuySmart supports long-term procurement and supply needs with global capability and deep China and Vietnam sourcing expertise.",
  },
  "/company-profile": {
    title: "Company Profile | BuySmart Procurement Limited",
    description:
      "View or download BuySmart’s company profile PDF — services, process, and global procurement capability.",
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
  "/projects": {
    title: "Projects | BuySmart Imports Gallery",
    description:
      "Browse all BuySmart projects — electronics, baby products, and general goods with proof media and delivery timelines.",
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
  "/why-choose-us": {
    title: "Why Choose BuySmart | Sourcing & Shipping",
    description: "Learn why BuySmart is the trusted sourcing and shipping partner for Nigerian business owners and bulk buyers.",
  },
  "/verified-lagos": {
    title: "Verified in Lagos | BuySmart Trust & Location",
    description: "Check BuySmart's business CAC registration, Google reviews, and Egbeda Lagos location map profile.",
  },
  "/how-it-works": {
    title: "How It Works | Order Process Step-by-Step",
    description: "Understand the five simple steps from submitting your product link or description to handoff delivery in Nigeria.",
  },
  "/contact": {
    title: "Contact Us | BuySmart Procurement Limited",
    description: "Request a quote through BuySmartAi or contact BuySmart by phone or email for procurement support.",
  },
  "/cookie-policy": {
    title: "Cookie Policy | BuySmart Procurement Limited",
    description: "Learn how BuySmart uses cookies, pixels, and similar technologies — including GA4, Meta Pixel, and TikTok Pixel.",
  },
  "/company-policy": {
    title: "Company Policy | BuySmart Procurement Limited",
    description: "Read BuySmart's company policy covering procurement process, order specifications, shipping charges, payment terms, cancellations, and dispute resolution.",
  },
  "/request-quote": {
    title: "Request a Quote | BuySmart Procurement Limited",
    description: "Submit a structured quote request through BuySmartAi. Tell us what you need, your quantity, destination, and timeline — we'll respond fast.",
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
  return <img src="/brand/logo.png" alt="BuySmart logo" className="h-11 w-11 object-contain" />;
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
        className="max-w-3xl text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.04em]"
        style={{ color: dark, fontFamily: "'Sora', sans-serif", marginInline: center ? "auto" : undefined }}
      >
        {title}
      </h2>
      {body ? (
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed" style={{ color: bodyText, marginInline: center ? "auto" : undefined }}>
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

export function CompanyProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pdfHref = "/media/buysmart-company-profile.pdf";

  if (!open) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-[#E5E2DA] bg-white shadow-[0_30px_80px_rgba(17,17,17,0.28)]">
        <div className="flex items-center justify-between border-b border-[#EFEAE1] bg-[#FAFAF8] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" style={{ color: gold }}>
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
                Company Profile
              </div>
              <div className="text-xs text-[#7C746C]">BuySmart Procurement Limited</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E2DA] bg-white text-[#111111] transition hover:border-[#C9A227]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <p className="text-sm leading-7 text-[#4A4A4A]">
            Choose how you'd like to access the company profile document.
          </p>

          <a
            href={pdfHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#E5E2DA] bg-[#FAFAF8] px-5 py-4 text-sm font-semibold text-[#111111] transition hover:border-[#C9A227]"
          >
            <ExternalLink className="h-4 w-4" style={{ color: gold }} />
            View in browser
          </a>

          <a
            href={pdfHref}
            download
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center gap-3 rounded-full px-5 py-4 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: gold }}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}

export function Header({
  currentPath,
  onNavigate,
  onRequestQuote,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
  onRequestQuote: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMobileGroup, setActiveMobileGroup] = useState<string | null>(null);
  const [activeDesktopGroup, setActiveDesktopGroup] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-[#ECE8DF] bg-[#FAFAF8]/95 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-6">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/");
            setMenuOpen(false);
          }}
          className="flex min-w-0 items-center gap-1"
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

        <nav className="hidden items-center gap-7 lg:flex">
          <NavAnchor href="/" label="Home" currentPath={currentPath} onNavigate={onNavigate} />
          {menuGroups.map((group) => {
            const isGroupActive = group.links.some(
              (link) => link.href === currentPath || (link.href !== "/" && currentPath.startsWith(link.href))
            );
            const isDesktopOpen = activeDesktopGroup === group.label;

            return (
              <div 
                key={group.label} 
                className="relative group py-2"
                onMouseEnter={() => setActiveDesktopGroup(group.label)}
                onMouseLeave={() => setActiveDesktopGroup(null)}
              >
                <button
                  type="button"
                  onClick={() => setActiveDesktopGroup(isDesktopOpen ? null : group.label)}
                  className={classNames(
                    "flex items-center gap-1.5 text-sm font-semibold transition cursor-pointer outline-none bg-transparent border-none",
                    isGroupActive ? "text-[#C9A227]" : "text-[#66615B] hover:text-[#C9A227]"
                  )}
                >
                  {group.label}
                  <ChevronDown className={classNames("h-3.5 w-3.5 transition duration-200", isDesktopOpen ? "rotate-180" : "group-hover:rotate-180")} />
                </button>

                {/* Dropdown Menu */}
                <div className={classNames(
                  "absolute top-full left-1/2 -translate-x-1/2 z-50 pt-2 w-52 transition-all duration-200 ease-out transform",
                  isDesktopOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"
                )}>
                  <div className="rounded-2xl border border-[#ECE8DF] bg-white p-2.5 shadow-[0_12px_32px_rgba(17,17,17,0.08)]">
                    {group.links.map((link) => {
                      const isLinkActive = currentPath === link.href;
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={(event) => {
                            event.preventDefault();
                            onNavigate(link.href);
                            setActiveDesktopGroup(null);
                          }}
                          className={classNames(
                            "block rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                            isLinkActive
                              ? "bg-[#C9A227]/10 text-[#C9A227]"
                              : "text-[#4A4A4A] hover:bg-[#FAFAF8] hover:text-[#C9A227]"
                          )}
                        >
                          {link.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <SocialLinks compact />
          <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="text-sm font-medium text-[#4A4A4A] transition hover:text-[#C9A227]">
            {PHONE_DISPLAY}
          </a>
          <button
            type="button"
            onClick={onRequestQuote}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: gold }}
          >
            Request a Quote <ArrowRight className="h-4 w-4" />
          </button>
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
          <Container className="flex flex-col gap-4 py-6">
            <NavAnchor
              href="/"
              label="Home"
              currentPath={currentPath}
              onNavigate={onNavigate}
              onClick={() => setMenuOpen(false)}
            />
            
            {menuGroups.map((group) => {
              const isGroupOpen = activeMobileGroup === group.label;
              const isGroupActive = group.links.some(
                (link) => link.href === currentPath || (link.href !== "/" && currentPath.startsWith(link.href))
              );

              return (
                <div key={group.label} className="border-t border-[#FAFAF8] pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveMobileGroup(isGroupOpen ? null : group.label)}
                    className={classNames(
                      "flex w-full items-center justify-between py-2 text-sm font-semibold transition cursor-pointer text-left bg-transparent border-none outline-none",
                      isGroupActive ? "text-[#C9A227]" : "text-[#4A4A4A] hover:text-[#C9A227]"
                    )}
                  >
                    <span>{group.label}</span>
                    <ChevronDown className={classNames("h-4 w-4 transition-transform duration-200", isGroupOpen && "rotate-180")} />
                  </button>
                  {isGroupOpen ? (
                    <div className="mt-1 flex flex-col gap-2.5 border-l border-[#ECE8DF] pl-4 py-1">
                      {group.links.map((link) => {
                        const isLinkActive = currentPath === link.href;
                        return (
                          <a
                            key={link.href}
                            href={link.href}
                            onClick={(event) => {
                              event.preventDefault();
                              onNavigate(link.href);
                              setMenuOpen(false);
                            }}
                            className={classNames(
                              "block py-1 text-sm font-medium transition",
                              isLinkActive ? "text-[#C9A227]" : "text-[#66615B] hover:text-[#C9A227]"
                            )}
                          >
                            {link.label}
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}

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
  dark = false,
  title = "Newsletter",
  body = "Get importation tips, shipping updates, and selected product updates in your inbox.",
}: {
  inline?: boolean;
  dark?: boolean;
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
      <div className={classNames("text-xs uppercase tracking-[0.18em]", dark ? "text-white/70" : "text-[#7C746C]", inline && !dark && "text-[#8A8379]")}>{title}</div>
      <p className={classNames("mt-3 max-w-xl text-sm leading-7", dark ? "text-white/80" : "text-[#4A4A4A]")}>{body}</p>
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
            className={classNames(
              "min-w-0 flex-1 rounded-full px-4 py-3 text-sm outline-none transition focus:border-[#C9A227]",
              dark
                ? "border-white/20 bg-white/5 text-white placeholder-white/40 focus:border-[#C9A227]"
                : "border-[#DED9CF] bg-white text-[#111111] focus:border-[#C9A227]"
            )}
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
        <label className={classNames(
          "flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-6",
          dark
            ? "border-white/10 bg-white/5 text-white/80"
            : "border-[#E5E2DA] bg-white text-[#4A4A4A]"
        )}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className={classNames(
              "mt-1 h-4 w-4 rounded accent-[#C9A227]",
              dark ? "border-white/30 bg-white/5" : "border-[#CFC8BB] bg-white"
            )}
          />
          <span>Yes, I want occasional BuySmart emails about import tips, shipping updates, and selected product updates.</span>
        </label>
        {feedback ? (
          <p
            className={classNames(
              "text-sm leading-6",
              status === "success" ? (dark ? "text-green-400" : "text-[#1F7A34]") : (dark ? "text-red-400" : "text-[#B42318]"),
            )}
            role={status === "error" ? "alert" : "status"}
          >
            {feedback}
          </p>
        ) : null}
      </form>
      <p className={classNames("mt-3 text-xs leading-6", dark ? "text-white/50" : "text-[#7C746C]")}>{footerConsent}</p>
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

  const sendQuoteToCompany = async () => {
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          phoneNumber: form.phoneNumber,
          whatsappNumber: form.whatsappNumber,
          productLink: form.productLink,
          quantity: form.quantity,
          preferredShippingMethod: form.preferredShippingMethod,
          contactPreference: form.contactPreference,
          additionalInformation: form.additionalInformation,
          productImageName: form.productImageName,
          requestedAt: new Date().toISOString(),
          honeypot: form.honeypot,
        }),
      });
    } catch (error) {
      console.error("Failed to send quote request to company email:", error);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.honeypot) {
      return;
    }

    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent("BuySmart Quote Request")}&body=${encodeURIComponent(formattedMessage)}`;

    if (form.contactPreference === "WhatsApp") {
      window.open(createWhatsAppUrl(formattedMessage), "_blank", "noopener,noreferrer");
      sendQuoteToCompany();
      return;
    }

    await sendQuoteToCompany();
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className={`rounded-[24px] border bg-white shadow-[0_10px_24px_rgba(17,17,17,0.03)] overflow-hidden transition-all duration-300 ${cardBorder}`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left text-base font-semibold text-[#111111] cursor-pointer"
            >
              <span>{item.question}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} style={{ color: gold }} />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
            >
              <p className="px-5 pb-5 text-sm leading-7 text-[#4A4A4A]">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TestimonialsPreview() {
  return (
    <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
      <Container>
        <div className="mb-10">
          <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
            Proof, reviews, and trust signals sit together instead of living in separate <span style={{ color: gold }}>corners.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
            The Google rating is integrated into the testimonial area so every review reinforces the rest of the social proof.
          </p>
        </div>
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
    <section id="contact" className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
      <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-6">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Ready to order? Let BuySmart handle the sourcing, verification, and <span style={{ color: gold }}>delivery.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
              Submit a structured quote request through BuySmartAi. You’ll get a response with next steps and pricing during business hours.
            </p>
          </div>
          <div className="grid gap-4">
            <div className={`rounded-2xl border bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4" style={{ color: gold }} />
                <div>
                  <div className="text-sm font-semibold text-[#111111]">{PHONE_DISPLAY}</div>
                  <div className="text-sm leading-6 text-[#4A4A4A]">Call for urgent clarifications or follow-up.</div>
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
          </div>
        </div>

        <div className={`rounded-[30px] border bg-white p-6 shadow-[0_18px_48px_rgba(17,17,17,0.06)] ${cardBorder}`}>
          <div className="mb-5 text-xl font-bold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
            Request a Quote
          </div>
          <div className="mb-6 rounded-2xl border border-[#C9A227]/20 bg-[#FBF6E8] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: gold }}>
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#111111]">Quick guided quote via BuySmartAi</div>
                <p className="mt-1 text-xs leading-6 text-[#4A4A4A]">Answer four short questions and we&rsquo;ll respond fast.</p>
                <a
                  href="/request-quote"
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("buysmartai:open"));
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ color: gold }}
                >
                  Start BuySmartAi <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E2DA]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.18em] text-[#7C746C]">
              <span className="bg-white px-3">or use the full form</span>
            </div>
          </div>

          <QuoteForm compact />
        </div>
      </Container>
    </section>
  );
}

export function CtaBanner() {
  return (
    <section className="py-8 lg:py-12" style={{ backgroundColor: "rgba(201,162,39,0.12)" }}>
      <Container>
        <div className={`flex flex-col gap-6 rounded-[32px] border bg-white p-8 shadow-[0_18px_48px_rgba(17,17,17,0.05)] lg:flex-row lg:items-center lg:justify-between ${cardBorder}`}>
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D6C18A] bg-[#FAFAF8] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7C746C]">
              <CalendarDays className="h-4 w-4" style={{ color: gold }} />
              Ready to order
            </div>
            <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#111111]">
              Ready to source globally?
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#4A4A4A]">
              Submit a quote request and we’ll handle sourcing, verification, inspection, and delivery. China and Vietnam remain our strongest sourcing region.
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
    <footer className="border-t border-white/10 bg-[#111111] py-8 lg:py-12">
      <Container className="grid gap-10 lg:grid-cols-[1fr_0.8fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-lg font-bold tracking-[-0.02em] text-white">
                {BUSINESS_NAME}
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: gold }}>
                Procurement services
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/90">
            BuySmart provides global procurement support — sourcing, supplier verification, inspection, and logistics coordination — with deep expertise in China and Vietnam sourcing and delivery support coordinated from Lagos.
          </p>
          <div className="mt-6">
            <SocialLinks />
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white">Pages</div>
          <div className="mt-4 grid gap-3">
            {[...pageLinks, { label: "Privacy Policy", href: "/privacy-policy" }, { label: "Cookie Policy", href: "/cookie-policy" }, { label: "Company Policy", href: "/company-policy" }].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item.href);
                }}
                className="text-sm font-medium !text-white transition hover:text-[#C9A227]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/70">Contact</div>
            <div className="mt-4 grid gap-4">
              <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="flex items-start gap-3 text-sm text-white">
                <Phone className="mt-1 h-4 w-4" style={{ color: gold }} />
                <span className="text-white">{PHONE_DISPLAY}</span>
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-start gap-3 text-sm text-white">
                <Mail className="mt-1 h-4 w-4" style={{ color: gold }} />
                <span className="text-white">{EMAIL}</span>
              </a>
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-sm text-white">
                <MapPin className="mt-1 h-4 w-4" style={{ color: gold }} />
                <span className="text-white">
                  {ADDRESS_LINE_1}, {ADDRESS_LINE_2}
                </span>
              </a>
              <div className="flex items-start gap-3 text-sm text-white">
                <CircleHelp className="mt-1 h-4 w-4" style={{ color: gold }} />
                <span className="text-white">{footerConsent}</span>
              </div>
            </div>
          </div>
          <NewsletterSignup dark title="Newsletter signup" body="Subscribe for importation tips, shipping updates, market trends, and selected product updates." />
        </div>
      </Container>
      <Container className="mt-10 border-t border-white/10 pt-6 text-xs text-white/70">
        © {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
      </Container>
    </footer>
  );
}

export function AnnouncementBar({ onNavigate }: { onNavigate: (path: string) => void }) {
  const message = "Please read and go through the company policy";

  return (
    <a
      href="/company-policy"
      onClick={(event) => {
        event.preventDefault();
        onNavigate("/company-policy");
      }}
      className="relative w-full overflow-hidden bg-gradient-to-r from-transparent via-white/5 to-transparent border-b border-white/5 py-2"
      role="region"
      aria-label="Announcement"
    >
      <span
        className="inline-block whitespace-nowrap"
        style={{
          fontFamily: "'Sora', sans-serif",
          color: "#C9A227",
          fontWeight: "500",
          fontSize: "0.875rem",
          letterSpacing: "0.02em",
          animation: "marquee 25s linear infinite",
        }}
      >
        {message}
      </span>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </a>
  );
}
