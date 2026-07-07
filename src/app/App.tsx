import { useEffect, useMemo, useState } from "react";
import { analyticsConfig, faqItems, galleryItems, SITE_URL, socialLinks } from "./content";
import { AssistantWidget, FloatingWhatsAppButton } from "./assistant";
import { Footer, Header, normalizePath, routeMeta, setMetaTag, upsertLink } from "./layout";
import {
  BlogPage,
  BlogPostPage,
  EstimatorPage,
  FaqPage,
  HomePage,
  InstallmentPage,
  PrivacyPage,
  ProjectsPage,
  ServicesPage,
  ShippingPage,
  TestimonialsPage,
} from "./pages";
import { getPostBySlug } from "./blog";

function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "BuySmart Procurement Limited",
    url: SITE_URL,
    image: `${SITE_URL}/brand/logo.png`,
    telephone: "+2348100130714",
    email: "kingsleyglory272@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "6 Bassey Street, Egbeda",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    sameAs: socialLinks.filter((item) => item.enabled).map((item) => item.url),
  };
}

function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildProjectsSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: galleryItems
      .filter((item) => item.mediaType === "image")
      .map((item, index) => ({
        "@type": "Product",
        position: index + 1,
        name: item.title,
        description: item.caption,
        category: item.category,
        image: `${SITE_URL}${item.media}`,
        brand: {
          "@type": "Brand",
          name: "BuySmart Procurement Limited",
        },
      })),
  };
}

function injectAnalyticsScripts() {
  if (analyticsConfig.ga4Id && !document.head.querySelector(`script[data-ga4="${analyticsConfig.ga4Id}"]`)) {
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.ga4Id}`;
    gaScript.dataset.ga4 = analyticsConfig.ga4Id;
    document.head.appendChild(gaScript);

    const gaInline = document.createElement("script");
    gaInline.dataset.ga4Inline = analyticsConfig.ga4Id;
    gaInline.text = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${analyticsConfig.ga4Id}');`;
    document.head.appendChild(gaInline);
  }

  if (analyticsConfig.metaPixelId && !document.head.querySelector(`script[data-meta-pixel="${analyticsConfig.metaPixelId}"]`)) {
    const metaPixel = document.createElement("script");
    metaPixel.dataset.metaPixel = analyticsConfig.metaPixelId;
    metaPixel.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${analyticsConfig.metaPixelId}');
    fbq('track', 'PageView');`;
    document.head.appendChild(metaPixel);
  }

  if (analyticsConfig.tikTokPixelId && !document.head.querySelector(`script[data-tiktok-pixel="${analyticsConfig.tikTokPixelId}"]`)) {
    const tikTokPixel = document.createElement("script");
    tikTokPixel.dataset.tiktokPixel = analyticsConfig.tikTokPixelId;
    tikTokPixel.text = `!function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
      ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
      o.type="text/javascript";o.async=!0;o.src=r+"?sdkid="+e+"&lib="+t;
      var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${analyticsConfig.tikTokPixelId}');
      ttq.page();
    }(window, document, 'ttq');`;
    document.head.appendChild(tikTokPixel);
  }

  if (analyticsConfig.searchConsoleVerification) {
    setMetaTag("google-site-verification", analyticsConfig.searchConsoleVerification);
  }
}

export default function App() {
export default function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", phone: "", itemLink: "", quantity: "", message: "" });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success" | "error">("idle");
  const [newsletterError, setNewsletterError] = useState("");


  useEffect(() => {
    const handlePopState = () => setCurrentPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    injectAnalyticsScripts();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.querySelector(hash);
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [currentPath]);

  const activePost = currentPath.startsWith("/blog/") ? getPostBySlug(currentPath.replace("/blog/", "")) : null;

  const activeMeta = useMemo(() => {
    if (activePost) {
      return {
        title: `${activePost.title} | BuySmart Blog`,
        description: activePost.excerpt,
      };
    }

    return routeMeta[currentPath] ?? routeMeta["/"];
  }, [activePost, currentPath]);

  useEffect(() => {
    document.title = activeMeta.title;
    setMetaTag("description", activeMeta.description);
    setMetaTag("theme-color", "#FAFAF8");
    setMetaTag("og:title", activeMeta.title, true);
    setMetaTag("og:description", activeMeta.description, true);
    setMetaTag("og:type", activePost ? "article" : "website", true);
    setMetaTag("og:url", `${SITE_URL}${currentPath === "/" ? "" : currentPath}`, true);
    setMetaTag("og:image", `${SITE_URL}/brand/logo.png`, true);
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", activeMeta.title);
    setMetaTag("twitter:description", activeMeta.description);
    upsertLink("canonical", `${SITE_URL}${currentPath === "/" ? "" : currentPath}`);
    upsertLink("icon", `${SITE_URL}/brand/favicon.png`);

    const schemaId = "buysmart-schema";
    let schemaElement = document.getElementById(schemaId) as HTMLScriptElement | null;

    if (!schemaElement) {
      schemaElement = document.createElement("script");
      schemaElement.type = "application/ld+json";
      schemaElement.id = schemaId;
      document.head.appendChild(schemaElement);
    }

    const schemas: object[] = [buildLocalBusinessSchema()];

    if (currentPath === "/faq") {
      schemas.push(buildFaqSchema());
    }

    if (currentPath === "/recent-projects") {
      schemas.push(buildProjectsSchema());
    }

    if (activePost) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: activePost.title,
        description: activePost.excerpt,
        url: `${SITE_URL}/blog/${activePost.slug}`,
        author: {
          "@type": "Organization",
          name: "BuySmart Procurement Limited",
        },
      });
    }

    schemaElement.text = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
  }, [activeMeta.description, activeMeta.title, activePost, currentPath]);

  const navigate = (path: string) => {
    const normalized = normalizePath(path);
    if (normalized === currentPath) {
      if (!window.location.hash) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    window.history.pushState({}, "", normalized);
    setCurrentPath(normalized);
  };

  const renderPage = () => {
    if (currentPath.startsWith("/blog/")) {
      return <BlogPostPage slug={currentPath.replace("/blog/", "")} />;
    }

<<<<<<< HEAD
    switch (currentPath) {
      case "/services":
        return <ServicesPage />;
      case "/installment-plan":
        return <InstallmentPage />;
      case "/shipping-information":
        return <ShippingPage />;
      case "/shipment-cost-estimator":
        return <EstimatorPage />;
      case "/recent-projects":
        return <ProjectsPage />;
      case "/testimonials":
        return <TestimonialsPage />;
      case "/faq":
        return <FaqPage />;
      case "/blog":
        return <BlogPage />;
      case "/privacy-policy":
        return <PrivacyPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAFAF8]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header currentPath={currentPath} onNavigate={navigate} />
      {renderPage()}
      <Footer onNavigate={navigate} />
      <AssistantWidget />
      <FloatingWhatsAppButton />
=======
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      setNewsletterStatus("error");
      setNewsletterError("Please enter a valid email address.");
      return;
    }

    setNewsletterStatus("success");
    setNewsletterError("");
    setNewsletterEmail("");
  };

  const handleNewsletterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewsletterEmail(e.target.value);
    if (newsletterStatus !== "idle") {
      setNewsletterStatus("idle");
      setNewsletterError("");
    }
  };

  const NAV = ["Services", "How It Works", "Trust", "Contact"];

  return (
    <div
      className="min-h-screen overflow-x-clip bg-[#0D0D0D] text-[#F7F5F0]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >

      {/* ===========================
          STICKY HEADER
      =========================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/96 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href="#" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 flex-shrink-0 min-w-0">
            <div className="w-9 h-9 rounded-full border border-[#C9A227] flex items-center justify-center">
              <LogoGlobe className="w-4 h-4 text-[#C9A227]" />
            </div>
            <div className="leading-none">
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="font-bold text-white text-[15px] tracking-tight">
                BuySmart
              </div>
              <div className="text-[9px] text-[#C9A227] tracking-[0.2em] uppercase mt-0.5">
                Procurement
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-white/60 hover:text-[#C9A227] transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-5">
            <a
              href="tel:08100130714"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-[#C9A227] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              0810 013 0714
            </a>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-[#C9A227] text-[#0D0D0D] px-4 py-2 text-sm font-bold rounded hover:bg-[#D4AF37] transition-colors"
            >
              <WhatsAppSVG className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 -mr-2 text-white"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="flex flex-col gap-[5px]">
                <span className="block w-6 h-[2px] bg-white rounded-full" />
                <span className="block w-6 h-[2px] bg-white rounded-full" />
                <span className="block w-6 h-[2px] bg-white rounded-full" />
              </div>
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {menuOpen && (
          <div id="mobile-navigation" className="md:hidden bg-[#111111] border-t border-white/[0.08] px-5 py-6 flex max-h-[calc(100svh-4rem)] flex-col gap-5 overflow-y-auto">
            {NAV.map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setMenuOpen(false)}
                className="text-white/80 text-base font-medium"
              >
                {item}
              </a>
            ))}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
              <a href="tel:08100130714" className="flex items-center gap-2 text-[#C9A227] font-semibold text-sm">
                <Phone className="w-4 h-4" /> 0810 013 0714
              </a>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#C9A227] text-[#0D0D0D] py-3 font-bold text-sm rounded"
              >
                <WhatsAppSVG className="w-4 h-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ===========================
          HERO
      =========================== */}
      <section className="pt-16 min-h-[100svh] flex items-center bg-[#0D0D0D] relative overflow-hidden">

        {/* Subtle gold ring decorations */}
        <div
          className="absolute -right-40 top-1/2 hidden -translate-y-1/2 pointer-events-none lg:block"
          style={{
            width: 700, height: 700,
            borderRadius: "50%",
            border: "1px solid rgba(201,162,39,0.07)",
          }}
        />
        <div
          className="absolute -right-20 top-1/2 hidden -translate-y-1/2 pointer-events-none lg:block"
          style={{
            width: 460, height: 460,
            borderRadius: "50%",
            border: "1px solid rgba(201,162,39,0.05)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 w-full py-14 sm:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">

          {/* Left copy */}
          <div className="order-2 lg:order-1 max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#C9A227]" />
              <span className="text-[#C9A227] text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase">
                China & Vietnam Sourcing
              </span>
            </div>
            <h1
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="font-black text-[clamp(2.25rem,9vw,3.75rem)] leading-[1.04] tracking-[-0.02em] text-white mb-6"
            >
              We Ship.<br />
              You Sell.<br />
              <span className="text-[#C9A227]">No Wahala.</span>
            </h1>
            <p className="text-white/65 text-base md:text-lg leading-relaxed mb-8 max-w-[32rem]">
              Factory-price sourcing and shipping from China and Vietnam. Verified, calculated, delivered to your door in Lagos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#contact"
                className="flex w-full sm:w-auto items-center justify-center gap-2 bg-[#C9A227] text-[#0D0D0D] px-7 py-4 font-bold text-[15px] rounded hover:bg-[#D4AF37] transition-colors"
              >
                Request a Quote <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="flex w-full sm:w-auto items-center justify-center gap-2 border border-[#C9A227]/50 text-[#F7F5F0] px-7 py-4 font-semibold text-[15px] rounded hover:border-[#C9A227] transition-colors"
              >
                How It Works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#C9A227] fill-[#C9A227]" />
                ))}
                <span className="text-white/50 text-sm ml-1">5.0 Google Rating</span>
              </div>
              <span className="hidden sm:block w-px h-4 bg-white/20" />
              <span className="text-white/50 text-sm">Lagos, Nigeria</span>
              <span className="hidden sm:block w-px h-4 bg-white/20" />
              <span className="text-white/50 text-sm">Open daily</span>
            </div>
          </div>

          {/* Right: 5-image collage */}
          <div className="order-1 lg:order-2 w-full max-w-md sm:max-w-xl lg:max-w-none mx-auto">
            <div className="grid grid-cols-2 gap-2.5 md:gap-3">

              {/* Main large image — spans full left column, 2 rows high */}
              <div className="row-span-2 relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#C9A227]/15" style={{ aspectRatio: "3/4" }}>
                <img
                  src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=600&h=800&fit=crop&auto=format"
                  alt="Customer confidently receiving a delivered package at the door"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/30 to-transparent" />
              </div>

              {/* Top-right 2 images */}
              <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#C9A227]/15" style={{ aspectRatio: "1/1" }}>
                <img
                  src="https://images.unsplash.com/photo-1670121180530-cfcba4438038?w=400&h=400&fit=crop&auto=format"
                  alt="Large cargo ship docked at a port"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#C9A227]/15" style={{ aspectRatio: "1/1" }}>
                <img
                  src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=400&fit=crop&auto=format"
                  alt="Organised warehouse shelves with packages ready for shipment"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              {/* Bottom-right 2 images (only show on md+) */}
              <div className="hidden sm:block relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#C9A227]/15" style={{ aspectRatio: "1/1" }}>
                <img
                  src="https://images.unsplash.com/photo-1764783476401-ab89231e35b6?w=400&h=400&fit=crop&auto=format"
                  alt="Small business owner arranging products at their market stall"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="hidden sm:block relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#C9A227]/15" style={{ aspectRatio: "1/1" }}>
                <img
                  src="https://images.unsplash.com/photo-1605902711834-8b11c3e3ef2f?w=400&h=400&fit=crop&auto=format"
                  alt="Person using smartphone to browse and place an online order"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          WHAT WE DO
      =========================== */}
      <section id="services" className="bg-[#F7F5F0] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-[#C9A227]" />
              <span className="text-[#C9A227] text-[10px] font-semibold tracking-[0.2em] uppercase">What We Do</span>
            </div>
            <h2
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="font-black text-[32px] md:text-[40px] text-[#0D0D0D] mb-5 leading-tight tracking-[-0.02em]"
            >
              Direct from factory.<br />Straight to your door.
            </h2>
            <p className="text-[#0D0D0D]/65 text-base md:text-[17px] leading-relaxed mb-5">
              BuySmart sources your goods directly from manufacturers in China and Vietnam. No middlemen. No inflated prices. We handle procurement, quality checks, and full end-to-end shipping logistics.
            </p>
            <p className="text-[#0D0D0D]/65 text-base leading-relaxed mb-8">
              Our procurement fee is one of the lowest you will find. You pay factory prices with transparent shipping costs — calculated before you commit.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-[#0D0D0D]/10">
              {[
                ["China", "Primary source"],
                ["Vietnam", "Alt. source"],
                ["Lagos", "Delivery hub"],
              ].map(([label, sub]) => (
                <div key={label}>
                  <div
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    className="font-black text-2xl text-[#0D0D0D]"
                  >
                    {label}
                  </div>
                  <div className="text-[11px] text-[#0D0D0D]/45 mt-0.5 uppercase tracking-wide">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-[#0D0D0D] w-full max-w-xl md:max-w-none mx-auto" style={{ aspectRatio: "4/3" }}>
            <img
              src="https://images.unsplash.com/photo-1678182451047-196f22a4143e?w=700&h=525&fit=crop&auto=format"
              alt="Shipping containers stacked at a logistics terminal"
              className="w-full h-full object-cover opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/50 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#C9A227]/25 rounded-xl px-5 py-4">
              <div
                style={{ fontFamily: "'Sora', sans-serif" }}
                className="text-[#C9A227] font-bold text-lg"
              >
                Shipping Daily
              </div>
              <div className="text-white/55 text-sm">China & Vietnam to Lagos</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          WHO IT'S FOR
      =========================== */}
      <section className="bg-[#111111] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="h-px w-10 bg-[#C9A227]" />
              <span className="text-[#C9A227] text-[10px] font-semibold tracking-[0.2em] uppercase">
                Who It Is For
              </span>
              <span className="h-px w-10 bg-[#C9A227]" />
            </div>
            <h2
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="font-black text-[32px] md:text-[40px] text-white tracking-[-0.02em]"
            >
              Built for buyers who mean business.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {AUDIENCE.map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-4 p-5 sm:p-6 border border-white/[0.08] rounded-2xl hover:border-[#C9A227]/40 transition-colors duration-300 group cursor-default"
                style={{ background: "rgba(255,255,255,0.025)" }}
              >
                <div className="w-12 h-12 rounded-full border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] group-hover:border-[#C9A227] transition-colors">
                  {icon}
                </div>
                <span className="text-white/75 text-[13px] text-center font-medium leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===========================
          THE GOAL
      =========================== */}
      <section className="bg-[#0D0D0D] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a]" style={{ aspectRatio: "4/3" }}>
            <img
              src="https://images.unsplash.com/photo-1563986768817-257bf91c5753?w=700&h=525&fit=crop&auto=format"
              alt="Entrepreneur smiling while working and growing their business"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/20 to-transparent" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-[#C9A227]" />
              <span className="text-[#C9A227] text-[10px] font-semibold tracking-[0.2em] uppercase">Our Goal</span>
            </div>
            <h2
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="font-black text-[32px] md:text-[40px] text-white mb-5 leading-tight tracking-[-0.02em]"
            >
              You focus on growing.<br />We handle the rest.
            </h2>
            <p className="text-white/65 text-base md:text-[17px] leading-relaxed mb-5">
              Sourcing from China or Vietnam should not be a headache. We exist to make it simple, affordable, and reliable for every Nigerian buyer.
            </p>
            <p className="text-white/65 text-base leading-relaxed mb-8">
              No chasing freight agents. No surprise charges. No lost packages. Send us the link and we move it from factory floor to your door.
            </p>
            <div className="flex flex-col gap-3.5">
              {[
                "Transparent pricing, calculated before you commit",
                "Reliable tracking and updates throughout",
                "Simple process from order to final delivery",
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <ChecklistIcon className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" />
                  <span className="text-white/75 text-[15px]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          SEASONAL URGENCY BANNER
      =========================== */}
      <section className="bg-[#C9A227] py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="flex items-start md:items-center gap-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0D0D0D]/12">
              <Calendar className="w-7 h-7 text-[#0D0D0D]" />
            </div>
            <div>
              <div
                style={{ fontFamily: "'Sora', sans-serif" }}
                className="font-black text-[26px] md:text-[30px] text-[#0D0D0D] leading-tight"
              >
                The Best Time Is Now.
              </div>
              <p className="text-[#0D0D0D]/65 text-sm md:text-[15px] mt-1 max-w-lg leading-relaxed">
                Avoid port congestion and backlogs. Order early for Christmas hampers, bulk stock, and personal shipments. Slots fill fast.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="flex w-full justify-center sm:w-auto sm:flex-shrink-0 items-center gap-2 bg-[#0D0D0D] text-[#C9A227] px-7 py-4 font-bold text-sm rounded hover:bg-[#161616] transition-colors"
          >
            Order Now <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ===========================
          HOW IT WORKS
      =========================== */}
      <section id="how-it-works" className="bg-[#0D0D0D] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="h-px w-10 bg-[#C9A227]" />
              <span className="text-[#C9A227] text-[10px] font-semibold tracking-[0.2em] uppercase">
                How It Works
              </span>
              <span className="h-px w-10 bg-[#C9A227]" />
            </div>
            <h2
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="font-black text-[32px] md:text-[40px] text-white tracking-[-0.02em]"
            >
              Five steps. Zero stress.
            </h2>
          </div>

          {/* Desktop stepper — horizontal */}
          <div className="hidden md:block relative">
            {/* Connecting gold line */}
            <div
              className="absolute top-8 h-px bg-[#C9A227]/25"
              style={{ left: "10%", right: "10%", zIndex: 0 }}
            />
            <div className="grid grid-cols-5 gap-4 relative" style={{ zIndex: 1 }}>
              {STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-full bg-[#0D0D0D] border-2 border-[#C9A227] flex items-center justify-center text-[#C9A227] mb-5 group-hover:bg-[#C9A227] group-hover:text-[#0D0D0D] transition-colors duration-300">
                    {step.icon}
                  </div>
                  <div
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    className="font-bold text-white text-[13px] mb-2 leading-snug"
                  >
                    {step.title}
                  </div>
                  <div className="text-white/45 text-xs leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile stepper — vertical */}
          <div className="md:hidden relative">
            {/* Vertical connecting gold line */}
            <div
              className="absolute left-7 w-px bg-[#C9A227]/25"
              style={{ top: 32, bottom: 32, zIndex: 0 }}
            />
            <div className="flex flex-col gap-8 relative" style={{ zIndex: 1 }}>
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-[#0D0D0D] border-2 border-[#C9A227] flex items-center justify-center text-[#C9A227] flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="pt-2">
                    <div
                      style={{ fontFamily: "'Sora', sans-serif" }}
                      className="font-bold text-white text-base mb-1"
                    >
                      {step.title}
                    </div>
                    <div className="text-white/55 text-sm leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          TRUST / SOCIAL PROOF
      =========================== */}
      <section id="trust" className="bg-[#111111] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-[#C9A227]" />
              <span className="text-[#C9A227] text-[10px] font-semibold tracking-[0.2em] uppercase">Trusted Business</span>
            </div>
            <h2
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="font-black text-[32px] md:text-[40px] text-white mb-4 leading-tight tracking-[-0.02em]"
            >
              Verified in Lagos.<br />Trusted by buyers.
            </h2>
            <p className="text-white/55 text-base mb-8 leading-relaxed">
              We are a registered import-export business operating out of Lagos. Traceable, accountable, and built for repeat business.
            </p>

            {/* Google rating widget */}
            <div className="border border-white/[0.08] rounded-2xl p-6 mb-5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <GoogleG />
                </div>
                <div>
                  <div className="text-white font-semibold text-[14px]">Google Reviews</div>
                  <div className="text-white/35 text-xs">Import Export Company · Egbeda, Lagos</div>
                </div>
              </div>
              <div className="flex items-end gap-3 mb-1.5">
                <span
                  style={{ fontFamily: "'Sora', sans-serif" }}
                  className="font-black text-5xl text-white leading-none"
                >
                  5.0
                </span>
                <div className="flex gap-0.5 pb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#C9A227] fill-[#C9A227]" />
                  ))}
                </div>
              </div>
              <div className="text-white/35 text-xs">Based on 2 verified reviews</div>
            </div>

            {/* Verified badge */}
            <div className="flex items-start gap-3 p-4 border border-[#C9A227]/20 rounded-xl" style={{ background: "rgba(201,162,39,0.04)" }}>
              <VerifyIcon className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" />
              <p className="text-white/65 text-sm leading-relaxed">
                BuySmart Procurement Limited is a verified import-export business registered and actively operating in Lagos, Nigeria.
              </p>
            </div>
          </div>

          {/* Location card + map */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] w-full">
            <div className="relative bg-[#1a1a1a] min-h-[18rem] sm:min-h-0" style={{ aspectRatio: "4/3" }}>
              <iframe
                title="BuySmart Procurement — 6 Bassey Street, Egbeda, Lagos"
                className="w-full h-full absolute inset-0"
                style={{ border: 0, filter: "grayscale(80%) brightness(0.7)" }}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.952784238!2d3.28819!3d6.58957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8e5c8c8c8c8d%3A0x0!2zNsKwMzUnMjIuNSJOIDPCsDE3JzE3LjUiRQ!5e0!3m2!1sen!2sng!4v1688000000000"
                loading="lazy"
                allowFullScreen
              />
            </div>
            <div className="p-5 bg-[#0D0D0D] border-t border-white/[0.08]">
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-4 h-4 text-[#C9A227] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold text-[14px]">6 Bassey Street, Egbeda</div>
                  <div className="text-white/45 text-sm">Lagos 100276, Nigeria</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/45 text-sm">
                <Clock className="w-3.5 h-3.5" />
                Open daily, closes 6pm
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===========================
          CONTACT / QUOTE FORM
      =========================== */}
      <section id="contact" className="bg-[#F7F5F0] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Left: contact info */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-[#C9A227]" />
              <span className="text-[#C9A227] text-[10px] font-semibold tracking-[0.2em] uppercase">Get In Touch</span>
            </div>
            <h2
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="font-black text-[32px] md:text-[40px] text-[#0D0D0D] mb-5 leading-tight tracking-[-0.02em]"
            >
              Ready to order?<br />Let us talk.
            </h2>
            <p className="text-[#0D0D0D]/60 text-base mb-10 leading-relaxed">
              Send your item link or tell us what you need. We verify, quote, and get it moving.
            </p>

            <div className="flex flex-col gap-5 mb-10">
              <a href="tel:08100130714" className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] group-hover:border-[#C9A227] group-hover:text-[#C9A227] transition-colors flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[#0D0D0D] font-semibold text-[15px] break-words">0810 013 0714</div>
                  <div className="text-[#0D0D0D]/45 text-xs">Call us directly</div>
                </div>
              </a>

              <a href="mailto:kingsleyglory272@gmail.com" className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] group-hover:border-[#C9A227] group-hover:text-[#C9A227] transition-colors flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[#0D0D0D] font-semibold text-[15px] break-all">kingsleyglory272@gmail.com</div>
                  <div className="text-[#0D0D0D]/45 text-xs">Email us</div>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full border border-[#0D0D0D]/15 flex items-center justify-center text-[#0D0D0D] flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[#0D0D0D] font-semibold text-[15px] break-words">6 Bassey Street, Egbeda</div>
                  <div className="text-[#0D0D0D]/45 text-xs">Lagos 100276, Nigeria</div>
                </div>
              </div>
            </div>

            <a
              href={WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full sm:w-auto justify-center items-center gap-3 bg-[#25D366] text-white px-8 py-4 font-bold rounded-xl hover:bg-[#1fb855] transition-colors text-[15px]"
            >
              <WhatsAppSVG className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Right: quote request form */}
          <div className="bg-[#0D0D0D] rounded-2xl p-5 sm:p-7 md:p-8 border border-white/[0.08]">
            <h3
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="font-bold text-white text-xl mb-6"
            >
              Request a Quote
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {[
                { name: "name" as const, label: "Your Name", type: "text", placeholder: "e.g. Emeka Okafor" },
                { name: "phone" as const, label: "Phone / WhatsApp", type: "tel", placeholder: "e.g. 0810 013 0714" },
                { name: "itemLink" as const, label: "Item Link or Description", type: "text", placeholder: "Paste link or describe the item" },
                { name: "quantity" as const, label: "Quantity", type: "text", placeholder: "e.g. 50 pieces" },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-white/45 text-[11px] mb-1.5 font-semibold tracking-[0.1em] uppercase">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A227]/50 transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="block text-white/45 text-[11px] mb-1.5 font-semibold tracking-[0.1em] uppercase">
                  Message (optional)
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any additional details..."
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A227]/50 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C9A227] text-[#0D0D0D] py-4 rounded-lg font-bold text-[15px] hover:bg-[#D4AF37] transition-colors mt-1 flex items-center justify-center gap-2"
              >
                Send via WhatsApp <MessageCircle className="w-4 h-4" />
              </button>
              <p className="text-white/25 text-xs text-center">
                Opens WhatsApp with your request pre-filled.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ===========================
          FOOTER
      =========================== */}
      <footer id="about" className="bg-[#0D0D0D] border-t border-white/[0.08] py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

            {/* Brand block */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full border border-[#C9A227] flex items-center justify-center flex-shrink-0">
                  <LogoGlobe className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div className="leading-none">
                  <div style={{ fontFamily: "'Sora', sans-serif" }} className="font-bold text-white text-[14px]">
                    BuySmart Procurement Limited
                  </div>
                  <div className="text-[#C9A227] text-[9px] tracking-[0.15em] uppercase mt-0.5">
                    Procurement Services
                  </div>
                </div>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                China and Vietnam sourcing at factory prices. Delivered to Lagos.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <div className="text-white/25 text-[10px] tracking-[0.2em] uppercase mb-4">Quick Links</div>
              <div className="flex flex-col gap-2.5">
                {["Services", "How It Works", "Trust", "Contact"].map(link => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-white/50 text-sm hover:text-[#C9A227] transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div>
              <div className="text-white/25 text-[10px] tracking-[0.2em] uppercase mb-4">Contact</div>
              <div className="flex flex-col gap-3">
                <a href="tel:08100130714" className="flex items-start gap-2 text-white/50 text-sm hover:text-[#C9A227] transition-colors">
                  <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> <span className="break-words">0810 013 0714</span>
                </a>
                <a href="mailto:kingsleyglory272@gmail.com" className="flex items-start gap-2 text-white/50 text-sm hover:text-[#C9A227] transition-colors">
                  <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> <span className="break-all">kingsleyglory272@gmail.com</span>
                </a>
                <div className="flex items-start gap-2 text-white/50 text-sm">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span className="break-words">6 Bassey Street, Egbeda, Lagos</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Clock className="w-3.5 h-3.5" /> Open daily, closes 6pm
                </div>
              </div>
            </div>

            {/* Demo newsletter signup */}
            <div>
              <div className="text-white/25 text-[10px] tracking-[0.2em] uppercase mb-4">Newsletter</div>
              <p className="text-white/40 text-sm leading-relaxed mb-4">
                Subscribe for BuySmart updates, import tips, shipping alerts, and product news.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
                <label className="sr-only" htmlFor="newsletter-email">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={handleNewsletterChange}
                  placeholder="Your email address"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm placeholder-white/35 focus:outline-none focus:border-[#C9A227]/50 transition-colors"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-[#C9A227] px-4 py-3 text-sm font-semibold text-[#0D0D0D] hover:bg-[#D4AF37] transition-colors"
                >
                  Subscribe
                </button>
                {newsletterStatus === "success" && (
                  <p className="text-[#A6FF7E] text-sm">Thanks! You are now subscribed to BuySmart updates.</p>
                )}
                {newsletterStatus === "error" && (
                  <p className="text-[#FF7E7E] text-sm">{newsletterError}</p>
                )}
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-white/25 text-xs">
              &copy; {new Date().getFullYear()} BuySmart Procurement Limited. All rights reserved.
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/30 hover:text-[#25D366] transition-colors text-xs"
            >
              <WhatsAppSVG className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      </footer>

>>>>>>> bc1d575 (Add demo newsletter signup form with local subscription confirmation)
    </div>
  );
}
