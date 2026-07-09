import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Calculator,
  CalendarClock,
  Clock3,
  Camera,
  ClipboardCheck,
  ExternalLink,
  Factory,
  FileCheck2,
  Image as ImageIcon,
  Landmark,
  LayoutGrid,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Plane,
  Scale,
  Search,
  ShieldCheck,
  Ship,
  ShoppingBag,
  Star,
  Truck,
  RefreshCcw,
  UserRound,
  Warehouse,
} from "lucide-react";
import {
  ADDRESS_LINE_1,
  ADDRESS_LINE_2,
  GOOGLE_MAPS_URL,
  PHONE_DISPLAY,
  customsGuide,
  estimatorConfig,
  faqItems,
  galleryCategories,
  galleryItems,
  homeStats,
  installmentEligibility,
  installmentPlans,
  installmentPolicies,
  installmentSchedule,
  isLagos,
  nigerianStates,
  orderSteps,
  prohibitedItems,
  services,
  shippingModes,
  shippingNotes,
  shippingPreparation,
  successStories,
  testimonialMedia,
  volumetricExample,
  volumetricFormula,
  writtenTestimonials,
} from "./content";
import { blogPosts, getPostBySlug } from "./blog";
import {
  CtaBanner,
  ContactSection,
  Container,
  FaqList,
  GoldCheck,
  NewsletterSignup,
  SectionHeading,
  SectionTag,
  TestimonialsPreview,
  WhyChooseGrid,
  bodyText,
  cardBorder,
  createWhatsAppUrl,
  dark,
  gold,
} from "./layout";

type EstimatorState = {
  mode: "air" | "sea";
  state: string;
  actualWeight: string;
  length: string;
  width: string;
  height: string;
};

const audienceIcons = [ShoppingBag, Package, UserRound, Star, BriefcaseBusiness];

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  search: Search,
  shield: ShieldCheck,
  factory: Factory,
  inspection: ClipboardCheck,
  cart: ShoppingBag,
  plane: Plane,
  ship: Ship,
  file: FileCheck2,
  truck: Truck,
  briefcase: BriefcaseBusiness,
  bag: ShoppingBag,
  warehouse: Warehouse,
  calendar: CalendarClock,
  banknote: Banknote,
  camera: Camera,
  refresh: RefreshCcw,
};

function inferFreightMode(timeline: string) {
  return timeline.toLowerCase().includes("air") ? "Air freight" : "Sea freight";
}

function buildProjectInsight(item: (typeof galleryItems)[number]) {
  const proofLabel = item.mediaType === "video" ? "Video proof" : "Photo proof";
  return `${proofLabel} from a real ${item.category.toLowerCase()} order handled by BuySmart. It helps a new customer understand what was sourced, the shipping route used, and the kind of update they can expect before goods arrive in Nigeria.`;
}

type TransitionType = "fade" | "slide-left" | "slide-right" | "zoom-out" | "zoom-in";

type HeroSlide = {
  type: "video" | "image";
  src: string;
  poster?: string;
  transition: TransitionType;
};

const HERO_SLIDES: HeroSlide[] = [
  { type: "video", src: "https://assets.mixkit.co/videos/4011/4011-720.mp4", poster: "/media/hero/hero-background-1.jpg", transition: "fade" },
  { type: "image", src: "/media/hero/hero-background-1.jpg", transition: "slide-left" },
  { type: "video", src: "https://videos.pexels.com/video-files/36268137/15380256_3840_2160_30fps.mp4", poster: "/media/hero/hero-background-2.jpg", transition: "slide-right" },
  { type: "image", src: "/media/hero/hero-background-2.jpg", transition: "zoom-out" },
  { type: "video", src: "https://videos.pexels.com/video-files/5605776/5605776-uhd_3840_2160_30fps.mp4", poster: "/media/hero/hero-background-3.jpg", transition: "slide-left" },
  { type: "image", src: "/media/hero/hero-background-3.jpg", transition: "zoom-out" },
  { type: "video", src: "https://videos.pexels.com/video-files/857641/857641-uhd_3840_2160_30fps.mp4", poster: "/media/hero/hero-background-1.jpg", transition: "fade" },
  { type: "image", src: "/media/hero/hero-background-2.jpg", transition: "zoom-in" },
  { type: "video", src: "https://assets.mixkit.co/videos/7175/7175-720.mp4", poster: "/media/hero/hero-background-1.jpg", transition: "slide-right" },
  { type: "image", src: "/media/hero/hero-background-3.jpg", transition: "zoom-in" },
  { type: "video", src: "https://videos.pexels.com/video-files/6549264/6549264-uhd_3840_2160_30fps.mp4", poster: "/media/hero/hero-background-2.jpg", transition: "slide-left" },
  { type: "image", src: "/media/hero/hero-background-1.jpg", transition: "zoom-in" },
];

function getSlideStyle(transition: TransitionType, isActive: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    filter: "saturate(0.9) contrast(1.05) brightness(0.95)",
  };
  if (isActive) {
    switch (transition) {
      case "zoom-out":
      case "zoom-in":
        return { ...base, opacity: 1, transform: "scale(1)" };
      default:
        return { ...base, opacity: 1, transform: "scale(1.1)" };
    }
  }
  switch (transition) {
    case "slide-left":
      return { ...base, opacity: 0, transform: "translateX(-5%) scale(1.08)" };
    case "slide-right":
      return { ...base, opacity: 0, transform: "translateX(5%) scale(1.08)" };
    case "zoom-out":
      return { ...base, opacity: 0, transform: "scale(1.25)" };
    case "zoom-in":
      return { ...base, opacity: 0, transform: "scale(1.25)" };
    default:
      return { ...base, opacity: 0, transform: "scale(1.08)" };
  }
}

function getSlideTransition(transition: TransitionType): string {
  switch (transition) {
    case "slide-left":
    case "slide-right":
      return "opacity 1200ms ease-in-out, transform 800ms ease-out";
    case "zoom-in":
      return "opacity 1000ms ease-in-out, transform 4000ms ease-out";
    default:
      return "opacity 1500ms ease-in-out, transform 7000ms ease-out";
  }
}

function HeroBackground() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedVideos, setFailedVideos] = useState<Set<number>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === activeIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === activeIndex;
        if (slide.type === "image" || failedVideos.has(index)) {
          const src = slide.type === "video" ? slide.poster! : slide.src;
          return (
            <div
              key={index}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${src}')`,
                ...getSlideStyle(slide.transition, isActive),
                transition: getSlideTransition(slide.transition),
              }}
            />
          );
        }
        return (
          <video
            key={index}
            ref={(el) => { videoRefs.current[index] = el; }}
            src={slide.src}
            poster={slide.poster}
            muted
            playsInline
            loop
            onError={() => setFailedVideos((prev) => new Set(prev).add(index))}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              ...getSlideStyle(slide.transition, isActive),
              transition: getSlideTransition(slide.transition),
            }}
          />
        );
      })}
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%),
          linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.35) 100%)
        `,
      }} />
    </div>
  );
}

export function HomePage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#EFEAE1] w-full min-h-[42rem] lg:min-h-[44rem] xl:min-h-[48rem]">
        <HeroBackground />


        <Container className="relative z-10 py-14 lg:py-20">
          <div className="max-w-2xl text-white">
            <h1 style={{ fontFamily: "'Sora', sans-serif", color: "white" }} className="text-[clamp(2.75rem,7vw,5.25rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
              Source with <span style={{ color: gold }}>clarity</span>. Ship with <span style={{ color: gold }}>confidence</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#F0F0F0]">
              BuySmart helps Nigerian business owners and everyday buyers source from trusted suppliers in China and Vietnam, verify what they are paying for, and move goods into Nigeria without unnecessary back and forth.
            </p>
          </div>
        </Container>
      </section>

      <section id="what-we-do" className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              What we <span style={{ color: gold }}>do.</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => {
              const Icon = serviceIconMap[service.icon] ?? PackageCheck;
              return (
                <div key={service.title} className={`rounded-xl border bg-[#FAFAF8] p-4 shadow-[0_4px_12px_rgba(17,17,17,0.02)] transition hover:shadow-[0_8px_20px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm" style={{ color: gold }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm font-bold text-[#111111] leading-tight">{service.title}</div>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#4A4A4A]">{service.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Why choose <span style={{ color: gold }}>BuySmart?</span>
            </h2>
          </div>
          <WhyChooseGrid />
        </Container>
      </section>

      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Who it&rsquo;s <span style={{ color: gold }}>for.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A] mx-auto">
              Built for buyers who mean business.
            </p>
          </div>
           <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
             {["Small Business Owners", "Bulk Buyers", "Personal Shoppers", "Personal Use", "Companies, Schools & Offices"].map((audience, index) => {
              const Icon = audienceIcons[index] ?? ShoppingBag;
              const imgMap: Record<string, string> = {
                "Small Business Owners": "/images/who-its-for/small-business-owner.webp",
                "Bulk Buyers": "/images/who-its-for/bulk-buyers.webp",
                "Personal Shoppers": "/images/who-its-for/personal-shoppers.webp",
                "Personal Use": "/images/who-its-for/personal-use.webp",
                "Companies, Schools & Offices": "/images/who-its-for/companies-offices.webp",
              };
              const altMap: Record<string, string> = {
                "Small Business Owners": "Small local shop with products on display, representing small business owners",
                "Bulk Buyers": "Warehouse with stacked pallets and bulk goods for wholesale buyers",
                "Personal Shoppers": "Person browsing products on a smartphone while shopping",
                "Personal Use": "Person shopping online from home in a comfortable living room setting",
                "Companies, Schools & Offices": "Professionals in a conference room meeting, representing companies and offices",
              };
              return (
                <div key={audience} className={`rounded-2xl border relative overflow-hidden p-5 text-center shadow-[0_8px_20px_rgba(17,17,17,0.03)] min-h-[280px] flex flex-col items-center justify-center ${cardBorder}`}>
                  <div className="absolute inset-0 z-0">
                    <img src={imgMap[audience]} alt={altMap[audience]} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
                  <div className="relative z-10">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm" style={{ color: gold }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="mt-3 text-sm font-semibold leading-5 text-white">{audience}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Recent <span style={{ color: gold }}>projects.</span>
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
             {galleryItems.slice(0, 3).map((item) => (
                <div key={item.title} className="group relative overflow-hidden rounded-[20px] bg-[#111111]">
                  <div className="aspect-[4/3] w-full">
                    {item.mediaType === "video" ? (
                      <video src={item.media} className="h-full w-full object-cover opacity-60 transition-transform duration-[800ms] ease-out group-hover:scale-110 group-hover:opacity-80" autoPlay muted loop playsInline />
                    ) : (
                      <img src={item.media} alt={item.title} className="h-full w-full object-cover opacity-60 transition-transform duration-[800ms] ease-out group-hover:scale-110 group-hover:opacity-80" loading="lazy" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6 pointer-events-none">
                    <div className="mb-2 inline-flex w-fit items-center rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      {item.category}
                    </div>
                    <div className="text-lg font-bold text-white">{item.title}</div>
                  </div>
                </div>
             ))}
          </div>
          <div className="mt-10 text-center">
            <a 
              href="/projects" 
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate("/projects");
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90" 
              style={{ backgroundColor: gold }}
            >
              View all projects <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Container>
      </section>

      <section className="bg-[#FBF6E8] py-8 lg:py-12">
        <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#D6C18A]/35 bg-white/95 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] shadow-[0_4px_12px_rgba(201,162,39,0.05)] backdrop-blur-sm" style={{ color: gold }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
              </span>
              <span className="text-[#111111]/90">Trusted business</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="max-w-2xl text-[clamp(2.2rem,4.8vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#111111]">
              Verified in Lagos.
              <br />
              Trusted by buyers.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#4A4A4A]">
              BuySmart is a registered import-export business operating from Lagos. Customers can see the business location, map listing, rating, and trust documentation before sending a request.
            </p>
            <div className="mt-8 grid gap-4">
              <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-6 shadow-[0_8px_20px_rgba(17,17,17,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FBF6E8]">
                    <MapPin className="h-5 w-5 text-[#4285F4]" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[#111111]">Google Reviews</div>
                    <div className="text-sm text-[#7C746C]">Import export company · Egbeda, Lagos</div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-end gap-4">
                  <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-6xl font-extrabold tracking-[-0.05em] text-[#111111]">
                    5.0
                  </div>
                  <div className="pb-2">
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-[#C9A227] text-[#C9A227]" />
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-[#7C746C]">Based on verified reviews</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-5 text-[#4A4A4A] shadow-[0_8px_20px_rgba(17,17,17,0.04)]">
                <div className="flex items-start gap-3">
                  <Landmark className="mt-1 h-5 w-5" style={{ color: gold }} />
                  <p className="text-sm leading-7">
                    BuySmart Procurement Limited is a verified import-export business registered and actively operating in Lagos, Nigeria.
                  </p>
                </div>
              </div>
              <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-5 shadow-[0_8px_20px_rgba(17,17,17,0.04)]">
                <div className="grid gap-4 sm:grid-cols-[0.75fr_1.25fr] sm:items-center">
                  <div className="overflow-hidden rounded-2xl border border-[#E5E2DA] bg-[#FAFAF8]">
                    <img src={testimonialMedia[2]?.image} alt={testimonialMedia[2]?.alt} className="h-48 w-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em]" style={{ color: gold }}>Business certificate</div>
                    <div className="mt-2 text-lg font-semibold text-[#111111]">CAC registration certificate</div>
                    <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">
                      The certificate is visible here so first-time visitors can immediately see BuySmart is a registered business and not an anonymous online seller.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#E5E2DA] bg-white p-4 shadow-[0_8px_20px_rgba(17,17,17,0.04)]">
            <div className="overflow-hidden rounded-[24px] border border-[#E5E2DA]">
              <iframe
                title="BuySmart Lagos location map"
                src="https://www.google.com/maps?q=6+Bassey+Street,+Egbeda,+Lagos&z=15&output=embed"
                className="h-[24rem] w-full bg-[#FBF6E8]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="grid gap-4 p-4 text-[#111111] sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4" style={{ color: gold }} />
                  <div>
                    <div className="text-sm font-semibold">{ADDRESS_LINE_1}, Egbeda</div>
                    <div className="text-sm text-[#7C746C]">{ADDRESS_LINE_2}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-1 h-4 w-4" style={{ color: gold }} />
                  <div className="text-sm text-[#4A4A4A]">Open daily, closes 6pm</div>
                </div>
              </div>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#D6C18A] bg-[#FBF6E8] px-4 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#C9A227]"
              >
                View map profile <ExternalLink className="h-4 w-4" style={{ color: gold }} />
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export function WhyChoosePage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Why choose <span style={{ color: gold }}>BuySmart?</span>
            </h2>
          </div>
          <WhyChooseGrid />
        </Container>
      </section>

      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Who it&rsquo;s <span style={{ color: gold }}>for.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A] mx-auto">
              Built for buyers who mean business.
            </p>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#4A4A4A] mx-auto">
              Whether you buy once a month or restock inventory weekly, BuySmart works the same on every device — phone, tablet, or laptop.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {["Small Business Owners", "Bulk Buyers", "Personal Shoppers", "Personal Use", "Companies, Schools & Offices"].map((audience, index) => {
              const Icon = audienceIcons[index] ?? ShoppingBag;
              const imgMap: Record<string, string> = {
                "Small Business Owners": "/images/who-its-for/small-business-owner.webp",
                "Bulk Buyers": "/images/who-its-for/bulk-buyers.webp",
                "Personal Shoppers": "/images/who-its-for/personal-shoppers.webp",
                "Personal Use": "/images/who-its-for/personal-use.webp",
                "Companies, Schools & Offices": "/images/who-its-for/companies-offices.webp",
              };
              const altMap: Record<string, string> = {
                "Small Business Owners": "Small local shop with products on display, representing small business owners",
                "Bulk Buyers": "Warehouse with stacked pallets and bulk goods for wholesale buyers",
                "Personal Shoppers": "Person browsing products on a smartphone while shopping",
                "Personal Use": "Person shopping online from home in a comfortable living room setting",
                "Companies, Schools & Offices": "Professionals in a conference room meeting, representing companies and offices",
              };
              return (
                <div key={audience} className={`rounded-2xl border relative overflow-hidden p-5 text-center shadow-[0_8px_20px_rgba(17,17,17,0.03)] min-h-[280px] flex flex-col items-center justify-center ${cardBorder}`}>
                  <div className="absolute inset-0 z-0">
                    <img src={imgMap[audience]} alt={altMap[audience]} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
                  <div className="relative z-10">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm" style={{ color: gold }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="mt-3 text-sm font-semibold leading-5 text-white">{audience}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

    </main>
  );
}

export function VerifiedLagosPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="py-8 lg:py-12">
        <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#D6C18A]/35 bg-white/95 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] shadow-[0_4px_12px_rgba(201,162,39,0.05)] backdrop-blur-sm" style={{ color: gold }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
              </span>
              <span className="text-[#111111]/90">Trusted business</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="max-w-2xl text-[clamp(2.2rem,4.8vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#111111]">
              Verified in Lagos.
              <br />
              Trusted by buyers.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#4A4A4A]">
              BuySmart is a registered import-export business operating from Lagos. Customers can see the business location, map listing, rating, and trust documentation before sending a request.
            </p>
            <div className="mt-8 grid gap-4">
              <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-6 shadow-[0_8px_20px_rgba(17,17,17,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FBF6E8]">
                    <MapPin className="h-5 w-5 text-[#4285F4]" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[#111111]">Google Reviews</div>
                    <div className="text-sm text-[#7C746C]">Import export company · Egbeda, Lagos</div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-end gap-4">
                  <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-6xl font-extrabold tracking-[-0.05em] text-[#111111]">
                    5.0
                  </div>
                  <div className="pb-2">
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-[#C9A227] text-[#C9A227]" />
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-[#7C746C]">Based on verified reviews</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-5 text-[#4A4A4A] shadow-[0_8px_20px_rgba(17,17,17,0.04)]">
                <div className="flex items-start gap-3">
                  <Landmark className="mt-1 h-5 w-5" style={{ color: gold }} />
                  <p className="text-sm leading-7">
                    BuySmart Procurement Limited is a verified import-export business registered and actively operating in Lagos, Nigeria.
                  </p>
                </div>
              </div>
              <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-5 shadow-[0_8px_20px_rgba(17,17,17,0.04)]">
                <div className="grid gap-4 sm:grid-cols-[0.75fr_1.25fr] sm:items-center">
                  <div className="overflow-hidden rounded-2xl border border-[#E5E2DA] bg-[#FAFAF8]">
                    <img src={testimonialMedia[2]?.image} alt={testimonialMedia[2]?.alt} className="h-48 w-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em]" style={{ color: gold }}>Business certificate</div>
                    <div className="mt-2 text-lg font-semibold text-[#111111]">CAC registration certificate</div>
                    <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">
                      The certificate is visible here so first-time visitors can immediately see BuySmart is a registered business and not an anonymous online seller.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#E5E2DA] bg-white p-4 shadow-[0_8px_20px_rgba(17,17,17,0.04)]">
            <div className="overflow-hidden rounded-[24px] border border-[#E5E2DA]">
              <iframe
                title="BuySmart Lagos location map"
                src="https://www.google.com/maps?q=6+Bassey+Street,+Egbeda,+Lagos&z=15&output=embed"
                className="h-[24rem] w-full bg-[#FBF6E8]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="grid gap-4 p-4 text-[#111111] sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4" style={{ color: gold }} />
                  <div>
                    <div className="text-sm font-semibold">{ADDRESS_LINE_1}, Egbeda</div>
                    <div className="text-sm text-[#7C746C]">{ADDRESS_LINE_2}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-1 h-4 w-4" style={{ color: gold }} />
                  <div className="text-sm text-[#4A4A4A]">Open daily, closes 6pm</div>
                </div>
              </div>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#D6C18A] bg-[#FBF6E8] px-4 py-3 text-sm font-semibold text-[#111111] transition hover:border-[#C9A227]"
              >
                View map profile <ExternalLink className="h-4 w-4" style={{ color: gold }} />
              </a>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

export function HowItWorksPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Five clear steps from request to <span style={{ color: gold }}>delivery.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A] mx-auto">
              Send a product link or description and within 24 hours you will receive a quotation. Here is exactly what happens next.
            </p>
          </div><div className="hidden lg:block">
            <div className="relative grid grid-cols-5 gap-6">
              <div className="absolute left-[10%] right-[10%] top-7 h-px" style={{ backgroundColor: "rgba(201,162,39,0.45)" }} />
              {orderSteps.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 bg-[#FAFAF8] text-sm font-bold" style={{ borderColor: gold, color: gold }}>
                    0{index + 1}
                  </div>
                  <div className={`mt-5 rounded-2xl border bg-[#FAFAF8] p-5 text-center shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">{step.title}</div>
                    <div className="mt-2 text-sm font-semibold leading-6 text-[#111111]">{step.heading}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-5 lg:hidden">
            {orderSteps.map((step, index) => (
              <div key={step.title} className="relative flex gap-4">
                {index < orderSteps.length - 1 ? <span className="absolute left-[27px] top-14 h-[calc(100%-2.5rem)] w-px" style={{ backgroundColor: "rgba(201,162,39,0.45)" }} /> : null}
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 bg-[#FAFAF8] text-sm font-bold" style={{ borderColor: gold, color: gold }}>
                  0{index + 1}
                </div>
                <div className={`flex-1 rounded-2xl border bg-[#FAFAF8] p-5 shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">{step.title}</div>
                  <div className="mt-2 text-sm font-semibold leading-6 text-[#111111]">{step.heading}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

    </main>
  );
}

export function ContactPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <ContactSection />
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="Location map" title="Visit our office in Lagos" center />
          <div className="overflow-hidden rounded-[24px] border border-[#E5E2DA] shadow-sm">
            <iframe
              title="BuySmart Lagos location map"
              src="https://www.google.com/maps?q=6+Bassey+Street,+Egbeda,+Lagos&z=15&output=embed"
              className="h-[30rem] w-full bg-white"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Container>
      </section>
    </main>
  );
}

export function ServicesPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              A complete procurement and shipping <span style={{ color: gold }}>stack.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A] mx-auto">
              Every service below — from supplier verification to last-mile delivery — is available whether you are a first-time buyer or a returning wholesaler.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const Icon = serviceIconMap[service.icon] ?? PackageCheck;
              return (
                <div key={service.title} className={`rounded-[28px] border bg-white p-4 shadow-[0_8px_20px_rgba(17,17,17,0.03)] ${cardBorder}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAFAF8]" style={{ color: gold }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-bold leading-tight tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
                      <span style={{ color: gold }}>{service.title}</span>
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[#4A4A4A]">{service.description}</p>
                  {service.note ? <p className="mt-3 text-xs font-medium leading-6 text-[#7C746C]">{service.note}</p> : null}
                </div>
              );
            })}
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Eight reasons the service feels <span style={{ color: gold }}>dependable.</span>
            </h2>
          </div>
          <WhyChooseGrid />
        </Container>
      </section>
      <ContactSection compact />
    </main>
  );
}

export function InstallmentPage() {
  const installmentFaqs = faqItems.filter((item) => item.category === "installment");
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <div className="mb-10">
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
                Clear installment terms for hair products and approved <span style={{ color: gold }}>general goods.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
                Eligibility, minimum deposit (50%), payment schedule, late payment policy, and refund terms are all spelled out below.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {installmentPlans.map((plan) => (
                <div key={plan.title} className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                  <h3 className="text-xl font-bold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>{plan.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">{plan.description}</p>
                  <div className="mt-5 grid gap-3">
                    {plan.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3">
                        <GoldCheck />
                        <span className="text-sm leading-6 text-[#4A4A4A]">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`rounded-[30px] border bg-[#FAFAF8] p-6 shadow-[0_20px_48px_rgba(17,17,17,0.08)] ${cardBorder}`}>
            <div className="text-xs uppercase tracking-[0.18em]" style={{ color: gold }}>Minimum deposit requirement</div>
            <div style={{ fontFamily: "'Sora', sans-serif" }} className="mt-3 text-5xl font-extrabold tracking-[-0.05em] text-[#111111]">50%</div>
            <p className="mt-4 text-sm leading-7 text-[#4A4A4A]">The minimum deposit starts from 50 percent. Some products may require a higher deposit depending on supplier terms, lead time, or risk level.</p>
            <div className="mt-6 rounded-2xl border border-[#E5E2DA] bg-white p-5">
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: gold }}>Late or missed payment policy</div>
              <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">Late or missed payments can pause procurement, release, or shipment until the outstanding balance is cleared. Repeated default may lead to cancellation and deduction of non recoverable costs.</p>
            </div>
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Who qualifies for an installment <span style={{ color: gold }}>plan?</span>
            </h2>
            <div className="grid gap-4">
              {installmentEligibility.map((item) => (
                <div key={item} className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
                  <GoldCheck />
                  <span className="text-sm leading-6 text-[#4A4A4A]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              How the payment schedule is <span style={{ color: gold }}>structured.</span>
            </h2>
            <div className="grid gap-4">
              {installmentSchedule.map((item, index) => (
                <div key={item.title} className={`rounded-2xl border bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Stage 0{index + 1}</div>
                  <div className="mt-2 text-lg font-semibold text-[#111111]">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[#4A4A4A]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container className="grid gap-5 lg:grid-cols-2">
          {installmentPolicies.map((policy) => (
            <div key={policy.title} className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <h3 className="text-xl font-bold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>{policy.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">{policy.description}</p>
            </div>
          ))}
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
        <Container>
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Installment-specific <span style={{ color: gold }}>questions.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A] mx-auto">
              Qualified buyers can pay in installments for selected products. Below are the most common questions about how it works.
            </p>
          </div>
          <FaqList items={installmentFaqs} />
        </Container>
      </section>

    </main>
  );
}

export function ShippingPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Published freight guidance that answers the questions customers ask <span style={{ color: gold }}>most.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
              Delivery timelines, item suitability, chargeable weight, customs duties, and restricted items — all explained here before you request a quote.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {shippingModes.map((mode) => (
              <div key={mode.title} className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
                  <div className="flex shrink-0 items-center gap-4 lg:flex-col lg:items-center lg:pt-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shrink-0" style={{ color: gold }}>{mode.title.toLowerCase().includes("air") ? <Plane className="h-5 w-5" /> : <Ship className="h-5 w-5" />}</div>
                    <h2 className="text-[clamp(1.3rem,2.5vw,1.8rem)] font-extrabold tracking-[-0.04em] text-[#111111] lg:text-center lg:mt-1" style={{ fontFamily: "'Sora', sans-serif" }}>{mode.title}</h2>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] leading-relaxed text-[#4A4A4A]">{mode.description}</p>
                    <div className="mt-3 rounded-2xl border border-[#E5E2DA] bg-white p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Estimated delivery timeline</div>
                      <div className="mt-2 text-sm font-semibold text-[#111111]">{mode.timeline}</div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {mode.bestFor.map((item) => (
                        <span key={item} className="rounded-full border border-[#E5E2DA] bg-white px-3 py-2 text-xs font-medium text-[#4A4A4A]">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
        <Container>
          <div className="mb-10">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Chargeable weight explained <span style={{ color: gold }}>clearly.</span>
            </h2>
          </div>
          <div className="grid gap-4">
            <div className={`rounded-2xl border bg-white p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111111]"><Scale className="h-4 w-4" style={{ color: gold }} />Volumetric weight formula</div>
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-[clamp(1.2rem,2vw,1.7rem)] font-bold tracking-[-0.03em] text-[#111111]">{volumetricFormula}</div>
              <p className="mt-4 text-sm leading-7 text-[#4A4A4A]">Example: {volumetricExample.dimensions}. Calculation: {volumetricExample.calculation}.</p>
            </div>
            <div className={`rounded-2xl border bg-white p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#111111]"><Calculator className="h-4 w-4" style={{ color: gold }} />Actual weight versus volumetric weight</div>
              <p className="text-sm leading-7 text-[#4A4A4A]">BuySmart compares the actual scale weight of the shipment with the volumetric weight. Whichever figure is higher becomes the billed chargeable weight.</p>
            </div>
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container className="grid gap-8 lg:grid-cols-3">
          {[shippingNotes, customsGuide, shippingPreparation].map((group, groupIndex) => (
            <div key={groupIndex} className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="grid gap-3">
                {group.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <GoldCheck />
                    <span className="text-sm leading-6 text-[#4A4A4A]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
        <Container>
          <div className="mb-10">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Restricted and prohibited <span style={{ color: gold }}>items.</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {prohibitedItems.map((item) => (
              <div key={item} className={`rounded-2xl border bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
                <div className="flex items-start gap-3"><GoldCheck /><span className="text-sm leading-6 text-[#4A4A4A]">{item}</span></div>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <ContactSection compact />
    </main>
  );
}

export function EstimatorPage() {
  const [form, setForm] = useState<EstimatorState>({ mode: "air", state: "Lagos", actualWeight: "", length: "", width: "", height: "" });
  const destination = isLagos(form.state) ? "Lagos" : "Outside Lagos";
  const volumetricWeight = useMemo(() => {
    const length = Number(form.length);
    const width = Number(form.width);
    const height = Number(form.height);
    if (!length || !width || !height) return 0;
    return Number(((length * width * height) / estimatorConfig.divisor).toFixed(2));
  }, [form.height, form.length, form.width]);
  const actualWeight = Number(form.actualWeight) || 0;
  const chargeableWeight = Math.max(actualWeight, volumetricWeight, estimatorConfig.minimumChargeableWeight);
  const rates = estimatorConfig.rates[form.mode][destination];
  const lowEstimate = Math.round(chargeableWeight * rates.low);
  const highEstimate = Math.round(chargeableWeight * rates.high);

  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div className="mb-10">
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
                A simple calculator customers can use before they ask for an exact <span style={{ color: gold }}>quote.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
                Enter your shipment details below for an instant estimate. Air and sea rates are updated regularly to reflect current pricing.
              </p>
            </div>
            <div className={`rounded-[30px] border bg-[#FAFAF8] p-6 shadow-[0_18px_48px_rgba(17,17,17,0.04)] ${cardBorder}`}>
              <div className="flex flex-wrap gap-3">
                {(["air", "sea"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => setForm((current) => ({ ...current, mode }))} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: form.mode === mode ? gold : dark }}>
                    {mode === "air" ? "Air" : "Sea"}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-[#111111]">
                  Destination state
                  <select value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none">
                    {nigerianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#111111]">
                  Actual weight (kg)
                  <input type="number" min="0" step="0.1" value={form.actualWeight} onChange={(event) => setForm((current) => ({ ...current, actualWeight: event.target.value }))} className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none" placeholder="e.g. 12" />
                </label>
                {[
                  ["Length (cm)", "length"],
                  ["Width (cm)", "width"],
                  ["Height (cm)", "height"],
                ].map(([label, field]) => (
                  <label key={field} className="grid gap-2 text-sm font-medium text-[#111111]">
                    {label}
                    <input type="number" min="0" value={form[field as keyof EstimatorState]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none" />
                  </label>
                ))}
                <label className="grid gap-2 text-sm font-medium text-[#111111]">
                  Cargo type / description
                  <input type="text" className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none" placeholder="e.g. Electronics, Hair, General goods" />
                </label>
              </div>
              <p className="mt-3 text-xs leading-6 text-[#7C746C]">
                Destination set to <strong>{destination}</strong> based on selected state.
              </p>
            </div>
          </div>
          <div className={`rounded-[30px] border bg-[#FAFAF8] p-6 shadow-[0_18px_48px_rgba(17,17,17,0.08)] ${cardBorder}`}>
            <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Volumetric weight</div><div style={{ fontFamily: "'Sora', sans-serif" }} className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#111111]">{volumetricWeight.toFixed(2)}kg</div></div>
            <div className="mt-4 rounded-2xl border border-[#E5E2DA] bg-white p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Chargeable weight</div><div style={{ fontFamily: "'Sora', sans-serif" }} className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#111111]">{chargeableWeight.toFixed(2)}kg</div><p className="mt-3 text-sm leading-6 text-[#4A4A4A]">This uses the higher of actual weight and volumetric weight.</p></div>
            <div className="mt-4 rounded-2xl border border-[#E5E2DA] bg-white p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Estimated cost range</div><div style={{ fontFamily: "'Sora', sans-serif" }} className="mt-2 text-[clamp(1.8rem,5vw,2.7rem)] font-bold tracking-[-0.04em] text-[#111111]">₦{lowEstimate.toLocaleString()} to ₦{highEstimate.toLocaleString()}</div></div>
            <a href={createWhatsAppUrl(["Hello BuySmart, I need an exact shipping quote.", `Mode: ${form.mode === "air" ? "Air" : "Sea"}`, `Destination state: ${form.state}`, `Actual weight: ${form.actualWeight || "Not provided"}kg`, `Dimensions: ${form.length || "-"}cm × ${form.width || "-"}cm × ${form.height || "-"}cm`, `Estimated chargeable weight: ${chargeableWeight}kg`].join("\n"))} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: gold }}>
              Request Exact Quote <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Container>
      </section>

    </main>
  );
}

export function ProjectsPage() {
  const [category, setCategory] = useState<(typeof galleryCategories)[number] | "All">("All");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const filteredItems = category === "All" ? galleryItems : galleryItems.filter((item) => item.category === category);
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Recent <span style={{ color: gold }}>projects.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
              Select a category or browse all. Open any project to see shipping route, delivery timeline, and proof media from the actual shipment.
            </p>
          </div>
          <div className="mb-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => setCategory("All")} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: category === "All" ? gold : dark }}>All</button>
            {galleryCategories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: category === item ? gold : dark }}>{item}</button>)}
          </div>
          {filteredItems.length === 0 ? (
            <div className={`rounded-[28px] border bg-[#FAFAF8] p-8 text-center shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white" style={{ color: gold }}><LayoutGrid className="h-5 w-5" /></div>
              <p className="mt-4 text-sm leading-7 text-[#4A4A4A]">No projects in this category yet. Send us a message on WhatsApp and we can share examples relevant to what you are looking for.</p>
              <a href={createWhatsAppUrl("Hello BuySmart, I would like to see examples of recent projects.")} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: gold }}>Ask on WhatsApp <ArrowRight className="h-4 w-4" /></a>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => {
                const itemKey = `${item.media}-${item.title}`;
                const isExpanded = expandedItem === itemKey;
                return (
                <div key={itemKey} className={`overflow-hidden rounded-[28px] border bg-white shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                  {item.mediaType === "image" ? (
                    <div className="group relative overflow-hidden bg-[#111111]">
                      <img src={item.media} alt={item.alt} className="h-72 w-full object-cover opacity-90 transition-transform duration-[800ms] ease-out group-hover:scale-110 group-hover:opacity-100" loading="lazy" />
                    </div>
                  ) : (
                    <video src={item.media} className="h-72 w-full object-cover" muted playsInline loop controls preload="metadata" />
                  )}
                  <div className="p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">{item.category}</div>
                    <div className="mt-2 text-lg font-semibold text-[#111111]">{item.title}</div>
                    <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">{item.caption}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[#7C746C]">
                      <span className="rounded-full border border-[#E5E2DA] bg-[#FAFAF8] px-3 py-2">From {item.shippedFrom}</span>
                      <span className="rounded-full border border-[#E5E2DA] bg-[#FAFAF8] px-3 py-2">{inferFreightMode(item.timeline)}</span>
                      <span className="rounded-full border border-[#E5E2DA] bg-[#FAFAF8] px-3 py-2">{item.mediaType === "video" ? "Video proof" : "Photo proof"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedItem((current) => (current === itemKey ? null : itemKey))}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#111111]"
                    >
                      {isExpanded ? "Hide details" : "View details"} <ArrowRight className={`h-4 w-4 transition ${isExpanded ? "rotate-90" : ""}`} style={{ color: gold }} />
                    </button>
                    {isExpanded ? (
                      <div className="mt-5 grid gap-4 rounded-[22px] border border-[#E5E2DA] bg-[#FAFAF8] p-4">
                        <p className="text-sm leading-7 text-[#4A4A4A]">{buildProjectInsight(item)}</p>
                        <div className="grid gap-2 text-sm text-[#4A4A4A]">
                          <div><span className="font-semibold text-[#111111]">What this shows:</span> {item.caption}</div>
                          <div><span className="font-semibold text-[#111111]">Origin:</span> {item.shippedFrom}</div>
                          <div><span className="font-semibold text-[#111111]">Expected timeline:</span> {item.timeline}</div>
                          <div><span className="font-semibold text-[#111111]">Proof type:</span> {item.mediaType === "video" ? "Video from the shipment or handoff stage" : "Image from the shipment or inspection stage"}</div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )})}
            </div>
          )}
        </Container>
      </section>

    </main>
  );
}

export function TestimonialsPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Written reviews, proof media, customer visuals, and success stories in one trust <span style={{ color: gold }}>section.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
              BuySmart has a 5.0 rating on Google from verified customers. Read what buyers are saying about their experience.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_18px_48px_rgba(17,17,17,0.08)] ${cardBorder}`}>
              <div className="text-xs uppercase tracking-[0.18em]" style={{ color: gold }}>Google rating</div>
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="mt-3 text-6xl font-bold tracking-[-0.05em] text-[#111111]">5.0</div>
              <div className="mt-3 flex gap-1.5">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-[#C9A227] text-[#C9A227]" />)}</div>
              <p className="mt-4 text-sm leading-7 text-[#4A4A4A]">A visible Google rating helps anchor the rest of the testimonial proof in something customers recognise instantly.</p>
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#111111]">View business profile <ArrowRight className="h-4 w-4" style={{ color: gold }} /></a>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {writtenTestimonials.map((item) => (
                <div key={item.title} className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">{item.name}</div>
                  <div className="mt-2 text-lg font-semibold text-[#111111]">{item.title}</div>
                  <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">{item.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-8 lg:py-12">
        <Container>
          <div className="mb-10">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              WhatsApp screenshot images, customer visuals, and trust <span style={{ color: gold }}>documentation.</span>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {testimonialMedia.map((item) => (
              <div key={item.title} className={`overflow-hidden rounded-[28px] border bg-white shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
                <div className="relative">
                  <img src={item.image} alt={item.alt} className="h-[28rem] w-full object-cover" />
                  {item.image.includes("Review 1") ? <div className="absolute inset-x-0 top-0 h-20 bg-white/50 backdrop-blur-md" /> : null}
                </div>
                <div className="p-5">
                  <div className="text-lg font-semibold text-[#111111]">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Slightly longer-form stories that explain what was <span style={{ color: gold }}>solved.</span>
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {successStories.map((story) => (
              <div key={story.title} className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white" style={{ color: gold }}><ImageIcon className="h-5 w-5" /></div>
                <div className="mt-5 text-lg font-semibold text-[#111111]">{story.title}</div>
                <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">{story.story}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <ContactSection compact />
    </main>
  );
}

export function FaqPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Answers to the most common customer questions, marked up for <span style={{ color: gold }}>search.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
              Get answers to the most common questions about shipping, payments, customs, and ordering directly. No need to wait for a reply.
            </p>
          </div>
          <FaqList items={faqItems} />
        </Container>
      </section>

    </main>
  );
}

export function BlogPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container>
          <div className="mb-10">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Tips, updates, and honest buying guides from people who actually do <span style={{ color: gold }}>this.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
              Explore our latest thoughts on shipping, sourcing, and buying safely.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {blogPosts.map((post) => {
              return (
              <div key={post.slug} className={`group rounded-[28px] border bg-[#FAFAF8] shadow-[0_10px_24px_rgba(17,17,17,0.03)] overflow-hidden flex flex-col transition-shadow hover:shadow-[0_14px_34px_rgba(17,17,17,0.06)] ${cardBorder}`}>
                <div className="relative overflow-hidden bg-[#111111]">
                  <div className="aspect-[16/10] w-full">
                    <img src={post.image} alt={post.title} className="h-full w-full object-cover opacity-80 transition-transform duration-[800ms] ease-out group-hover:scale-105" loading="lazy" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">{post.category}</div>
                  <div className="mt-3 text-xl font-semibold text-[#111111] line-clamp-2" title={post.title}>{post.title}</div>
                  <p className="mt-3 text-sm leading-7 text-[#4A4A4A] line-clamp-3">{post.excerpt}</p>
                  <div className="mt-auto pt-4">
                    <div className="text-xs font-medium text-[#7C746C]">{post.date} · {post.readTime}</div>
                    <a 
                      href={`/blog/${post.slug}`} 
                      onClick={(e) => {
                        if (onNavigate) {
                          e.preventDefault();
                          onNavigate(`/blog/${post.slug}`);
                        }
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: gold }}
                    >
                      Read article <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </Container>
      </section>
      <ContactSection compact />
    </main>
  );
}

export function BlogPostPage({ slug }: { slug: string }) {
  const post = getPostBySlug(slug);
  if (!post) {
    return (
      <main className="bg-[#FAFAF8]">
        <section className="py-24">
          <Container>
            <SectionHeading eyebrow="Blog" title="Post not found." body="This article could not be found. It may have been removed or the link may be incorrect." />
          </Container>
        </section>
      </main>
    );
  }
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container className="max-w-4xl">
          <div className="group relative mb-10 overflow-hidden rounded-[28px] bg-[#111111] shadow-[0_18px_48px_rgba(17,17,17,0.08)]">
            <div className="aspect-[16/9] w-full">
              <img src={post.image} alt={post.title} className="h-full w-full object-cover opacity-80 transition-transform duration-[800ms] ease-out group-hover:scale-105" loading="lazy" />
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">{post.category}</div>
          <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="mt-4 text-[clamp(2.3rem,5vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#111111]">{post.title}</h1>
          <div className="mt-4 text-sm font-medium text-[#7C746C]">{post.date} · {post.readTime}</div>
          <div className="mt-8 grid gap-6">
            {post.body.map((paragraph, idx) => {
              // Parse simple markdown
              if (paragraph.startsWith("## ")) {
                return <h2 key={idx} style={{ fontFamily: "'Sora', sans-serif" }} className="mt-6 text-2xl font-bold text-[#111111]">{paragraph.replace("## ", "")}</h2>;
              }
              if (paragraph.startsWith("### ")) {
                return <h3 key={idx} style={{ fontFamily: "'Sora', sans-serif" }} className="mt-4 text-xl font-bold text-[#111111]">{paragraph.replace("### ", "")}</h3>;
              }
              if (paragraph.startsWith("- ")) {
                return (
                  <div key={idx} className="flex gap-3 text-base leading-8 text-[#4A4A4A]">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A227]" />
                    <span>
                      {paragraph.replace("- ", "").split(/(\*\*.*?\*\*)/g).map((part, i) => 
                        part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-semibold text-[#111111]">{part.slice(2, -2)}</strong> : part
                      )}
                    </span>
                  </div>
                );
              }
              if (paragraph.startsWith("> ")) {
                return (
                  <blockquote key={idx} className="border-l-4 border-[#C9A227] bg-[#FAFAF8] p-5 italic text-lg text-[#111111]">
                    {paragraph.replace("> ", "")}
                  </blockquote>
                );
              }
              return (
                <p key={idx} className="text-base leading-8 text-[#4A4A4A]">
                  {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => 
                    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-semibold text-[#111111]">{part.slice(2, -2)}</strong> : part
                  )}
                </p>
              );
            })}
          </div>
          <div className="mt-16">
            <NewsletterSignup inline title="Stay updated" body="Get new buying guides, importation tips, shipping updates, and market trends in your inbox." />
          </div>
        </Container>
      </section>

    </main>
  );
}

export function CookiePolicyPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container className="max-w-4xl">
          <div className="mb-10">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              How BuySmart uses cookies and similar <span style={{ color: gold }}>technologies.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
              This page explains what cookies and tracking technologies we use, what each does, and how you can control them.
            </p>
          </div>
          <div className="grid gap-5">
            <div className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="text-lg font-semibold text-[#111111]">What are cookies?</div>
              <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">
                Cookies are small text files stored on your device by your browser. They help websites remember your
                preferences, understand how the site is used, and deliver relevant advertising. BuySmart also uses similar
                technologies such as pixels and local storage for the same purposes.
              </p>
            </div>
            <div className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="text-lg font-semibold text-[#111111]">Essential</div>
              <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">
                These are required for the site to function. They include session management for the chat assistant,
                form handling for quote requests, and the cookie consent preference itself — which is stored in local
                storage, not a cookie, so no prior consent is needed to record your choice.
              </p>
            </div>
            <div className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="text-lg font-semibold text-[#111111]">Analytics — Google Analytics (GA4)</div>
              <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">
                GA4 collects anonymised data about how visitors navigate the site, which pages are most popular, and
                where traffic comes from. This helps us improve the site experience. No personally identifiable
                information is sent to Google Analytics. This is only loaded if you consent to analytics cookies.
              </p>
            </div>
            <div className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="text-lg font-semibold text-[#111111]">Marketing — Meta Pixel and TikTok Pixel</div>
              <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">
                Meta (Facebook) and TikTok pixels allow us to measure the performance of our ad campaigns and show
                relevant advertisements to people who have visited the site. These pixels may set cookies on your
                device and share limited browsing activity with Meta and TikTok respectively. These are only loaded
                if you consent to marketing cookies.
              </p>
            </div>
            <div className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="text-lg font-semibold text-[#111111]">Your rights under NDPR</div>
              <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">
                BuySmart operates in compliance with the Nigeria Data Protection Regulation (NDPR). You have the right
                to withdraw or change your consent at any time by clearing your browser cookies and local storage, or
                by using the consent banner which will reappear after consent is reset. For more information about how
                we handle your data, see our{" "}
                <a
                  href="/privacy-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, "", "/privacy-policy");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}
                  className="font-semibold underline underline-offset-2 transition hover:no-underline"
                  style={{ color: gold }}
                >
                  Privacy Policy
                </a>.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

export function PrivacyPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-8 lg:py-12">
        <Container className="max-w-4xl">
          <div className="mb-10">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              A clear privacy page for quote forms, newsletter collection, and ad <span style={{ color: gold }}>pixels.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#4A4A4A]">
              BuySmart collects only the information you choose to share through quote requests or newsletter signup. Here is how it is used and protected.
            </p>
          </div>
          <div className="grid gap-5">
            {[
              ["What we collect", "BuySmart may collect your name, phone number, WhatsApp number, email address, product links, uploaded reference images, and any other details you choose to share through the quote form or newsletter signup."],
              ["How we use it", "This information is used to respond to quote requests, provide sourcing and shipping updates, improve customer support, and send newsletter updates where you have chosen to subscribe."],
              ["Marketing and analytics", "The site is designed to support Google Analytics, Meta Pixel, TikTok Pixel, and Google Search Console. These tools may collect usage data to help improve marketing performance and site quality when configured."],
              ["Sharing and retention", "BuySmart should only share customer information where needed to provide the requested service, meet legal obligations, or work with trusted operational partners such as shipping or procurement contacts."],
              ["Your choices", "You can request updates, corrections, or removal of your information where legally permitted. Newsletter subscribers can unsubscribe at any time."],
            ].map(([title, body]) => (
              <div key={title} className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
                <div className="text-lg font-semibold text-[#111111]">{title}</div>
                <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <ContactSection compact />
    </main>
  );
}
