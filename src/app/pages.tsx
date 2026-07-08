import { useMemo, useState } from "react";
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
  destination: "Lagos" | "Outside Lagos";
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

export function HomePage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#EFEAE1] w-full min-h-[42rem] lg:min-h-[44rem] xl:min-h-[48rem]">
        <div className="absolute inset-0 hero-slideshow">
          <div className="hero-slide hero-slide-0" style={{ backgroundImage: "url('/media/hero/hero-background-1.jpg')" }} />
          <div className="hero-slide hero-slide-1" style={{ backgroundImage: "url('/media/hero/hero-background-2.jpg')" }} />
          <div className="hero-slide hero-slide-2" style={{ backgroundImage: "url('/media/hero/hero-background-3.jpg')" }} />
          <div className="hero-slide hero-slide-3" style={{ backgroundImage: "url('/media/hero/hero-background-1.jpg')" }} />
          <div className="hero-slide hero-slide-4" style={{ backgroundImage: "url('/media/hero/hero-background-2.jpg')" }} />
          <div className="hero-slide hero-slide-5" style={{ backgroundImage: "url('/media/hero/hero-background-3.jpg')" }} />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <Container className="relative z-10 py-14 lg:py-20">
          <div className="max-w-2xl text-white">
            <SectionTag>BuySmart Procurement Limited</SectionTag>
            <h1 style={{ fontFamily: "'Sora', sans-serif", color: "white" }} className="text-[clamp(2.75rem,7vw,5.25rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
              Source with <span style={{ color: gold }}>clarity</span>. Ship with <span style={{ color: gold }}>confidence</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#F0F0F0]">
              BuySmart helps Nigerian business owners and everyday buyers source from trusted suppliers in China and Vietnam, verify what they are paying for, and move goods into Nigeria without unnecessary back and forth.
            </p>
          </div>
        </Container>
      </section>

      <section id="what-we-do" className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <div className="mb-14 text-center">
            <h2 className="text-[clamp(2.3rem,5vw,3.5rem)] font-extrabold tracking-[-0.04em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
              What we <span style={{ color: gold }}>do.</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => {
              const Icon = serviceIconMap[service.icon] ?? PackageCheck;
              return (
                <div key={service.title} className={`rounded-xl border bg-[#FAFAF8] p-5 shadow-[0_8px_20px_rgba(17,17,17,0.02)] transition hover:shadow-[0_12px_28px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm" style={{ color: gold }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-base font-bold text-[#111111] leading-tight">{service.title}</div>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#4A4A4A]">{service.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
        <Container>
          <SectionHeading eyebrow="Why choose BuySmart?" title="Built for buyers who want less risk, clearer updates, and dependable delivery." center />
          <WhyChooseGrid />
        </Container>
      </section>

      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Who it's for" title="Built for buyers who mean business." center />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {["Small Business Owners", "Bulk Buyers", "Personal Shoppers", "Personal Use", "Companies, Schools & Offices"].map((audience, index) => {
              const Icon = audienceIcons[index] ?? ShoppingBag;
              return (
                <div key={audience} className={`rounded-2xl border bg-white p-6 text-center shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAF8]" style={{ color: gold }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-sm font-semibold leading-6 text-[#111111]">{audience}</div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
        <Container>
          <SectionHeading eyebrow="Recent projects" title="See what we’ve brought in recently." center />
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
              href="/recent-projects" 
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate("/recent-projects");
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

      <section className="bg-[#0D0D0D] py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <SectionTag>Trusted business</SectionTag>
            <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="max-w-2xl text-[clamp(2.2rem,4.8vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-white">
              Verified in Lagos.
              <br />
              Trusted by buyers.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#D2CCC1]">
              BuySmart is a registered import-export business operating from Lagos. Customers can see the business location, map listing, rating, and trust documentation before sending a request.
            </p>
            <div className="mt-8 grid gap-4">
              <div className="rounded-[28px] border border-[rgba(212,175,55,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.3)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                    <MapPin className="h-5 w-5 text-[#4285F4]" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Google Reviews</div>
                    <div className="text-sm text-[#ACA497]">Import export company · Egbeda, Lagos</div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-end gap-4">
                  <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-6xl font-extrabold tracking-[-0.05em] text-white">
                    5.0
                  </div>
                  <div className="pb-2">
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-[#C9A227] text-[#C9A227]" />
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-[#ACA497]">Based on verified reviews</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5 text-[#F4F1EA] shadow-[0_12px_34px_rgba(0,0,0,0.24)]">
                <div className="flex items-start gap-3">
                  <Landmark className="mt-1 h-5 w-5" style={{ color: gold }} />
                  <p className="text-sm leading-7">
                    BuySmart Procurement Limited is a verified import-export business registered and actively operating in Lagos, Nigeria.
                  </p>
                </div>
              </div>
              <div className="rounded-[28px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_12px_34px_rgba(0,0,0,0.24)]">
                <div className="grid gap-4 sm:grid-cols-[0.75fr_1.25fr] sm:items-center">
                  <div className="overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[#111111]">
                    <img src={testimonialMedia[2]?.image} alt={testimonialMedia[2]?.alt} className="h-48 w-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em]" style={{ color: gold }}>Business certificate</div>
                    <div className="mt-2 text-lg font-semibold text-white">CAC registration certificate</div>
                    <p className="mt-3 text-sm leading-7 text-[#D2CCC1]">
                      The certificate is visible here so first-time visitors can immediately see BuySmart is a registered business and not an anonymous online seller.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
            <div className="overflow-hidden rounded-[24px] border border-[rgba(212,175,55,0.14)]">
              <iframe
                title="BuySmart Lagos location map"
                src="https://www.google.com/maps?q=6+Bassey+Street,+Egbeda,+Lagos&z=15&output=embed"
                className="h-[24rem] w-full bg-white"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="grid gap-4 p-4 text-white sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4" style={{ color: gold }} />
                  <div>
                    <div className="text-sm font-semibold">{ADDRESS_LINE_1}, Egbeda</div>
                    <div className="text-sm text-[#ACA497]">{ADDRESS_LINE_2}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-1 h-4 w-4" style={{ color: gold }} />
                  <div className="text-sm text-[#D2CCC1]">Open daily, closes 6pm</div>
                </div>
              </div>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.24)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#C9A227]"
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
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Why choose BuySmart?" title="Built for buyers who want less risk, clearer updates, and dependable delivery." body="The core promise is simple: verified suppliers, transparent pricing, inspection before shipment, and support all the way to delivery." center />
          <WhyChooseGrid />
        </Container>
      </section>

      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
        <Container>
          <SectionHeading eyebrow="Who it's for" title="Built for buyers who mean business." body="From personal shopping to repeat wholesale procurement, the site is designed to be clear, fast, and professional on every device." center />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {["Small Business Owners", "Bulk Buyers", "Personal Shoppers", "Personal Use", "Companies, Schools & Offices"].map((audience, index) => {
              const Icon = audienceIcons[index] ?? ShoppingBag;
              return (
                <div key={audience} className={`rounded-2xl border bg-white p-6 text-center shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAF8]" style={{ color: gold }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-sm font-semibold leading-6 text-[#111111]">{audience}</div>
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
    <main className="bg-[#0D0D0D]">
      <section className="py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <SectionTag>Trusted business</SectionTag>
            <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="max-w-2xl text-[clamp(2.2rem,4.8vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-white">
              Verified in Lagos.
              <br />
              Trusted by buyers.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#D2CCC1]">
              BuySmart is a registered import-export business operating from Lagos. Customers can see the business location, map listing, rating, and trust documentation before sending a request.
            </p>
            <div className="mt-8 grid gap-4">
              <div className="rounded-[28px] border border-[rgba(212,175,55,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.3)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                    <MapPin className="h-5 w-5 text-[#4285F4]" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">Google Reviews</div>
                    <div className="text-sm text-[#ACA497]">Import export company · Egbeda, Lagos</div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-end gap-4">
                  <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-6xl font-extrabold tracking-[-0.05em] text-white">
                    5.0
                  </div>
                  <div className="pb-2">
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-[#C9A227] text-[#C9A227]" />
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-[#ACA497]">Based on verified reviews</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5 text-[#F4F1EA] shadow-[0_12px_34px_rgba(0,0,0,0.24)]">
                <div className="flex items-start gap-3">
                  <Landmark className="mt-1 h-5 w-5" style={{ color: gold }} />
                  <p className="text-sm leading-7">
                    BuySmart Procurement Limited is a verified import-export business registered and actively operating in Lagos, Nigeria.
                  </p>
                </div>
              </div>
              <div className="rounded-[28px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_12px_34px_rgba(0,0,0,0.24)]">
                <div className="grid gap-4 sm:grid-cols-[0.75fr_1.25fr] sm:items-center">
                  <div className="overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.14)] bg-[#111111]">
                    <img src={testimonialMedia[2]?.image} alt={testimonialMedia[2]?.alt} className="h-48 w-full object-cover object-top" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em]" style={{ color: gold }}>Business certificate</div>
                    <div className="mt-2 text-lg font-semibold text-white">CAC registration certificate</div>
                    <p className="mt-3 text-sm leading-7 text-[#D2CCC1]">
                      The certificate is visible here so first-time visitors can immediately see BuySmart is a registered business and not an anonymous online seller.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[rgba(212,175,55,0.14)] bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
            <div className="overflow-hidden rounded-[24px] border border-[rgba(212,175,55,0.14)]">
              <iframe
                title="BuySmart Lagos location map"
                src="https://www.google.com/maps?q=6+Bassey+Street,+Egbeda,+Lagos&z=15&output=embed"
                className="h-[24rem] w-full bg-white"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="grid gap-4 p-4 text-white sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4" style={{ color: gold }} />
                  <div>
                    <div className="text-sm font-semibold">{ADDRESS_LINE_1}, Egbeda</div>
                    <div className="text-sm text-[#ACA497]">{ADDRESS_LINE_2}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-1 h-4 w-4" style={{ color: gold }} />
                  <div className="text-sm text-[#D2CCC1]">Open daily, closes 6pm</div>
                </div>
              </div>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.24)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#C9A227]"
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
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Order process" title="Five clear steps from request to delivery." body="Customers should know exactly what happens after they send a product link or description, so the process is shown clearly on both desktop and mobile." center />
          <div className="hidden lg:block">
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
      <section className="border-b border-[#EFEAE1] bg-white py-14">
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
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Services" title="A complete procurement and shipping stack, presented clearly." body="Every core service is explained in plain language so customers can understand exactly what BuySmart covers before they request a quote." />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const Icon = serviceIconMap[service.icon] ?? PackageCheck;
              return (
                <div key={service.title} className={`rounded-[28px] border bg-white p-6 shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAF8]" style={{ color: gold }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>
                    <span style={{ color: gold }}>{service.title}</span>
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">{service.description}</p>
                  {service.note ? <p className="mt-4 text-xs font-medium leading-6 text-[#7C746C]">{service.note}</p> : null}
                </div>
              );
            })}
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
        <Container>
          <SectionHeading eyebrow="Why choose BuySmart" title="Eight reasons the service offer feels dependable before the first payment." />
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
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <SectionHeading eyebrow="Installment purchase page" title="Clear installment terms for hair products and approved general goods." body="The installment page is written to reduce ambiguity before payment: eligibility, deposit level, timeline, default policy, refund policy, and FAQs are all stated plainly." />
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
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="Eligibility" title="Who qualifies for an installment plan?" />
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
            <SectionHeading eyebrow="Payment schedule" title="How the payment schedule is structured." />
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
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container className="grid gap-5 lg:grid-cols-2">
          {installmentPolicies.map((policy) => (
            <div key={policy.title} className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <h3 className="text-xl font-bold tracking-[-0.02em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>{policy.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">{policy.description}</p>
            </div>
          ))}
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
        <Container>
          <SectionHeading eyebrow="FAQs" title="Installment-specific questions" body="These answers are pulled from the broader FAQ set so terms stay consistent across the site." />
          <FaqList items={installmentFaqs} />
        </Container>
      </section>

    </main>
  );
}

export function ShippingPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Shipping information" title="Published freight guidance that answers the questions customers ask most." body="The shipping page explains timing, item suitability, chargeable weight, customs, and restricted goods before a customer reaches the quote form." />
          <div className="grid gap-5 lg:grid-cols-2">
            {shippingModes.map((mode) => (
              <div key={mode.title} className={`rounded-[28px] border bg-[#FAFAF8] p-6 shadow-[0_14px_34px_rgba(17,17,17,0.04)] ${cardBorder}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white" style={{ color: gold }}>{mode.title.toLowerCase().includes("air") ? <Plane className="h-5 w-5" /> : <Ship className="h-5 w-5" />}</div>
                <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-[#111111]" style={{ fontFamily: "'Sora', sans-serif" }}>{mode.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#4A4A4A]">{mode.description}</p>
                <div className="mt-4 rounded-2xl border border-[#E5E2DA] bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Estimated delivery timeline</div>
                  <div className="mt-2 text-sm font-semibold text-[#111111]">{mode.timeline}</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {mode.bestFor.map((item) => (
                    <span key={item} className="rounded-full border border-[#E5E2DA] bg-white px-3 py-2 text-xs font-medium text-[#4A4A4A]">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
        <Container className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <SectionHeading eyebrow="How fees are calculated" title="Chargeable weight is the point most customers need explained clearly." />
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
          </div>
          <div className={`overflow-hidden rounded-[30px] border bg-white shadow-[0_18px_48px_rgba(17,17,17,0.06)] ${cardBorder}`}>
            <img src="/media/shipping-notice.png" alt="Shipping charges notice by BuySmart" className="w-full object-cover" />
          </div>
        </Container>
      </section>
      <section className="border-b border-[#EFEAE1] bg-white py-20">
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
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
        <Container>
          <SectionHeading eyebrow="Restricted and prohibited items" title="Publishing these categories up front reduces disputes later." />
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
  const [state, setState] = useState<EstimatorState>({ mode: "air", destination: "Lagos", actualWeight: "", length: "", width: "", height: "" });
  const volumetricWeight = useMemo(() => {
    const length = Number(state.length);
    const width = Number(state.width);
    const height = Number(state.height);
    if (!length || !width || !height) return 0;
    return Number(((length * width * height) / estimatorConfig.divisor).toFixed(2));
  }, [state.height, state.length, state.width]);
  const actualWeight = Number(state.actualWeight) || 0;
  const chargeableWeight = Math.max(actualWeight, volumetricWeight, estimatorConfig.minimumChargeableWeight);
  const rates = estimatorConfig.rates[state.mode][state.destination];
  const lowEstimate = Math.round(chargeableWeight * rates.low);
  const highEstimate = Math.round(chargeableWeight * rates.high);

  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <SectionHeading eyebrow="Shipment cost estimator" title="A simple calculator customers can use before they ask for an exact quote." body="Rates are stored as code variables, so the client can update the estimate range later without adding a database." />
            <div className={`rounded-[30px] border bg-[#FAFAF8] p-6 shadow-[0_18px_48px_rgba(17,17,17,0.04)] ${cardBorder}`}>
              <div className="flex flex-wrap gap-3">
                {(["air", "sea"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => setState((current) => ({ ...current, mode }))} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: state.mode === mode ? gold : dark }}>
                    {mode === "air" ? "Air" : "Sea"}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-[#111111]">
                  Destination
                  <select value={state.destination} onChange={(event) => setState((current) => ({ ...current, destination: event.target.value as EstimatorState["destination"] }))} className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none">
                    {estimatorConfig.destinations.map((destination) => <option key={destination} value={destination}>{destination}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-[#111111]">
                  Actual weight (kg)
                  <input type="number" min="0" step="0.1" value={state.actualWeight} onChange={(event) => setState((current) => ({ ...current, actualWeight: event.target.value }))} className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none" placeholder="e.g. 12" />
                </label>
                {[
                  ["Length (cm)", "length"],
                  ["Width (cm)", "width"],
                  ["Height (cm)", "height"],
                ].map(([label, field]) => (
                  <label key={field} className="grid gap-2 text-sm font-medium text-[#111111]">
                    {label}
                    <input type="number" min="0" value={state[field as keyof EstimatorState]} onChange={(event) => setState((current) => ({ ...current, [field]: event.target.value }))} className="rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none" />
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className={`rounded-[30px] border bg-[#FAFAF8] p-6 shadow-[0_18px_48px_rgba(17,17,17,0.08)] ${cardBorder}`}>
            <div className="rounded-2xl border border-[#E5E2DA] bg-white p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Volumetric weight</div><div style={{ fontFamily: "'Sora', sans-serif" }} className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#111111]">{volumetricWeight.toFixed(2)}kg</div></div>
            <div className="mt-4 rounded-2xl border border-[#E5E2DA] bg-white p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Chargeable weight</div><div style={{ fontFamily: "'Sora', sans-serif" }} className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#111111]">{chargeableWeight.toFixed(2)}kg</div><p className="mt-3 text-sm leading-6 text-[#4A4A4A]">This uses the higher of actual weight and volumetric weight.</p></div>
            <div className="mt-4 rounded-2xl border border-[#E5E2DA] bg-white p-5"><div className="text-xs uppercase tracking-[0.18em] text-[#7C746C]">Estimated cost range</div><div style={{ fontFamily: "'Sora', sans-serif" }} className="mt-2 text-[clamp(1.8rem,5vw,2.7rem)] font-bold tracking-[-0.04em] text-[#111111]">₦{lowEstimate.toLocaleString()} to ₦{highEstimate.toLocaleString()}</div></div>
            <a href={createWhatsAppUrl(["Hello BuySmart, I need an exact shipping quote.", `Mode: ${state.mode === "air" ? "Air" : "Sea"}`, `Destination: ${state.destination}`, `Actual weight: ${state.actualWeight || "Not provided"}kg`, `Dimensions: ${state.length || "-"}cm × ${state.width || "-"}cm × ${state.height || "-"}cm`, `Estimated chargeable weight: ${chargeableWeight}kg`].join("\n"))} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: gold }}>
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
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Recent projects" title="See what we’ve actually brought in recently." body="Filter by category, then open any item to see extra context about the goods, shipping route, and what the proof media is showing." />
          <div className="mb-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => setCategory("All")} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: category === "All" ? gold : dark }}>All</button>
            {galleryCategories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: category === item ? gold : dark }}>{item}</button>)}
          </div>
          {filteredItems.length === 0 ? (
            <div className={`rounded-[28px] border bg-[#FAFAF8] p-8 text-center shadow-[0_10px_24px_rgba(17,17,17,0.03)] ${cardBorder}`}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white" style={{ color: gold }}><LayoutGrid className="h-5 w-5" /></div>
              <p className="mt-4 text-sm leading-7 text-[#4A4A4A]">More verified projects can be added to this category as new client-approved media becomes available.</p>
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
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Testimonials" title="Written reviews, proof media, customer visuals, and success stories in one trust section." body="The Google 5.0 rating is pulled directly into this area so the strongest proof signals reinforce each other." />
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
      <section className="border-b border-[#EFEAE1] bg-[#FAFAF8] py-20">
        <Container>
          <SectionHeading eyebrow="Proof media" title="WhatsApp screenshot images, customer visuals, and trust documentation." />
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
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Success stories" title="Slightly longer-form stories that explain what was solved." />
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
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="FAQ page" title="Answers to the most common customer questions, marked up for search." body="The FAQ page is designed for readability, structured data, and quick answers before the user reaches WhatsApp." />
          <FaqList items={faqItems} />
        </Container>
      </section>

    </main>
  );
}

export function BlogPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container>
          <SectionHeading eyebrow="Blog / updates" title="Tips, updates, and honest buying guides from people who actually do this." body="Explore our latest thoughts on shipping, sourcing, and buying safely." />
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
                  <div className="mt-4 text-xs font-medium text-[#7C746C]">{post.date} · {post.readTime}</div>
                  <a 
                    href={`/blog/${post.slug}`} 
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(`/blog/${post.slug}`);
                      }
                    }}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 mt-auto"
                    style={{ backgroundColor: gold }}
                  >
                    Read article <ArrowRight className="h-4 w-4" />
                  </a>
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
            <SectionHeading eyebrow="Blog" title="Post not found." body="The requested article does not exist in the current content library." />
          </Container>
        </section>
      </main>
    );
  }
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-20">
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

export function PrivacyPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#EFEAE1] bg-white py-20">
        <Container className="max-w-4xl">
          <SectionHeading eyebrow="Privacy policy" title="A clear privacy page for quote forms, newsletter collection, and ad pixels." body="This page is written to support NDPR-aligned transparency around the customer data collected on the site." />
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
