/**
 * BuySmart Authentication, Clients, Shipments, Invoices, Receipts & Quotes Data Management
 * Unified system supporting Client portal and Staff & Admin Management portal.
 */

export type UserRole = 'admin' | 'staff' | 'client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  token?: string;
  clientCode?: string;
  staffTitle?: string;
  avatar?: string;
  authProvider?: 'email' | 'google';
};

export type LineType = 'goods' | 'freight' | 'customs' | 'packing' | 'service' | 'exchange';

export type InvoiceLine = {
  id: string;
  type: LineType;
  description: string;
  quantity: number;
  weight?: number;
  rate?: number;
  amount: number; // in Naira
};

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientPhone: string;
  clientWhatsApp: string;
  clientEmail: string;
  clientAddress: string;
  currency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  previousBalance: number;
  discount: number;
  terms: string;
  lines: InvoiceLine[];
  subtotal: number;
  total: number;
  amountPaid: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  paymentLink: string;
  createdAt: string;
  dueDate: string;
  notes?: string;
};

export type ReceiptRecord = {
  id: string;
  receiptNumber: string;
  invoiceNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  paymentMethod: 'Bank Transfer' | 'Paystack' | 'Flutterwave' | 'Cash' | 'POS';
  bankName?: string;
  referenceNumber: string;
  amountPaid: number;
  amountInWords: string;
  balanceRemaining: number;
  paymentFor: string;
  paymentDate: string;
  receivedBy: string;
  status: 'Confirmed' | 'Pending';
  notes?: string;
  createdAt: string;
};

export type ClientProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  clientCode: string;
  signupMethod: 'email' | 'google';
  createdAt: string;
  avatar?: string;
  notes?: string;
};

export type ShipmentStage = {
  label: string;
  done: boolean;
  date?: string;
};

export type ShipmentItem = {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  origin: string;
  destination: string;
  mode: 'air' | 'sea';
  status:
    | 'Order approved'
    | 'Sourced in China'
    | 'Arrived at warehouse'
    | 'Cargo flight booked'
    | 'Customs clearing Lagos'
    | 'Ready for pickup'
    | 'Delivered';
  weight: number;
  description: string;
  estimatedArrival: string;
  lastUpdated: string;
  staffNotes: string;
  progressPercent: number;
  stages: ShipmentStage[];
};

export type QuoteRequestRecord = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  itemDescription: string;
  quantity: string;
  shippingMethod: 'Air Freight' | 'Sea Freight';
  targetTimeline?: string;
  notes?: string;
  status: 'Pending' | 'Reviewing' | 'Responded' | 'Invoiced';
  createdAt: string;
};

// Storage Keys
const AUTH_KEY = 'buysmart_auth_user';
const INVOICES_KEY = 'buysmart_stored_invoices';
const RECEIPTS_KEY = 'buysmart_stored_receipts';
const CLIENTS_KEY = 'buysmart_registered_clients';
const SHIPMENTS_KEY = 'buysmart_stored_shipments';
const QUOTES_KEY = 'buysmart_stored_quotes';

// Master Staff & Admin Credentials (Strict Single Login)
export const MASTER_ADMIN_EMAIL = 'admin@buysmart.ng';
export const MASTER_ADMIN_PASS = 'adminglorialocked';

export function verifyAdminCredentials(email: string, pass: string): boolean {
  const normEmail = email.trim().toLowerCase();
  return normEmail === 'admin@buysmart.ng' && pass === 'adminglorialocked';
}

// Initial Registered Clients Seed
const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'client-1',
    name: 'Mr. Francis Ogbeide',
    email: 'francis.ogbeide@gmail.com',
    phone: '0814 555 6789',
    whatsapp: '+2348145556789',
    address: 'Plot 8, Lekki Phase 1, Lagos',
    clientCode: 'BSP-CL-1049',
    signupMethod: 'google',
    createdAt: '2026-11-15',
    notes: 'High-volume commercial client. Procuring industrial factory equipment.',
  },
  {
    id: 'client-2',
    name: 'Chief Emeka Okafor',
    email: 'emeka.okafor@gmail.com',
    phone: '0803 456 7890',
    whatsapp: '+2348034567890',
    address: '14 Trade Fair Complex, Badagry Expressway, Lagos',
    clientCode: 'BSP-CL-8821',
    signupMethod: 'email',
    createdAt: '2026-11-16',
    notes: 'Regular importer of commercial blenders and kitchen appliances.',
  },
  {
    id: 'client-3',
    name: 'Amina Bello (Bella Glow Beauty)',
    email: 'amina.bello@bellaglow.ng',
    phone: '0812 987 6543',
    whatsapp: '+2348129876543',
    address: 'Suite 4, Silverbird Galleria, Victoria Island, Lagos',
    clientCode: 'BSP-CL-9041',
    signupMethod: 'google',
    createdAt: '2026-11-18',
    notes: 'Vietnam human hair and cosmetics importer.',
  },
  {
    id: 'client-4',
    name: 'Tunde Adeleke (Skyline Retail)',
    email: 'tunde@skylineretail.com',
    phone: '0802 111 2233',
    whatsapp: '+2348021112233',
    address: 'Plot 12, Commercial Avenue, Ikeja, Lagos',
    clientCode: 'BSP-CL-7730',
    signupMethod: 'email',
    createdAt: '2026-11-19',
    notes: 'Solar equipment and electronics distributor.',
  },
];

// Initial Invoices Seed (includes Mr. Francis Ogbeide exact invoice from uploaded image)
const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'BSP-2026-001',
    clientName: 'Mr. Francis Ogbeide',
    clientPhone: '0814 555 6789',
    clientWhatsApp: '+2348145556789',
    clientEmail: 'francis.ogbeide@gmail.com',
    clientAddress: 'Plot 8, Lekki Phase 1, Lagos',
    currency: 'NGN',
    exchangeRate: 1550,
    exchangeRateDate: '2026-11-20',
    previousBalance: 0,
    discount: 0,
    terms: 'Payment is due within 5 business days of invoice issue. Full customs documentation included.',
    lines: [
      {
        id: 'line-f1',
        type: 'goods',
        description: 'Industrial Packaging & Automatic Sealing Machinery (Model BS-500)',
        quantity: 2,
        amount: 2750000,
      },
      {
        id: 'line-f2',
        type: 'freight',
        description: 'Express Air Freight Cargo (Guangzhou to Lagos Airport)',
        quantity: 1,
        weight: 95,
        rate: 8500,
        amount: 807500,
      },
      {
        id: 'line-f3',
        type: 'customs',
        description: 'Customs Duty, Terminal Handling & Fast-Track Port Clearance',
        quantity: 1,
        amount: 244339.59,
      },
      {
        id: 'line-f4',
        type: 'service',
        description: 'BuySmart Quality Verification & Factory Inspection Fee',
        quantity: 1,
        amount: 150000,
      },
    ],
    subtotal: 3951839.59,
    total: 3951839.59,
    amountPaid: 0,
    status: 'Unpaid',
    paymentLink: 'https://paystack.com/pay/buysmart-bsp-2026-001',
    createdAt: '2026-11-20',
    dueDate: '2026-11-27',
    notes: 'Official procurement invoice issued to Mr. Francis Ogbeide. Outstanding balance NGN 3,951,839.59.',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'BSP-2026-002',
    clientName: 'Chief Emeka Okafor',
    clientPhone: '0803 456 7890',
    clientWhatsApp: '+2348034567890',
    clientEmail: 'emeka.okafor@gmail.com',
    clientAddress: '14 Trade Fair Complex, Badagry Expressway, Lagos',
    currency: 'NGN',
    exchangeRate: 1550,
    exchangeRateDate: '2026-11-21',
    previousBalance: 0,
    discount: 0,
    terms: 'Payment due within 5 business days. Delivery starts upon clearance.',
    lines: [
      {
        id: 'line-1',
        type: 'goods',
        description: 'Commercial Blender & Juicer Sets (50 Cartons)',
        quantity: 50,
        amount: 2450000,
      },
      {
        id: 'line-2',
        type: 'freight',
        description: 'Air Cargo Freight from Guangzhou (CAN) to Lagos (LOS)',
        quantity: 1,
        weight: 120,
        rate: 8500,
        amount: 1020000,
      },
      {
        id: 'line-3',
        type: 'customs',
        description: 'NAFDAC/Customs Terminal Clearance & Port Handling',
        quantity: 1,
        weight: 120,
        rate: 1800,
        amount: 216000,
      },
      {
        id: 'line-4',
        type: 'service',
        description: 'Factory Inspection & Sourcing Agency Fee',
        quantity: 1,
        amount: 150000,
      },
    ],
    subtotal: 3836000,
    total: 3836000,
    amountPaid: 3836000,
    status: 'Paid',
    paymentLink: 'https://paystack.com/pay/buysmart-invoice-002',
    createdAt: '2026-11-18',
    dueDate: '2026-11-25',
    notes: 'Payment confirmed via Zenith Bank transfer. Goods cleared and dispatched.',
  },
  {
    id: 'inv-003',
    invoiceNumber: 'BSP-2026-003',
    clientName: 'Amina Bello (Bella Glow Beauty)',
    clientPhone: '0812 987 6543',
    clientWhatsApp: '+2348129876543',
    clientEmail: 'amina.bello@bellaglow.ng',
    clientAddress: 'Suite 4, Silverbird Galleria, Victoria Island, Lagos',
    currency: 'NGN',
    exchangeRate: 1550,
    exchangeRateDate: '2026-11-21',
    previousBalance: 50000,
    discount: 25000,
    terms: 'Initial 50% deposit required for procurement initiation. Balance payable upon arrival in Lagos.',
    lines: [
      {
        id: 'line-5',
        type: 'goods',
        description: 'Raw Virgin Human Hair Bundles & HD Lace Frontals (Vietnam)',
        quantity: 120,
        amount: 3200000,
      },
      {
        id: 'line-6',
        type: 'freight',
        description: 'Express Air Freight (Hanoi to Lagos MMA)',
        quantity: 1,
        weight: 35,
        rate: 11500,
        amount: 402500,
      },
      {
        id: 'line-7',
        type: 'packing',
        description: 'Waterproof Wooden Crate Packing & Labeling',
        quantity: 1,
        amount: 45000,
      },
      {
        id: 'line-8',
        type: 'service',
        description: 'BuySmart Sourcing & Factory Audit Fee',
        quantity: 1,
        amount: 180000,
      },
    ],
    subtotal: 3827500,
    total: 3852500,
    amountPaid: 2000000,
    status: 'Partial',
    paymentLink: 'https://paystack.com/pay/buysmart-bsp-003',
    createdAt: '2026-11-20',
    dueDate: '2026-11-28',
    notes: '50% initial commitment received. Sourcing in progress at Hanoi factory.',
  },
];

// Initial Receipts Seed
const INITIAL_RECEIPTS: ReceiptRecord[] = [
  {
    id: 'rec-001',
    receiptNumber: 'BSP-REC-2026-001',
    invoiceNumber: 'BSP-2026-002',
    clientName: 'Chief Emeka Okafor',
    clientPhone: '0803 456 7890',
    clientEmail: 'emeka.okafor@gmail.com',
    paymentMethod: 'Bank Transfer',
    bankName: 'Zenith Bank PLC',
    referenceNumber: 'TXN-ZEN-998412853',
    amountPaid: 3836000,
    amountInWords: 'Three Million, Eight Hundred and Thirty-Six Thousand Naira Only',
    balanceRemaining: 0,
    paymentFor: 'Full Settlement for Commercial Blender Order & Air Freight Clearance (BSP-2026-002)',
    paymentDate: '2026-11-19',
    receivedBy: 'BuySmart Procurement Limited (Founder Desk)',
    status: 'Confirmed',
    notes: 'Funds cleared in corporate account. Official digital receipt generated.',
    createdAt: '2026-11-19',
  },
  {
    id: 'rec-002',
    receiptNumber: 'BSP-REC-2026-002',
    invoiceNumber: 'BSP-2026-003',
    clientName: 'Amina Bello (Bella Glow Beauty)',
    clientPhone: '0812 987 6543',
    clientEmail: 'amina.bello@bellaglow.ng',
    paymentMethod: 'Paystack',
    bankName: 'Providus Bank Gateway',
    referenceNumber: 'PSTK-098234-VL',
    amountPaid: 2000000,
    amountInWords: 'Two Million Naira Only',
    balanceRemaining: 1852500,
    paymentFor: 'Part Payment / 50% Deposit for Vietnam Hair Sourcing (BSP-2026-003)',
    paymentDate: '2026-11-21',
    receivedBy: 'BuySmart Procurement Limited (Finance Desk)',
    status: 'Confirmed',
    notes: '50% deposit received. Balance due upon arrival in Lagos.',
    createdAt: '2026-11-21',
  },
];

// Initial Shipments Seed
const INITIAL_SHIPMENTS: ShipmentItem[] = [
  {
    id: 's-1',
    trackingNumber: 'BSP-NG-88219',
    clientName: 'Chief Emeka Okafor',
    clientEmail: 'emeka.okafor@gmail.com',
    clientPhone: '0803 456 7890',
    origin: 'Guangzhou, China',
    destination: 'Egbeda / Trade Fair, Lagos',
    mode: 'air',
    status: 'Customs clearing Lagos',
    weight: 120,
    description: 'Commercial Blenders & High-Speed Juicers (50 Cartons)',
    estimatedArrival: 'Today at 09:20 AM',
    lastUpdated: 'Today at 10:15 AM',
    staffNotes: 'Cargo landed at Murtala Muhammed Cargo Airport. Clearing agent processing final terminal release.',
    progressPercent: 80,
    stages: [
      { label: 'Order Approved', done: true, date: 'Nov 18' },
      { label: 'Sourced in China', done: true, date: 'Nov 19' },
      { label: 'Arrived at Warehouse', done: true, date: 'Nov 20' },
      { label: 'Cargo Flight Booked', done: true, date: 'Nov 21' },
      { label: 'Customs Clearing Lagos', done: true, date: 'Nov 23' },
      { label: 'Ready for Pickup', done: false },
      { label: 'Delivered', done: false },
    ],
  },
  {
    id: 's-2',
    trackingNumber: 'BSP-NG-90412',
    clientName: 'Amina Bello (Bella Glow)',
    clientEmail: 'amina.bello@bellaglow.ng',
    clientPhone: '0812 987 6543',
    origin: 'Hanoi, Vietnam',
    destination: 'Victoria Island, Lagos',
    mode: 'air',
    status: 'Cargo flight booked',
    weight: 35,
    description: 'Virgin Vietnamese Human Hair Bundles & HD Closures',
    estimatedArrival: 'Nov 26, 2026',
    lastUpdated: 'Yesterday at 4:30 PM',
    staffNotes: 'Packed in waterproof crates. Flight manifest confirmed with Qatar Airways Cargo.',
    progressPercent: 60,
    stages: [
      { label: 'Order Approved', done: true, date: 'Nov 19' },
      { label: 'Sourced in Vietnam', done: true, date: 'Nov 20' },
      { label: 'Arrived at Warehouse', done: true, date: 'Nov 21' },
      { label: 'Cargo Flight Booked', done: true, date: 'Nov 22' },
      { label: 'Customs Clearing Lagos', done: false },
      { label: 'Ready for Pickup', done: false },
      { label: 'Delivered', done: false },
    ],
  },
  {
    id: 's-3',
    trackingNumber: 'BSP-NG-10499',
    clientName: 'Mr. Francis Ogbeide',
    clientEmail: 'francis.ogbeide@gmail.com',
    clientPhone: '0814 555 6789',
    origin: 'Guangzhou, China',
    destination: 'Lekki Phase 1, Lagos',
    mode: 'air',
    status: 'Sourced in China',
    weight: 95,
    description: 'Industrial Automatic Packaging & Sealing Machinery',
    estimatedArrival: 'Nov 29, 2026',
    lastUpdated: 'Today at 2:00 PM',
    staffNotes: 'Machinery inspected at factory. Packaging into certified export wooden crate.',
    progressPercent: 35,
    stages: [
      { label: 'Order Approved', done: true, date: 'Nov 20' },
      { label: 'Sourced in China', done: true, date: 'Nov 22' },
      { label: 'Arrived at Warehouse', done: false },
      { label: 'Cargo Flight Booked', done: false },
      { label: 'Customs Clearing Lagos', done: false },
      { label: 'Ready for Pickup', done: false },
      { label: 'Delivered', done: false },
    ],
  },
];

// Initial Quotes Seed
const INITIAL_QUOTES: QuoteRequestRecord[] = [
  {
    id: 'q-1',
    clientName: 'Mr. Francis Ogbeide',
    clientEmail: 'francis.ogbeide@gmail.com',
    clientPhone: '0814 555 6789',
    itemDescription: 'Industrial Packaging & Sealing Machinery (500 units/day capacity)',
    quantity: '2 units',
    shippingMethod: 'Air Freight',
    targetTimeline: 'Within 2 weeks',
    notes: 'Require fast-track procurement and delivery to Lekki factory.',
    status: 'Invoiced',
    createdAt: '2026-11-20',
  },
  {
    id: 'q-2',
    clientName: 'Tunde Adeleke (Skyline Retail)',
    clientEmail: 'tunde@skylineretail.com',
    clientPhone: '0802 111 2233',
    itemDescription: 'Lithium LiFePO4 Batteries 48V 100Ah & 5kVA Hybrid Inverters',
    quantity: '10 sets',
    shippingMethod: 'Sea Freight',
    targetTimeline: 'End of month',
    notes: 'Need Tier-1 manufacturer verification and container consolidation.',
    status: 'Pending',
    createdAt: '2026-11-22',
  },
];

// --- AUTH FUNCTIONS ---

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } catch {}
}

export function clearAuthUser(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {}
}

// --- CLIENTS DIRECTORY FUNCTIONS ---

export function getStoredClients(): ClientProfile[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLIENTS;
  } catch {
    return INITIAL_CLIENTS;
  }
}

export function findClientByEmail(email: string): ClientProfile | undefined {
  const list = getStoredClients();
  return list.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
}

export function registerNewClient(client: ClientProfile): { success: boolean; error?: string; client?: ClientProfile } {
  const existing = findClientByEmail(client.email);
  if (existing) {
    return {
      success: false,
      error: 'An account with this email address already exists. Please log in directly with your credentials.',
    };
  }
  const updated = saveClient(client);
  const saved = updated.find((c) => c.email.toLowerCase() === client.email.toLowerCase()) || client;
  return { success: true, client: saved };
}

export function saveClient(client: ClientProfile): ClientProfile[] {
  try {
    const list = getStoredClients();
    const index = list.findIndex((c) => c.id === client.id || c.email.toLowerCase() === client.email.toLowerCase());
    let updated: ClientProfile[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...client };
    } else {
      updated = [client, ...list];
    }
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [client];
  }
}

// --- INVOICES FUNCTIONS ---

export function getStoredInvoices(): InvoiceRecord[] {
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    if (!raw) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INVOICES;
  } catch {
    return INITIAL_INVOICES;
  }
}

export function findInvoiceByNumber(num: string): InvoiceRecord | undefined {
  const list = getStoredInvoices();
  const clean = num.trim().toLowerCase();
  return list.find(
    (i) => i.invoiceNumber.toLowerCase() === clean || i.id.toLowerCase() === clean
  );
}

export function saveInvoice(invoice: InvoiceRecord): InvoiceRecord[] {
  try {
    const list = getStoredInvoices();
    const index = list.findIndex((i) => i.id === invoice.id || i.invoiceNumber === invoice.invoiceNumber);
    let updated: InvoiceRecord[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = invoice;
    } else {
      updated = [invoice, ...list];
    }
    localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [invoice];
  }
}

export function deleteInvoice(id: string): InvoiceRecord[] {
  try {
    const list = getStoredInvoices();
    const updated = list.filter((i) => i.id !== id);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// --- RECEIPTS FUNCTIONS ---

export function getStoredReceipts(): ReceiptRecord[] {
  try {
    const raw = localStorage.getItem(RECEIPTS_KEY);
    if (!raw) {
      localStorage.setItem(RECEIPTS_KEY, JSON.stringify(INITIAL_RECEIPTS));
      return INITIAL_RECEIPTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RECEIPTS;
  } catch {
    return INITIAL_RECEIPTS;
  }
}

export function saveReceipt(receipt: ReceiptRecord): ReceiptRecord[] {
  try {
    const list = getStoredReceipts();
    const index = list.findIndex((r) => r.id === receipt.id || r.receiptNumber === receipt.receiptNumber);
    let updated: ReceiptRecord[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = receipt;
    } else {
      updated = [receipt, ...list];
    }
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [receipt];
  }
}

// --- SHIPMENTS FUNCTIONS ---

export function getStoredShipments(): ShipmentItem[] {
  try {
    const raw = localStorage.getItem(SHIPMENTS_KEY);
    if (!raw) {
      localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(INITIAL_SHIPMENTS));
      return INITIAL_SHIPMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SHIPMENTS;
  } catch {
    return INITIAL_SHIPMENTS;
  }
}

export function saveShipment(shipment: ShipmentItem): ShipmentItem[] {
  try {
    const list = getStoredShipments();
    const index = list.findIndex((s) => s.id === shipment.id || s.trackingNumber === shipment.trackingNumber);
    let updated: ShipmentItem[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = shipment;
    } else {
      updated = [shipment, ...list];
    }
    localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [shipment];
  }
}

export function updateShipmentStatus(
  id: string,
  newStatus: ShipmentItem['status'],
  notes?: string
): ShipmentItem[] {
  try {
    const list = getStoredShipments();
    const stagesOrder: ShipmentItem['status'][] = [
      'Order approved',
      'Sourced in China',
      'Arrived at warehouse',
      'Cargo flight booked',
      'Customs clearing Lagos',
      'Ready for pickup',
      'Delivered',
    ];
    const targetIdx = stagesOrder.indexOf(newStatus);
    const progressPercent = Math.min(100, Math.round(((targetIdx + 1) / stagesOrder.length) * 100));

    const updated = list.map((s) => {
      if (s.id === id || s.trackingNumber === id) {
        const updatedStages = s.stages.map((stage, i) => ({
          ...stage,
          done: i <= targetIdx,
          date: i === targetIdx ? 'Today' : stage.date,
        }));
        return {
          ...s,
          status: newStatus,
          staffNotes: notes || s.staffNotes,
          lastUpdated: 'Just now by Operations',
          progressPercent,
          stages: updatedStages,
        };
      }
      return s;
    });

    localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// --- QUOTE REQUESTS FUNCTIONS ---

export function getStoredQuotes(): QuoteRequestRecord[] {
  try {
    const raw = localStorage.getItem(QUOTES_KEY);
    if (!raw) {
      localStorage.setItem(QUOTES_KEY, JSON.stringify(INITIAL_QUOTES));
      return INITIAL_QUOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_QUOTES;
  } catch {
    return INITIAL_QUOTES;
  }
}

export function saveQuoteRequest(quote: QuoteRequestRecord): QuoteRequestRecord[] {
  try {
    const list = getStoredQuotes();
    const index = list.findIndex((q) => q.id === quote.id);
    let updated: QuoteRequestRecord[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = quote;
    } else {
      updated = [quote, ...list];
    }
    localStorage.setItem(QUOTES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [quote];
  }
}

export function updateQuoteStatus(id: string, status: QuoteRequestRecord['status']): QuoteRequestRecord[] {
  try {
    const list = getStoredQuotes();
    const updated = list.map((q) => (q.id === id ? { ...q, status } : q));
    localStorage.setItem(QUOTES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// Convert amount number to words (English Naira)
export function numberToWordsNaira(amount: number): string {
  if (amount === 0) return 'Zero Naira Only';
  const whole = Math.floor(amount);
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
      if (n > 0) str += 'and ';
    }
    if (n >= 10 && n <= 19) {
      str += teens[n - 10] + ' ';
    } else if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      if (n % 10 > 0) str += units[n % 10] + ' ';
    } else if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  let result = '';
  const billions = Math.floor(whole / 1000000000);
  const millions = Math.floor((whole % 1000000000) / 1000000);
  const thousands = Math.floor((whole % 1000000) / 1000);
  const remainder = whole % 1000;

  if (billions > 0) result += convertChunk(billions) + ' Billion ';
  if (millions > 0) result += convertChunk(millions) + ' Million ';
  if (thousands > 0) result += convertChunk(thousands) + ' Thousand ';
  if (remainder > 0) result += convertChunk(remainder) + ' ';

  return result.trim() + ' Naira Only';
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
