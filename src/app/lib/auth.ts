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
  clientId?: string;
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
  businessName?: string;
  alternatePhone?: string;
  alternateEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  categoryInterest?: string;
  clientCode: string;
  signupMethod: 'email' | 'google' | 'manual';
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
  currentLocation?: string;
  assignedClientId?: string;
  assignedClientCode?: string;
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
const RATES_KEY = 'buysmart_shipping_rates';
const NOTIFICATIONS_KEY = 'buysmart_admin_notifications';
const TAWK_KEY = 'buysmart_tawk_config';

export type AdminNotification = {
  id: string;
  type: 'new_client' | 'payment' | 'shipment';
  title: string;
  message: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCode: string;
  timestamp: string;
  read: boolean;
};

export function getAdminNotifications(): AdminNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addAdminNotification(notif: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>): AdminNotification[] {
  try {
    const list = getAdminNotifications();
    const newRecord: AdminNotification = {
      ...notif,
      id: 'notif-' + Date.now(),
      timestamp:
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) +
        ', ' +
        new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      read: false,
    };
    const updated = [newRecord, ...list].slice(0, 30);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function markNotificationRead(id: string): AdminNotification[] {
  try {
    const list = getAdminNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAllNotifications(): void {
  try {
    localStorage.removeItem(NOTIFICATIONS_KEY);
  } catch {}
}

/** Removes a single signup alert so the desk can dismiss it for good. */
export function dismissAdminNotification(id: string): AdminNotification[] {
  try {
    const updated = getAdminNotifications().filter((n) => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// Tawk.to Live Desk Settings
export type TawkConfig = {
  propertyId: string;
  widgetId: string;
  directChatUrl?: string;
};

export const DEFAULT_TAWK_CONFIG: TawkConfig = {
  propertyId: '',
  widgetId: 'default',
  directChatUrl: '',
};

export function getTawkConfig(): TawkConfig {
  try {
    const raw = localStorage.getItem(TAWK_KEY);
    return raw ? { ...DEFAULT_TAWK_CONFIG, ...JSON.parse(raw) } : DEFAULT_TAWK_CONFIG;
  } catch {
    return DEFAULT_TAWK_CONFIG;
  }
}

export function saveTawkConfig(config: Partial<TawkConfig>): TawkConfig {
  try {
    const current = getTawkConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(TAWK_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_TAWK_CONFIG;
  }
}

// Master Staff & Admin Credentials (Strict Single Login)
export const MASTER_ADMIN_EMAIL = 'admin@buysmart.ng';
export const MASTER_ADMIN_PASS = 'adminglorialocked';

export function verifyAdminCredentials(email: string, pass: string): boolean {
  const normEmail = email.trim().toLowerCase();
  const normPass = pass.trim();
  return (normEmail === 'admin@buysmart.ng' || normEmail === 'management@buysmart.ng') && normPass === 'adminglorialocked';
}

// Shipping Calculator Rates Configuration
export type ShippingRates = {
  airFreightRatePerKg: number;
  seaFreightRatePerKg: number;
  seaFreightRatePerCbm: number;
  usdToNgnRate: number;
  clearanceFeePerKg: number;
  handlingFee: number;
  lastUpdated: string;
  updatedBy: string;
};

export const DEFAULT_SHIPPING_RATES: ShippingRates = {
  airFreightRatePerKg: 8500,
  seaFreightRatePerKg: 2200,
  seaFreightRatePerCbm: 450000,
  usdToNgnRate: 1550,
  clearanceFeePerKg: 500,
  handlingFee: 3000,
  lastUpdated: 'Nov 23, 2026',
  updatedBy: 'Operations Management',
};

export function getShippingRates(): ShippingRates {
  try {
    const raw = localStorage.getItem(RATES_KEY);
    if (!raw) {
      localStorage.setItem(RATES_KEY, JSON.stringify(DEFAULT_SHIPPING_RATES));
      return DEFAULT_SHIPPING_RATES;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SHIPPING_RATES, ...parsed };
  } catch {
    return DEFAULT_SHIPPING_RATES;
  }
}

export function saveShippingRates(rates: Partial<ShippingRates>): ShippingRates {
  try {
    const current = getShippingRates();
    const updated: ShippingRates = {
      ...current,
      ...rates,
      lastUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      updatedBy: 'Admin Console',
    };
    localStorage.setItem(RATES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SHIPPING_RATES;
  }
}

// Founder WhatsApp notification details
export const FOUNDER_WHATSAPP_NUMBER = '2348100130714';

export function generateFounderSignupAlertUrl(client: ClientProfile): string {
  const text = `🔔 *NEW CLIENT SIGNUP - BUYSMART PORTAL*
👤 *Client:* ${client.name}
🏢 *Business:* ${client.businessName || 'Not specified'}
📧 *Email:* ${client.email}
📱 *Phone:* ${client.phone}
💬 *WhatsApp:* ${client.whatsapp || client.phone}
📍 *Delivery Address:* ${client.address || 'Not specified'}${client.city ? `, ${client.city}` : ''}${client.state ? `, ${client.state}` : ''}
🏷️ *Client Code:* ${client.clientCode}
📦 *Category:* ${client.categoryInterest || 'General Procurement'}
🌐 *Signup Method:* ${client.signupMethod.toUpperCase()}
🕒 *Date:* ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  return `https://wa.me/${FOUNDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// No demo/seed business data. Every client, invoice, receipt, shipment and quote
// record is created by the BuySmart management desk. The identifiers below belong
// to the old demo seeds and are stripped from browsers that still cache them.
const LEGACY_DEMO_IDS = [
  'client-1', 'client-2', 'client-3', 'client-4',
  'inv-001', 'inv-002', 'inv-003', 'inv-004',
  'rec-001', 'rec-002',
  's-1', 's-2', 's-3',
  'q-1', 'q-2',
];

const INITIAL_CLIENTS: ClientProfile[] = [];

const INITIAL_INVOICES: InvoiceRecord[] = [];

const INITIAL_RECEIPTS: ReceiptRecord[] = [];

const INITIAL_SHIPMENTS: ShipmentItem[] = [];

const INITIAL_QUOTES: QuoteRequestRecord[] = [];

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

export function deleteClient(clientId: string): ClientProfile[] {
  try {
    const updated = getStoredClients().filter((c) => c.id !== clientId);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Removes records that were created by the old demo seeds. Runs once per browser
 * so an admin who already loaded the demo build is left with a clean, real-data-only desk.
 */
export function purgeLegacyDemoData(): void {
  const PURGE_KEY = 'buysmart_demo_data_purged_v1';
  try {
    if (localStorage.getItem(PURGE_KEY) === 'done') return;
    [INVOICES_KEY, RECEIPTS_KEY, CLIENTS_KEY, SHIPMENTS_KEY, QUOTES_KEY].forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cleaned = parsed.filter((record: { id?: string }) => !record?.id || !LEGACY_DEMO_IDS.includes(record.id));
      localStorage.setItem(key, JSON.stringify(cleaned));
    });
    localStorage.setItem(PURGE_KEY, 'done');
  } catch {}
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
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-merge any initial invoices that might be missing from cached storage
      const existingNums = new Set(parsed.map((p: InvoiceRecord) => p.invoiceNumber));
      const missing = INITIAL_INVOICES.filter((init) => !existingNums.has(init.invoiceNumber));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        try {
          localStorage.setItem(INVOICES_KEY, JSON.stringify(merged));
        } catch {}
        return merged;
      }
      return parsed;
    }
    return INITIAL_INVOICES;
  } catch {
    return INITIAL_INVOICES;
  }
}

export function findInvoiceByNumber(num: string): InvoiceRecord | undefined {
  const list = getStoredInvoices();
  const clean = num.trim().toLowerCase();
  const found = list.find(
    (i) => i.invoiceNumber.toLowerCase() === clean || i.id.toLowerCase() === clean
  );
  if (found) return found;

  const initFound = INITIAL_INVOICES.find(
    (i) => i.invoiceNumber.toLowerCase() === clean || i.id.toLowerCase() === clean
  );
  if (initFound) {
    saveInvoice(initFound);
    return initFound;
  }
  return undefined;
}

export function findReceiptByNumber(num: string): ReceiptRecord | undefined {
  const list = getStoredReceipts();
  const clean = num.trim().toLowerCase();
  return list.find(
    (r) =>
      r.receiptNumber.toLowerCase() === clean ||
      r.id.toLowerCase() === clean ||
      r.invoiceNumber.toLowerCase() === clean
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
  notes?: string,
  location?: string
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
          staffNotes: notes !== undefined ? notes : s.staffNotes,
          currentLocation: location !== undefined && location.trim() !== '' ? location.trim() : s.currentLocation,
          lastUpdated: 'Just now by Operations Desk',
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

// --- PAYSTACK GATEWAY CONFIGURATION ---
const PAYSTACK_CONFIG_KEY = 'buysmart_paystack_config';

export type PaystackConfig = {
  publicKey: string;
  isLive: boolean;
  merchantName: string;
};

export const DEFAULT_PAYSTACK_CONFIG: PaystackConfig = {
  publicKey: '',
  isLive: true,
  merchantName: 'BuySmart Procurement Limited',
};

function readEnvPaystackKey(): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    return (env?.VITE_PAYSTACK_PUBLIC_KEY || '').trim();
  } catch {
    return '';
  }
}

export function getPaystackConfig(): PaystackConfig {
  const fromEnv = readEnvPaystackKey();
  try {
    const raw = localStorage.getItem(PAYSTACK_CONFIG_KEY);
    const stored = raw ? { ...DEFAULT_PAYSTACK_CONFIG, ...JSON.parse(raw) } : DEFAULT_PAYSTACK_CONFIG;
    const publicKey = (stored.publicKey || '').trim() || fromEnv;
    return { ...stored, publicKey, isLive: publicKey.startsWith('pk_live_') ? true : publicKey ? false : stored.isLive };
  } catch {
    return { ...DEFAULT_PAYSTACK_CONFIG, publicKey: fromEnv };
  }
}

export function hasPaystackKey(): boolean {
  const key = getPaystackConfig().publicKey;
  return key.startsWith('pk_live_') || key.startsWith('pk_test_');
}

export function savePaystackConfig(cfg: Partial<PaystackConfig>): PaystackConfig {
  try {
    const current = getPaystackConfig();
    const updated = { ...current, ...cfg };
    localStorage.setItem(PAYSTACK_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PAYSTACK_CONFIG;
  }
}
