import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
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
  UserRound,
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
  { label: "Track a shipment", href: "/track" },
  { label: "Shipments (staff)", href: "/shipments" },
  { label: "Settings", href: "/settings" },
  { label: "Login Portal", href: "/login" },
  { label: "Client Portal", href: "/client" },
  { label: "Staff Operations", href: "/staff" },
  { label: "Admin Console", href: "/admin" },
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
      { label: "Who It's For", href: "/who-its-for" },
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
  "/who-its-for": {
    title: "Who It's For | BuySmart Procurement Limited",
    description:
      "See how BuySmart supports small business owners, bulk buyers, personal shoppers, personal-use buyers, and companies, schools and offices.",
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
  "/track": {
    title: "Track shipment | BuySmart Procurement Limited",
    description: "Track your BuySmart shipment by tracking ID — no login required.",
  },
  "/shipments": {
    title: "Staff portal — Shipments | BuySmart Procurement Limited",
    description: "BuySmart staff shipment tracker. Staff passphrase required.",
  },
  "/settings": {
    title: "Settings | BuySmart Procurement Limited",
    description: "BuySmart app settings: backend URL, features, and default invoice terms.",
  },
  "/cookie-policy": {
    title: "Cookie Policy | BuySmart Procurement Limited",
    description: "Learn how BuySmart uses cookies, pixels, and similar technologies — including GA4, Meta Pixel, and TikTok Pixel.",
  },
  "/company-policy": {
    title: "Company Policy | BuySmart Procurement Limited",
    description: "Read BuySmart's company policy covering procurement process, order specifications, shipping charges, payment terms, cancellations, and dispute resolution.",
  },
  "/login": {
    title: "Login Portal | BuySmart Procurement Limited",
    description: "Sign in to BuySmart Client Portal, Staff Operations Desk, or Founder Admin Console.",
  },
  "/admin": {
    title: "Admin and Founder Console | BuySmart Procurement Limited",
    description: "BuySmart Founder and Executive Management Dashboard - Invoice and Official Receipt Generator.",
  },
  "/staff": {
    title: "Staff Operations Desk | BuySmart Procurement Limited",
    description: "BuySmart Staff and Logistics Worker Desk for package intake, tracking milestones, and client handling.",
  },
  "/client": {
    title: "Client Portal | BuySmart Procurement Limited",
    description: "BuySmart Client Portal - Track live air and sea shipments, view invoices, download official receipts, and request factory quotes.",
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
  switch (name) {
    case "WhatsApp":
      return <WhatsAppBrandIcon className="h-5 w-5" />;
    case "LinkedIn":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case "Facebook":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case "Instagram":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/>
        </svg>
      );
    case "Google Business":
      return <MapPin className="h-4 w-4" />;
    case "Telegram":
      return <Send className="h-4 w-4" />;
    default:
      return <MapPin className="h-4 w-4" />;
  }
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
  const pdfHref = "/media/buysmart-company-profile-20260810-234900.pdf";

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
            onClick={() => onNavigate("/login")}
            className="inline-flex items-center gap-2 rounded-full border border-[#DED9CF] bg-white px-5 py-3 text-sm font-semibold text-[#111111] shadow-sm transition hover:border-[#C9A227] hover:text-[#C9A227]"
          >
            <UserRound className="h-4 w-4 text-[#C9A227]" />
            <span>Login</span>
          </button>
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
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#ECE8DF]">
              <button
                type="button"
                onClick={() => {
                  onNavigate("/login");
                  setMenuOpen(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DED9CF] bg-white px-4 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#C9A227] cursor-pointer"
              >
                <UserRound className="h-4 w-4 text-[#C9A227]" />
                <span>Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onRequestQuote();
                  setMenuOpen(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: gold }}
              >
                <span>Request Quote</span>
              </button>
            </div>
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

/** Only the destinations a visitor actually needs — the full sitemap lives in the menu. */
const footerLinks = [
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Recent projects", href: "/recent-projects" },
  { label: "Who it's for", href: "/who-its-for" },
  { label: "Shipping & rates", href: "/shipping-information" },
  { label: "Contact us", href: "/contact" },
];

export function Footer({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <footer className="border-t border-white/10 bg-[#111111] py-10">
      <Container className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-base font-bold tracking-[-0.02em] text-white">
                BuySmart
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: gold }}>
                Procurement Limited
              </div>
            </div>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
            Sourcing, verification, and delivery from China, Vietnam, and beyond — coordinated from Lagos.
          </p>
          <div className="mt-4">
            <SocialLinks />
          </div>
        </div>

        <nav aria-label="Footer">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Explore</div>
          <div className="mt-3 grid gap-2">
            {footerLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item.href);
                }}
                className="text-sm font-medium text-white/85 transition hover:text-[#C9A227]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Reach us</div>
          <div className="mt-3 grid gap-2.5">
            <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-sm text-white/85 transition hover:text-[#C9A227]">
              <Phone className="h-4 w-4 shrink-0" style={{ color: gold }} />
              {PHONE_DISPLAY}
            </a>
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-2.5 break-all text-sm text-white/85 transition hover:text-[#C9A227]">
              <Mail className="h-4 w-4 shrink-0" style={{ color: gold }} />
              {EMAIL}
            </a>
            <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 text-sm text-white/85 transition hover:text-[#C9A227]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: gold }} />
              <span>{ADDRESS_LINE_1}, {ADDRESS_LINE_2}</span>
            </a>
            <button
              type="button"
              onClick={() => onNavigate("/login")}
              className="mt-1 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:border-[#C9A227] hover:text-[#C9A227]"
            >
              <UserRound className="h-3.5 w-3.5" style={{ color: gold }} /> Client &amp; staff login
            </button>
          </div>
        </div>
      </Container>

      <Container className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {[
            { label: "Privacy", href: "/privacy-policy" },
            { label: "Cookies", href: "/cookie-policy" },
            { label: "Company policy", href: "/company-policy" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.href);
              }}
              className="transition hover:text-[#C9A227]"
            >
              {item.label}
            </a>
          ))}
        </span>
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
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </a>
  );
}


