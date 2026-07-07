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
    </div>
  );
}
