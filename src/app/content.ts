export const SITE_URL = "https://buy-smart-flax.vercel.app";
export const BUSINESS_NAME = "BuySmart Procurement Limited";
export const WA_PHONE = "2348100130714";
export const PHONE_DISPLAY = "0810 013 0714";
export const EMAIL = "kingsleyglory272@gmail.com";
export const ADDRESS_LINE_1 = "6 Bassey Street, Egbeda";
export const ADDRESS_LINE_2 = "Lagos 100276, Nigeria";
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=6+Bassey+Street+Egbeda+Lagos";
export const WA_GREETING =
  "Hello BuySmart, I would like to request a quote for sourcing and shipping.";

export type ServiceItem = {
  icon: string;
  title: string;
  description: string;
  note?: string;
};

export type FAQItem = {
  question: string;
  answer: string;
  category: "general" | "installment";
};

export type GalleryItem = {
  category:
    | "Electronics"
    | "Hair"
    | "Kitchen Appliances"
    | "Baby Products"
    | "Phones"
    | "Vehicles"
    | "General Goods"
    | "USB Backpacks"
    | "TVs";
  title: string;
  media: string;
  mediaType: "image" | "video";
  shippedFrom: string;
  timeline: string;
  caption: string;
  alt: string;
};

export type SocialLink = {
  name: string;
  url: string;
  enabled: boolean;
};

export const socialLinks: SocialLink[] = [
  { name: "TikTok", url: "", enabled: false },
  { name: "Instagram", url: "", enabled: false },
  { name: "Facebook", url: "", enabled: false },
  { name: "WhatsApp", url: `https://wa.me/${WA_PHONE}`, enabled: true },
  { name: "Telegram", url: "", enabled: false },
  { name: "Google Business", url: GOOGLE_MAPS_URL, enabled: true },
];

export const analyticsConfig = {
  ga4Id: "",
  metaPixelId: "",
  tikTokPixelId: "",
  searchConsoleVerification: "",
  newsletterProvider: "Brevo",
  newsletterAction: "",
};

export const services: ServiceItem[] = [
  {
    icon: "search",
    title: "Strategic Sourcing",
    description:
      "We find the right suppliers and products to match your specifications, budget, and delivery goals — locally and internationally.",
  },
  {
    icon: "shield",
    title: "Supplier Verification and Audits",
    description:
      "We vet suppliers for legitimacy, track record, and quality standards before you commit funds or place large orders.",
  },
  {
    icon: "inspection",
    title: "Quality Inspection",
    description:
      "We check goods before shipment to confirm quantity, specs, packaging, and overall quality match what was agreed.",
  },
  {
    icon: "briefcase",
    title: "Procurement for Businesses, Hotels, and Companies",
    description:
      "Ongoing sourcing and supply support for organizations with recurring procurement needs — inventory, equipment, and operational supplies.",
  },
  {
    icon: "truck",
    title: "Logistics Coordination",
    description:
      "We coordinate shipping, customs, and delivery from supplier to destination — including handoff updates and documentation support.",
  },
  {
    icon: "calendar",
    title: "Procurement Consulting",
    description:
      "We advise businesses on how to build or improve their sourcing and supply process — pricing, supplier strategy, and risk control.",
  },
  {
    icon: "file",
    title: "Import and Export Support",
    description:
      "We handle documentation and compliance requirements for cross-border movement so shipments clear properly and predictably.",
  },
  {
    icon: "factory",
    title: "China and Vietnam Sourcing",
    description:
      "Our strongest and most established sourcing region — ideal for clients specifically buying from China or Vietnam with on-ground coordination.",
  },
  {
    icon: "package",
    title: "Complete Procurement Solutions",
    description:
      "End-to-end sourcing, verification, inspection, and delivery handled for you — from first request to final handoff.",
  },
];

export const whyChoose = [
  "Verified Suppliers",
  "Transparent Pricing",
  "Product Inspection",
  "Reliable Shipping",
  "Professional Procurement",
  "Factory Prices",
  "Customer Support",
  "Door to Door Delivery",
];

export const audiences = [
  "Small Business Owners",
  "Bulk Buyers",
  "Personal Shoppers",
  "Personal Use",
  "Companies, Schools & Offices",
];

export const homeStats = [
  { label: "Source markets", value: "Worldwide (China & Vietnam strongest)" },
  { label: "Shipping modes", value: "Air and Sea" },
  { label: "Google rating", value: "5.0 stars" },
];

export const orderSteps = [
  {
    title: "Step 1",
    heading: "Send us your product link or description.",
  },
  {
    title: "Step 2",
    heading: "We verify the supplier and send you a quotation.",
  },
  {
    title: "Step 3",
    heading: "Make payment for procurement and shipping.",
  },
  {
    title: "Step 4",
    heading: "We inspect and ship your goods.",
  },
  {
    title: "Step 5",
    heading: "Receive your order anywhere in Nigeria.",
  },
];

export const serviceFaqs = [
  {
    question: "How long does shipping take?",
    answer:
      "Air: approximately 10 to 15 working days. Sea: approximately 8 to 12 weeks.",
  },
  {
    question: "Can I buy one item?",
    answer: "Yes. Personal shopping is available.",
  },
  {
    question: "Do you inspect goods?",
    answer: "Yes. Inspection is available before shipment.",
  },
  {
    question: "Can I buy in bulk?",
    answer: "Yes. We specialize in wholesale procurement.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Refunds are available where BuySmart fails to deliver the agreed specification due to our error.",
  },
  {
    question: "How are shipping fees calculated?",
    answer:
      "Shipping depends on weight, volume, product category, and destination.",
  },
  {
    question: "Can I pay in installments?",
    answer: "Yes. Selected products qualify for installment payments.",
  },
  {
    question: "Can every product be shipped?",
    answer:
      "Some restricted or prohibited items cannot be shipped. Contact us before ordering.",
  },
];

export const faqItems: FAQItem[] = [
  ...serviceFaqs.map((item) => ({ ...item, category: "general" as const })),
  {
    question: "What payment methods do you accept?",
    answer:
      "Payment options are confirmed at quotation stage and may include bank transfer and other agreed channels depending on the order.",
    category: "general",
  },
  {
    question: "Do you ship to states outside Lagos?",
    answer:
      "Yes. We can arrange delivery outside Lagos after arrival, depending on your final location and delivery plan.",
    category: "general",
  },
  {
    question: "What happens if my item arrives damaged?",
    answer:
      "Tell us immediately with clear photos and delivery details. If the damage is due to our error, we handle the resolution directly with you.",
    category: "general",
  },
  {
    question: "Is there a minimum order quantity?",
    answer:
      "No. Personal shopping allows single item orders, while business procurement supports larger wholesale quantities.",
    category: "general",
  },
  {
    question: "How do I track my order once it's shipped?",
    answer:
      "We share shipment updates through the agreed communication channel once your goods have been dispatched.",
    category: "general",
  },
  {
    question: "What currencies can I pay in?",
    answer:
      "Most customer payments are arranged in Naira. Supplier settlement can be handled in RMB where required.",
    category: "general",
  },
  {
    question: "What is the minimum deposit requirement?",
    answer:
      "Installment plans start from a minimum deposit of 50 percent. Some products may require a higher deposit before procurement begins.",
    category: "installment",
  },
  {
    question: "What is the late or missed payment policy?",
    answer:
      "Late or missed payments can pause procurement, release, or shipment until the outstanding balance is cleared. Repeated default may lead to cancellation and deduction of non recoverable costs.",
    category: "installment",
  },
  {
    question: "Are all products eligible for installment payments?",
    answer:
      "No. Eligibility depends on product type, supplier terms, order value, lead time, and risk level.",
    category: "installment",
  },
  {
    question: "Can I change the product after starting an installment plan?",
    answer:
      "Product changes are only possible before procurement begins and may affect price, deposit, and delivery timing.",
    category: "installment",
  },
  {
    question: "When is the final balance due?",
    answer:
      "The final balance must be paid before dispatch, release, or delivery unless BuySmart approves a written exception.",
    category: "installment",
  },
];

export const installmentPlans = [
  {
    title: "Hair installment plan",
    description:
      "Structured for wigs, bundles, frontals, and other approved hair products sourced through verified suppliers.",
    bullets: [
      "Suitable for personal buyers, salon owners, and resellers",
      "Minimum deposit starts from 50 percent",
      "Balance follows an agreed schedule before dispatch",
    ],
  },
  {
    title: "General goods installment plan",
    description:
      "Available for selected gadgets, beauty tools, fashion items, appliances, and other approved goods.",
    bullets: [
      "Every request is reviewed before approval",
      "Minimum deposit starts from 50 percent and may be higher for higher risk goods",
      "Final payment must be completed before shipment release",
    ],
  },
];

export const installmentEligibility = [
  "Your contact details and order details can be verified",
  "The product can be sourced from an approved supplier",
  "The minimum deposit requirement is met",
  "The payment schedule matches supplier lead time and shipping plan",
  "The item is not restricted, prohibited, perishable, or unusually high risk",
];

export const installmentSchedule = [
  {
    title: "Deposit",
    description:
      "Pay the agreed starting deposit so procurement or reservation can begin.",
  },
  {
    title: "Midway payment",
    description:
      "Pay the next agreed installment while the order is being processed, packed, or prepared for shipment.",
  },
  {
    title: "Final balance",
    description:
      "Clear the remaining balance before dispatch, warehouse release, or final delivery.",
  },
];

export const installmentPolicies = [
  {
    title: "Minimum deposit requirement",
    description:
      "The minimum deposit starts from 50 percent. Higher risk products may require a higher deposit before sourcing begins.",
  },
  {
    title: "Late or missed payment policy",
    description:
      "Late or missed payments can pause procurement, release, and shipping. Repeated default may lead to cancellation and deduction of non recoverable costs.",
  },
  {
    title: "Terms and conditions",
    description:
      "Every installment arrangement is confirmed before payment. Once procurement starts, approved specifications, supplier rules, and shipping timelines apply.",
  },
  {
    title: "Refund policy",
    description:
      "Refunds are reviewed after deducting supplier fees, exchange impact, logistics costs, and any other non recoverable commitments already made on the order.",
  },
];

export const shippingModes = [
  {
    title: "Air shipping",
    description:
      "Fast shipping for urgent, valuable, or lightweight items. Air works best when speed matters more than the lowest possible landed cost.",
    timeline: "Approximately 10 to 15 working days after shipment",
    bestFor: [
      "Hair products",
      "Phones and accessories",
      "Smaller electronics",
      "Urgent restock orders",
    ],
  },
  {
    title: "Sea shipping",
    description:
      "Ideal for bulky and heavy goods when lower shipping cost matters more than speed.",
    timeline: "Approximately 8 to 12 weeks depending on the shipping schedule",
    bestFor: [
      "Bulky appliances",
      "Heavy inventory",
      "Mixed wholesale cargo",
      "Lower-margin bulky stock",
    ],
  },
];

export const volumetricFormula =
  "Length × Width × Height in cm ÷ 5000 = Volumetric Weight in kg";

export const volumetricExample = {
  dimensions: "50cm × 40cm × 30cm",
  calculation: "50 × 40 × 30 ÷ 5000 = 12kg",
};

export const shippingNotes = [
  "Air and sea timelines begin after shipment, not after payment.",
  "Actual weight and volumetric weight are compared, and whichever is higher is billed.",
  "Customs duties may apply depending on product type, declared value, and regulatory requirements.",
  "Final shipping charges are confirmed after export packing, warehouse weighing, and product review.",
];

export const shippingPreparation = [
  "Confirm the exact product specification before payment",
  "Ask whether the item is more suitable for air or sea shipping",
  "Request inspection for custom, fragile, or high value items",
  "Understand that exchange rates and supplier pricing can change daily",
  "Share your preferred delivery location early so your quote is more accurate",
];

export const prohibitedItems = [
  "Lithium batteries and battery-powered devices without prior approval",
  "Flammable liquids, hazardous chemicals, and pressurized containers",
  "Counterfeit goods and trademark violating products",
  "Weapons, ammunition, and controlled security items",
  "Perishable goods without an approved handling plan",
  "Illegal drugs or any item restricted by origin-country or Nigerian law",
];

export const customsGuide = [
  "Customs duties are not the same for every item. They depend on product category, value, documentation, and current import rules.",
  "When duties apply, the customer is responsible for the government charges unless a written quote states otherwise.",
  "Products with higher declared values, regulated categories, or incomplete documentation are more likely to attract customs attention.",
];

export const galleryCategories: GalleryItem["category"][] = [
  "Electronics",
  "Hair",
  "Kitchen Appliances",
  "Baby Products",
  "Phones",
  "Vehicles",
  "General Goods",
  "USB Backpacks",
  "TVs",
];

export const galleryItems: GalleryItem[] = [
  {
    category: "Electronics",
    title: "Verified electronics shipment",
    media: "/media/Electronic 1.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "10 to 15 working days by air",
    caption:
      "Electronics sourced from China with a shorter air-shipping timeline for faster delivery.",
    alt: "BuySmart electronics shipment sourced from China",
  },
  {
    category: "Electronics",
    title: "Consumer electronics import",
    media: "/media/Electronic 2.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "10 to 15 working days by air",
    caption:
      "Another electronics order shipped from China on an air-freight timeline for urgent delivery.",
    alt: "Consumer electronics import handled by BuySmart",
  },
  {
    category: "Electronics",
    title: "Electronics bulk order",
    media: "/media/Electronic 3.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "10 to 15 working days by air",
    caption:
      "Bulk electronics sourced through verified suppliers and moved on a fast delivery schedule.",
    alt: "Bulk electronics order imported by BuySmart",
  },
  {
    category: "Electronics",
    title: "Electronics delivery clip",
    media: "/media/Electronic 4.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "10 to 15 working days by air",
    caption:
      "Delivery proof clip showing completed electronics procurement and shipment handling.",
    alt: "Video proof of electronics delivery",
  },
  {
    category: "Electronics",
    title: "Electronics order proof",
    media: "/media/Electronic Video 1.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "10 to 15 working days by air",
    caption:
      "Real delivery media used as proof of completed electronics procurement and forwarding.",
    alt: "Electronics order proof video",
  },
  {
    category: "Electronics",
    title: "Electronics arrival update",
    media: "/media/Electronic Video 2.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "10 to 15 working days by air",
    caption:
      "Arrival and handoff proof from a real electronics shipment handled through BuySmart.",
    alt: "Electronics shipment arrival update video",
  },
  {
    category: "Electronics",
    title: "Electronics cargo handoff",
    media: "/media/Electronic Video 3.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "10 to 15 working days by air",
    caption:
      "Additional proof from a completed electronics order with delivery confirmation media.",
    alt: "Electronics cargo handoff video",
  },
  {
    category: "Baby Products",
    title: "Baby clothing order",
    media: "/media/Goods picture 1.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "10 to 15 working days by air",
    caption:
      "Baby clothing order packed in supplier-ready cartons and shipped from China on an air timeline.",
    alt: "Baby clothing order prepared for shipping",
  },
  {
    category: "General Goods",
    title: "General goods packed for export",
    media: "/media/Goods picture 2.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Mixed general goods prepared for export packing before a lower-cost sea shipment.",
    alt: "General goods prepared for export packing",
  },
  {
    category: "General Goods",
    title: "Mixed cargo dispatch proof",
    media: "/media/Goods picture 3.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Dispatch-ready mixed cargo handled as one consolidated general goods shipment.",
    alt: "Mixed cargo dispatch proof",
  },
  {
    category: "General Goods",
    title: "Warehouse consolidation order",
    media: "/media/Goods picture 4.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Multiple purchases combined into one shipment to reduce freight cost on general goods.",
    alt: "Warehouse consolidation order in BuySmart gallery",
  },
  {
    category: "General Goods",
    title: "General goods inspection image",
    media: "/media/Goods picture 5.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Inspection-stage photo used to verify what was sourced before shipment moved forward.",
    alt: "General goods inspection image",
  },
  {
    category: "General Goods",
    title: "Consolidated cargo proof",
    media: "/media/Goods picture 6.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Consolidated cargo photographed before dispatch as proof of verified shipment handling.",
    alt: "Consolidated cargo proof",
  },
  {
    category: "General Goods",
    title: "General goods order proof",
    media: "/media/Goods picture 7.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "General goods import documented with real project media and expected sea-shipping timing.",
    alt: "General goods order proof",
  },
  {
    category: "General Goods",
    title: "Bulk goods shipment",
    media: "/media/Goods picture 8.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Bulk goods order prepared for a longer but lower-cost shipment route into Nigeria.",
    alt: "Bulk goods shipment imported by BuySmart",
  },
  {
    category: "General Goods",
    title: "Mixed goods delivery proof",
    media: "/media/Goods picture 9.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Real mixed-goods project media showing completed procurement and shipment preparation.",
    alt: "Mixed goods delivery proof",
  },
  {
    category: "General Goods",
    title: "Container-ready stock",
    media: "/media/Goods picture 10.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Container-ready stock prepared for a cost-efficient general goods shipping plan.",
    alt: "Container-ready general goods stock",
  },
  {
    category: "General Goods",
    title: "Export packing update",
    media: "/media/Goods picture 11.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Export packing update shared before shipment so the customer can see progress clearly.",
    alt: "Export packing update for general goods",
  },
  {
    category: "General Goods",
    title: "Final cargo packing proof",
    media: "/media/Goods picture 12.jpeg",
    mediaType: "image",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Final packing proof from a real cargo order before dispatch and customs processing.",
    alt: "Final cargo packing proof in BuySmart gallery",
  },
  {
    category: "General Goods",
    title: "General goods delivery clip",
    media: "/media/Good 2.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "General goods delivery clip used as proof of completed import handling and customer handoff.",
    alt: "General goods delivery clip",
  },
  {
    category: "General Goods",
    title: "General goods customer handoff",
    media: "/media/Good 6.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Customer handoff proof from a completed general goods shipment managed by BuySmart.",
    alt: "General goods customer handoff video",
  },
  {
    category: "General Goods",
    title: "Mixed cargo arrival proof",
    media: "/media/Goods 1.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Arrival proof clip showing a completed mixed cargo shipment into Nigeria.",
    alt: "Mixed cargo arrival proof video",
  },
  {
    category: "General Goods",
    title: "General cargo update",
    media: "/media/Goods 3.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Project update clip captured during or after delivery of a general cargo shipment.",
    alt: "General cargo update video",
  },
  {
    category: "General Goods",
    title: "Freight handoff proof",
    media: "/media/Goods 4.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Freight handoff media reinforcing that each recent import is documented with real proof.",
    alt: "Freight handoff proof video",
  },
  {
    category: "General Goods",
    title: "Shipment completion clip",
    media: "/media/Goods 5.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Completion clip from a finished general goods order handled from sourcing through delivery.",
    alt: "Shipment completion clip for general goods",
  },
  {
    category: "General Goods",
    title: "Recent imports proof video",
    media: "/media/Goods Video 1.mp4",
    mediaType: "video",
    shippedFrom: "China",
    timeline: "8 to 12 weeks by sea",
    caption:
      "Recent imports gallery video used as proof of real client shipments handled by BuySmart.",
    alt: "Recent imports proof video",
  },
];

export const writtenTestimonials = [
  {
    name: "Verified customer",
    title: "Kitchen appliance order",
    quote:
      "Smooth communication, clear updates, and the item arrived exactly as discussed. The process felt professional from quote to delivery, and I always knew what stage the order was in.",
  },
  {
    name: "Wholesale buyer",
    title: "Repeat procurement",
    quote:
      "Supplier checks and inspection updates made a big difference. I could see what I was paying for before shipment moved, which made repeat ordering much easier.",
  },
  {
    name: "Personal shopping customer",
    title: "Single-item purchase",
    quote:
      "Even for one item, the support was direct and reliable. The delivery timeline was explained properly from the start, and the follow-up after delivery was solid.",
  },
];

export const successStories = [
  {
    title: "Electronics restock with faster turnaround",
    story:
      "A reseller needed electronics restocked quickly. BuySmart verified the supplier, confirmed product details, and moved the order by air so stock could turn faster.",
  },
  {
    title: "General goods shipment consolidated to reduce cost",
    story:
      "Multiple purchases from different suppliers were combined into one shipment. Consolidation helped reduce shipping cost while keeping the cargo organized and traceable.",
  },
  {
    title: "Single-item customer supported like a bulk buyer",
    story:
      "A personal shopping request still received supplier verification, quotation clarity, and delivery follow-through. The smaller order was handled with the same care as a wholesale shipment.",
  },
];

export const testimonialMedia = [
  {
    title: "WhatsApp review screenshot",
    image: "/media/Review 1.jpeg",
    alt: "Blurred WhatsApp review screenshot for BuySmart",
  },
  {
    title: "Customer delivery photo",
    image: "/media/Goods picture 11.jpeg",
    alt: "Customer delivery photo for a BuySmart shipment",
  },
  {
    title: "CAC registration certificate",
    image: "/media/BUYSMART CERTIFICATE OF REGISTRATION.jpeg",
    alt: "BuySmart CAC certificate of incorporation",
  },
];

export const nigerianStates = [
  "FCT Abuja",
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export function isLagos(state: string) {
  return state.toLowerCase() === "lagos";
}

export const estimatorConfig = {
  divisor: 5000,
  minimumChargeableWeight: 1,
  destinations: ["Lagos", "Outside Lagos"],
  rates: {
    air: {
      Lagos: { low: 9500, high: 12500 },
      "Outside Lagos": { low: 10500, high: 13800 },
    },
    sea: {
      Lagos: { low: 3500, high: 5200 },
      "Outside Lagos": { low: 4200, high: 6200 },
    },
  },
};

export const assistantFallback =
  "I can help with sourcing, shipping, inspections, installment plans, and order process questions. For specific quotes, account issues, complaints, or anything outside the published information, please continue on WhatsApp.";

export const footerConsent =
  "By subscribing, you agree to receive updates from BuySmart. You can unsubscribe anytime.";
