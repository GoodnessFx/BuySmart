'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import {
  Shield,
  FileText,
  CreditCard,
  Printer,
  Save,
  Plus,
  Search,
  Calendar,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Package,
  Users,
  LogOut,
  Building2,
  ExternalLink,
  ChevronDown,
  Percent,
  Check,
  AlertCircle,
  Copy,
  Receipt as ReceiptIcon,
  Eye,
  X,
  Truck,
  Plane,
  Ship,
  FolderOpen,
  MessageSquare,
  Share2,
  Send,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Edit,
  BadgeCheck,
  Calculator,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { downloadInvoicePDF, downloadReceiptPDF } from '../../lib/pdf';
import { buildPublicInvoiceLink } from '../../lib/invoice-link';
import { COMPANY_BANK_ACCOUNTS, PRIMARY_BANK_ACCOUNT, bankAccountLine } from '../../lib/bank';
import {
  getAuthUser,
  clearAuthUser,
  getStoredInvoices,
  saveInvoice,
  deleteInvoice,
  getStoredReceipts,
  saveReceipt,
  getStoredClients,
  saveClient,
  deleteClient,
  getStoredShipments,
  saveShipment,
  updateShipmentStatus,
  formatNaira,
  numberToWordsNaira,
  getShippingRates,
  saveShippingRates,
  getAdminNotifications,
  markNotificationRead,
  clearAllNotifications,
  dismissAdminNotification,
  getTawkConfig,
  saveTawkConfig,
  getPaystackConfig,
  savePaystackConfig,
  type InvoiceRecord,
  type ReceiptRecord,
  type InvoiceLine,
  type LineType,
  type ClientProfile,
  type ShipmentItem,
  type ShippingRates,
  type AdminNotification,
  type TawkConfig,
  type PaystackConfig,
} from '../../lib/auth';

const inputStyle =
  'block w-full rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]';
const labelStyle = 'text-xs font-bold text-[#111111] uppercase tracking-wider mb-1 block';
const gold = '#C9A227';

const LINE_LABELS: Record<LineType, string> = {
  goods: 'Goods Purchase',
  freight: 'Air / Sea Freight',
  customs: 'Customs & Port Terminal Clearing',
  packing: 'Packing & Protective Crating Fee',
  service: 'Procurement & Inspection Agency Fee',
  exchange: 'Exchange Conversion Charges',
};

type AdminTab = 'invoices' | 'receipts' | 'shipments' | 'clients' | 'rates' | 'reports';

const ADMIN_GUIDE_KEY = 'buysmart_admin_guide_hidden';

/** Desk-by-desk map so management always knows which console handles what. */
const adminTabGuide: { tab: AdminTab; icon: typeof FileText; title: string; body: string }[] = [
  { tab: 'invoices', icon: FileText, title: 'Invoices Desk', body: 'Create numbered customer invoices, pick the client, add line items, then share the secure payment link or PDF.' },
  { tab: 'receipts', icon: ReceiptIcon, title: 'Official Receipts', body: 'Record confirmed payments and generate stamped receipts clients can download from their portal.' },
  { tab: 'shipments', icon: Truck, title: 'Shipments & Milestones', body: 'Register parcels and push milestone updates — clients see them live on their tracking cards.' },
  { tab: 'clients', icon: Users, title: 'Clients & Folders', body: 'Every registered client gets a folder: their invoices, receipts, and contact ledger in one place.' },
  { tab: 'rates', icon: Calculator, title: 'Rates & Calculator', body: 'Set the air/sea rates clients see in their estimator, and sanity-check chargeable weight before quoting.' },
  { tab: 'reports', icon: TrendingUp, title: 'Financial Summary', body: 'Totals billed, settled, and outstanding across all clients — the desk’s quick health check.' },
];

function AdminTabHint({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-[#C9A227]/25 bg-[#FBF6E8] px-4 py-3 text-xs leading-5 text-[#6B5515]">
      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A227]" />
      <span>{children}</span>
    </div>
  );
}

const currentYear = new Date().getFullYear();
const invoiceNumberPrefix = `BSP-${currentYear}-`;
const receiptNumberPrefix = `BSP-REC-${currentYear}-`;

/** Continues the numbering sequence without demo defaults or duplicate numbers. */
function nextDocumentNumber(existing: string[] | undefined, prefix: string): string {
  const highest = (existing || []).reduce((acc, value) => {
    if (!value || !value.startsWith(prefix)) return acc;
    const trailing = parseInt(value.slice(prefix.length).replace(/\D/g, ''), 10);
    return Number.isFinite(trailing) ? Math.max(acc, trailing) : acc;
  }, 0);
  return prefix + String(highest + 1).padStart(3, '0');
}

const blankInvoiceLine = (): InvoiceLine => ({
  id: 'line-' + Date.now(),
  type: 'goods',
  description: '',
  quantity: 1,
  amount: 0,
});

/** A completely empty invoice, numbered after the records already on file. */
function createBlankInvoice(existingNumbers: string[] = []): InvoiceRecord {
  return {
    id: '',
    invoiceNumber: nextDocumentNumber(existingNumbers, invoiceNumberPrefix),
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientWhatsApp: '',
    clientEmail: '',
    clientAddress: '',
    currency: 'NGN',
    exchangeRate: 1550,
    exchangeRateDate: new Date().toISOString().slice(0, 10),
    previousBalance: 0,
    discount: 0,
    terms: 'Payment is due within 5 business days. Goods procurement commences immediately after deposit receipt.',
    lines: [blankInvoiceLine()],
    subtotal: 0,
    total: 0,
    amountPaid: 0,
    status: 'Unpaid',
    paymentLink: '',
    createdAt: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: '',
  };
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('invoices');
    const [showAdminGuide, setShowAdminGuide] = useState(() => {
      try {
        return window.localStorage.getItem(ADMIN_GUIDE_KEY) !== '1';
      } catch {
        return true;
      }
    });
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [user, setUser] = useState(getAuthUser());

  // Invoice Form State — starts empty so only real business data is entered
  const [invoiceForm, setInvoiceForm] = useState<InvoiceRecord>(createBlankInvoice());
  const invoiceGeneratorRef = useRef<HTMLDivElement | null>(null);

  // Receipt Form State
  const [receiptForm, setReceiptForm] = useState<ReceiptRecord>({
    id: '',
    receiptNumber: nextDocumentNumber([], receiptNumberPrefix),
    invoiceNumber: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    paymentMethod: 'Bank Transfer',
    bankName: PRIMARY_BANK_ACCOUNT.bankName,
    referenceNumber: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
    amountPaid: 0,
    amountInWords: '',
    balanceRemaining: 0,
    paymentFor: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    receivedBy: 'BuySmart Procurement Limited (Founder & Management Desk)',
    status: 'Confirmed',
    notes: 'Official digital receipt issued by BuySmart Management.',
    createdAt: new Date().toISOString().slice(0, 10),
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientSearch, setClientSearch] = useState('');
  const [shipmentSearch, setShipmentSearch] = useState('');

  // Modals
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<ReceiptRecord | null>(null);
  const [sendInvoiceTarget, setSendInvoiceTarget] = useState<InvoiceRecord | null>(null);
  const [selectedClientFolder, setSelectedClientFolder] = useState<ClientProfile | null>(null);
  const [updatingShipment, setUpdatingShipment] = useState<ShipmentItem | null>(null);
  const [newShipmentStatus, setNewShipmentStatus] = useState<ShipmentItem['status']>('Order approved');
  const [newShipmentNote, setNewShipmentNote] = useState('');
  const [newShipmentLocation, setNewShipmentLocation] = useState('');
  const [shippingRates, setShippingRates] = useState<ShippingRates>(getShippingRates());
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const [tawkConfig, setTawkConfig] = useState<TawkConfig>(getTawkConfig());
  const [paystackConfig, setPaystackConfig] = useState<PaystackConfig>(getPaystackConfig());
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Shipment Creation Modal State
  const [showCreateShipmentModal, setShowCreateShipmentModal] = useState(false);
  const [createShipmentForm, setCreateShipmentForm] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCode: '',
    trackingNumber: 'BSP-NG-' + Math.floor(10000 + Math.random() * 90000),
    origin: 'Guangzhou, China',
    destination: 'Lagos, Nigeria',
    mode: 'air' as 'air' | 'sea',
    status: 'Order approved' as ShipmentItem['status'],
    weight: 25,
    description: '',
    estimatedArrival: 'In 5-7 business days',
    currentLocation: 'Guangzhou Warehouse, Baiyun',
    staffNotes: 'Cargo received and registered at procurement hub.',
  });

  // Client Profile Editing Mode in Folder
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [clientEditForm, setClientEditForm] = useState<Partial<ClientProfile>>({});

  // Manual client entry (staff-created client)
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: 'Lagos State',
    categoryInterest: 'Commercial & General Goods',
    notes: '',
  });

  useEffect(() => {
    refreshAllData();
  }, []);

  // The signup alerts popover closes on outside click/tap, Escape or its own X button.
  useEffect(() => {
    if (!showNotificationsDrawer) return;

    const handlePointerDown = (event: Event) => {
      const target = event.target as Node | null;
      if (target && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotificationsDrawer(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27) {
        setShowNotificationsDrawer(false);
      }
    };

    // Capture phase on window so no inner handler can swallow the dismissal.
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('mousedown', handlePointerDown, true);
    window.addEventListener('click', handlePointerDown, true);
    window.addEventListener('touchstart', handlePointerDown, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyDown, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('mousedown', handlePointerDown, true);
      window.removeEventListener('click', handlePointerDown, true);
      window.removeEventListener('touchstart', handlePointerDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyDown, true);
    };
  }, [showNotificationsDrawer]);

  const refreshAllData = () => {
    const invs = getStoredInvoices();
    setInvoices(invs);
    const recs = getStoredReceipts();
    setReceipts(recs);
    const cls = getStoredClients();
    setClients(cls);
    const ships = getStoredShipments();
    setShipments(ships);
    setShippingRates(getShippingRates());
    setAdminNotifications(getAdminNotifications());
    setTawkConfig(getTawkConfig());

    if (invs.length > 0) {
      setInvoiceForm((prev) =>
        prev.id
          ? prev
          : {
              ...prev,
              invoiceNumber: nextDocumentNumber(invs.map((i) => i.invoiceNumber), invoiceNumberPrefix),
            }
      );
    }
  };

  const notifyTimerRef = useRef<number | null>(null);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    if (notifyTimerRef.current) window.clearTimeout(notifyTimerRef.current);
    notifyTimerRef.current = window.setTimeout(() => setNotification(null), 4500);
  };

  const handleSignOut = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  // Recalculate invoice totals
  const recalculateInvoice = (lines: InvoiceLine[], prevBal: number, disc: number) => {
    let sub = 0;
    lines.forEach((l) => {
      sub += Number(l.amount) || 0;
    });
    const tot = Math.max(0, sub + (Number(prevBal) || 0) - (Number(disc) || 0));
    return { subtotal: sub, total: tot };
  };

  const handleUpdateLine = (id: string, updates: Partial<InvoiceLine>) => {
    const updatedLines = invoiceForm.lines.map((l) => {
      if (l.id !== id) return l;
      const next = { ...l, ...updates };
      if (next.type === 'freight' || next.type === 'customs') {
        if (next.weight && next.rate) {
          next.amount = Math.round(next.weight * next.rate);
        }
      }
      return next;
    });
    const { subtotal, total } = recalculateInvoice(updatedLines, invoiceForm.previousBalance, invoiceForm.discount);
    setInvoiceForm({ ...invoiceForm, lines: updatedLines, subtotal, total });
  };

  const handleAddLine = () => {
    const newLine: InvoiceLine = {
      id: Date.now().toString(),
      type: 'goods',
      description: 'Additional Line Item',
      quantity: 1,
      amount: 0,
    };
    const updatedLines = [...invoiceForm.lines, newLine];
    const { subtotal, total } = recalculateInvoice(updatedLines, invoiceForm.previousBalance, invoiceForm.discount);
    setInvoiceForm({ ...invoiceForm, lines: updatedLines, subtotal, total });
  };

  const handleRemoveLine = (id: string) => {
    if (invoiceForm.lines.length <= 1) return;
    const updatedLines = invoiceForm.lines.filter((l) => l.id !== id);
    const { subtotal, total } = recalculateInvoice(updatedLines, invoiceForm.previousBalance, invoiceForm.discount);
    setInvoiceForm({ ...invoiceForm, lines: updatedLines, subtotal, total });
  };

  /**
   * Every invoice belongs to a customer. This finds the customer in the directory
   * (by email, then by name + phone) or registers them, so the invoice immediately
   * shows inside their client folder.
   */
  const ensureInvoiceClient = (form: InvoiceRecord): ClientProfile => {
    const email = form.clientEmail.trim().toLowerCase();
    const phone = (form.clientWhatsApp || form.clientPhone).trim();
    const name = form.clientName.trim();

    const existing =
      clients.find((c) => c.id === form.clientId) ||
      (email ? clients.find((c) => (c.email || '').toLowerCase() === email) : undefined) ||
      clients.find(
        (c) => c.name.trim().toLowerCase() === name.toLowerCase() && (c.phone || '').trim() === phone
      );

    if (existing) {
      const merged: ClientProfile = {
        ...existing,
        email: existing.email || email,
        phone: existing.phone || phone,
        whatsapp: existing.whatsapp || form.clientWhatsApp.trim() || phone,
        address: existing.address || form.clientAddress.trim(),
      };
      saveClient(merged);
      return merged;
    }

    const created: ClientProfile = {
      id: 'client-' + Date.now().toString(),
      name,
      email,
      phone,
      whatsapp: form.clientWhatsApp.trim() || phone,
      businessName: '',
      address: form.clientAddress.trim(),
      city: '',
      state: '',
      categoryInterest: 'Commercial & General Goods',
      clientCode: 'BSP-CL-' + Math.floor(1000 + Math.random() * 9000),
      signupMethod: 'manual',
      createdAt: new Date().toISOString().slice(0, 10),
      notes: 'Registered automatically when their first invoice was issued.',
    };
    saveClient(created);
    return created;
  };

  const handleSaveCurrentInvoice = () => {
    const name = invoiceForm.clientName.trim();
    const phone = (invoiceForm.clientWhatsApp || invoiceForm.clientPhone).trim();

    if (!name) {
      showNotify('Enter the customer name — pick an existing client or type a new one.', 'error');
      return;
    }
    if (!phone) {
      showNotify('Enter the customer WhatsApp / phone number so the invoice can be sent to them.', 'error');
      return;
    }

    const lines = invoiceForm.lines.filter((l) => l.description.trim() !== '' || Number(l.amount) > 0);
    if (lines.length === 0) {
      showNotify('Add at least one item with a description and an amount.', 'error');
      return;
    }
    if (lines.some((l) => !l.description.trim())) {
      showNotify('Every invoice line needs a description of the goods or service.', 'error');
      return;
    }

    const { subtotal, total } = recalculateInvoice(lines, invoiceForm.previousBalance, invoiceForm.discount);
    if (total <= 0) {
      showNotify('The invoice total must be greater than zero.', 'error');
      return;
    }

    const client = ensureInvoiceClient({ ...invoiceForm, clientName: name });
    setClients(getStoredClients());

    // Never overwrite another invoice: a new record always gets a free number.
    let number = invoiceForm.invoiceNumber.trim() || nextDocumentNumber(invoices.map((i) => i.invoiceNumber), invoiceNumberPrefix);
    const numberTaken = invoices.some(
      (i) => i.invoiceNumber.toLowerCase() === number.toLowerCase() && i.id !== invoiceForm.id
    );
    if (numberTaken) {
      number = nextDocumentNumber(invoices.map((i) => i.invoiceNumber), invoiceNumberPrefix);
    }

    const isUpdate = Boolean(invoiceForm.id);
    const recordToSave: InvoiceRecord = {
      ...invoiceForm,
      id: invoiceForm.id || 'inv-' + Date.now().toString(),
      invoiceNumber: number,
      clientId: client.id,
      clientName: name,
      clientPhone: phone,
      clientWhatsApp: invoiceForm.clientWhatsApp.trim() || phone,
      clientEmail: invoiceForm.clientEmail.trim().toLowerCase(),
      clientAddress: invoiceForm.clientAddress.trim(),
      lines,
      subtotal,
      total,
      createdAt: invoiceForm.createdAt || new Date().toISOString().slice(0, 10),
    };

    const updated = saveInvoice(recordToSave);
    setInvoices(updated);
    // Ready for the next customer straight away.
    setInvoiceForm(createBlankInvoice(updated.map((i) => i.invoiceNumber)));
    showNotify(
      isUpdate
        ? `Invoice #${number} updated for ${name}.`
        : `Invoice #${number} created for ${name} and filed in their client folder (${client.clientCode}).`
    );
    setSendInvoiceTarget(recordToSave);
  };

  const handleEditInvoice = (inv: InvoiceRecord) => {
    setInvoiceForm({
      ...inv,
      clientId: inv.clientId || '',
      lines: inv.lines && inv.lines.length > 0 ? inv.lines : [blankInvoiceLine()],
    });
    showNotify(`Editing invoice #${inv.invoiceNumber} — change the details, then press Update Invoice.`);
    window.setTimeout(() => {
      invoiceGeneratorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleDeleteInvoice = (inv: InvoiceRecord) => {
    if (!window.confirm(`Delete invoice ${inv.invoiceNumber} for ${inv.clientName}? This cannot be undone.`)) return;
    const updated = deleteInvoice(inv.id);
    setInvoices(updated);
    if (invoiceForm.id === inv.id) {
      setInvoiceForm(createBlankInvoice(updated.map((i) => i.invoiceNumber)));
    }
    showNotify(`Invoice ${inv.invoiceNumber} deleted.`);
  };

  const handleSaveCurrentReceipt = () => {
    if (!receiptForm.clientName.trim() || !receiptForm.amountPaid) {
      showNotify('Please enter client name and amount paid.', 'error');
      return;
    }
    const words = numberToWordsNaira(receiptForm.amountPaid);
    const recordToSave: ReceiptRecord = {
      ...receiptForm,
      id: receiptForm.id || 'rec-' + Date.now().toString(),
      amountInWords: words,
    };
    const updated = saveReceipt(recordToSave);
    setReceipts(updated);
    showNotify(`Official Receipt #${recordToSave.receiptNumber} saved successfully!`);
  };

  const handleQuickReceiptFromInvoice = (inv: InvoiceRecord) => {
    const nextRecNum = nextDocumentNumber(receipts.map((r) => r.receiptNumber), receiptNumberPrefix);
    const amt = inv.total;
    const rec: ReceiptRecord = {
      id: 'rec-' + Date.now().toString(),
      receiptNumber: nextRecNum,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      clientPhone: inv.clientPhone,
      clientEmail: inv.clientEmail,
      paymentMethod: 'Bank Transfer',
      bankName: PRIMARY_BANK_ACCOUNT.bankName,
      referenceNumber: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      amountPaid: amt,
      amountInWords: numberToWordsNaira(amt),
      balanceRemaining: 0,
      paymentFor: `Settlement for Invoice #${inv.invoiceNumber} - ${inv.lines[0]?.description || 'Procurement Services'}`,
      paymentDate: new Date().toISOString().slice(0, 10),
      receivedBy: 'BuySmart Procurement Limited (Founder & Management Desk)',
      status: 'Confirmed',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setReceiptForm(rec);
    setActiveTab('receipts');
    showNotify(`Populated Receipt Generator for Invoice ${inv.invoiceNumber}`);
  };

  // Pre-fill invoice for client from Client Folder
  const handleCreateInvoiceForClient = (client: ClientProfile) => {
    const fresh = createBlankInvoice(invoices.map((i) => i.invoiceNumber));
    setInvoiceForm({
      ...fresh,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientWhatsApp: client.whatsapp || client.phone,
      clientAddress: client.address || '',
    });
    setSelectedClientFolder(null);
    setActiveTab('invoices');
    showNotify(`New blank invoice ${fresh.invoiceNumber} opened for ${client.name}.`);
    window.setTimeout(() => {
      invoiceGeneratorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Update Shipment Milestone & Active Location Per Client
  const handleApplyShipmentUpdate = () => {
    if (!updatingShipment) return;
    const updated = updateShipmentStatus(
      updatingShipment.id,
      newShipmentStatus,
      newShipmentNote,
      newShipmentLocation
    );
    setShipments(updated);
    setUpdatingShipment(null);
    setNewShipmentNote('');
    setNewShipmentLocation('');
    showNotify('Shipment tracking milestone & active location updated! Client live portal synced.');
  };

  // Create & Assign New Shipment
  const handleCreateShipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createShipmentForm.clientName || !createShipmentForm.description) {
      showNotify('Please enter client details and cargo description.', 'error');
      return;
    }

    const stagesOrder: ShipmentItem['status'][] = [
      'Order approved',
      'Sourced in China',
      'Arrived at warehouse',
      'Cargo flight booked',
      'Customs clearing Lagos',
      'Ready for pickup',
      'Delivered',
    ];
    const targetIdx = stagesOrder.indexOf(createShipmentForm.status);
    const progressPercent = Math.min(100, Math.round(((targetIdx + 1) / stagesOrder.length) * 100));

    const newShip: ShipmentItem = {
      id: 's-' + Date.now(),
      trackingNumber:
        createShipmentForm.trackingNumber.trim() || 'BSP-NG-' + Math.floor(10000 + Math.random() * 90000),
      clientName: createShipmentForm.clientName.trim(),
      clientEmail: createShipmentForm.clientEmail.trim(),
      clientPhone: createShipmentForm.clientPhone.trim(),
      origin: createShipmentForm.origin.trim(),
      destination: createShipmentForm.destination.trim(),
      mode: createShipmentForm.mode,
      status: createShipmentForm.status,
      weight: Number(createShipmentForm.weight) || 1,
      description: createShipmentForm.description.trim(),
      estimatedArrival: createShipmentForm.estimatedArrival.trim(),
      lastUpdated: 'Just now by Management',
      currentLocation: createShipmentForm.currentLocation.trim() || 'Guangzhou Warehouse, Baiyun',
      assignedClientCode: createShipmentForm.clientCode,
      staffNotes: createShipmentForm.staffNotes.trim(),
      progressPercent,
      stages: [
        { label: 'Order Approved', done: targetIdx >= 0, date: targetIdx >= 0 ? 'Today' : undefined },
        { label: 'Sourced in China', done: targetIdx >= 1, date: targetIdx >= 1 ? 'Today' : undefined },
        { label: 'Arrived at Warehouse', done: targetIdx >= 2, date: targetIdx >= 2 ? 'Today' : undefined },
        { label: 'Cargo Flight Booked', done: targetIdx >= 3, date: targetIdx >= 3 ? 'Today' : undefined },
        { label: 'Customs Clearing Lagos', done: targetIdx >= 4, date: targetIdx >= 4 ? 'Today' : undefined },
        { label: 'Ready for Pickup', done: targetIdx >= 5, date: targetIdx >= 5 ? 'Today' : undefined },
        { label: 'Delivered', done: targetIdx >= 6, date: targetIdx >= 6 ? 'Today' : undefined },
      ],
    };

    const updatedList = saveShipment(newShip);
    setShipments(updatedList);
    setShowCreateShipmentModal(false);
    showNotify(`Shipment ${newShip.trackingNumber} registered & assigned to ${newShip.clientName}!`);
  };

  // Founder Edit Client Profile from Admin Desk
  const handleSaveClientEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientFolder) return;
    const updatedClient: ClientProfile = {
      ...selectedClientFolder,
      ...clientEditForm,
    };
    const updatedList = saveClient(updatedClient);
    setClients(updatedList);
    setSelectedClientFolder(updatedClient);
    setIsEditingClient(false);
    showNotify(`Client profile for ${updatedClient.name} updated successfully!`);
  };

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name.trim() || !newClientForm.phone.trim()) {
      showNotify('Client name and phone number are required.', 'error');
      return;
    }

    const normalizedEmail = newClientForm.email.trim().toLowerCase();
    if (normalizedEmail && clients.some((c) => c.email.toLowerCase() === normalizedEmail)) {
      showNotify('A client with this email address already exists in the directory.', 'error');
      return;
    }

    const client: ClientProfile = {
      id: 'client-' + Date.now().toString(),
      name: newClientForm.name.trim(),
      businessName: newClientForm.businessName.trim(),
      email: normalizedEmail || `client-${Date.now()}@buysmart.ng`,
      phone: newClientForm.phone.trim(),
      whatsapp: newClientForm.whatsapp.trim() || newClientForm.phone.trim(),
      address: newClientForm.address.trim(),
      city: newClientForm.city.trim(),
      state: newClientForm.state,
      categoryInterest: newClientForm.categoryInterest,
      clientCode: 'BSP-CL-' + Math.floor(1000 + Math.random() * 9000),
      signupMethod: 'manual',
      notes: newClientForm.notes.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = saveClient(client);
    setClients(updated);
    setShowAddClientModal(false);
    setNewClientForm({
      name: '',
      businessName: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      city: '',
      state: 'Lagos State',
      categoryInterest: 'Commercial & General Goods',
      notes: '',
    });
    showNotify(`${client.name} added to the client directory (${client.clientCode}).`);
  };

  const handleDeleteClient = (client: ClientProfile) => {
    const confirmed = window.confirm(
      `Remove ${client.name} from the client directory?\n\nTheir invoices, receipts and shipments are kept for record purposes.`
    );
    if (!confirmed) return;

    const updated = deleteClient(client.id);
    setClients(updated);
    setSelectedClientFolder(null);
    showNotify(`${client.name} removed from the client directory.`);
  };

  // Save Shipping Rates
  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveShippingRates(shippingRates);
    setShippingRates(saved);
    showNotify('Official shipping rates updated! Live synchronized across all client calculators.');
  };

  // PDF Generation with Official BuySmart Logo & Watermark
  const handleDownloadInvoicePDF = async (inv: InvoiceRecord) => {
    try {
      await downloadInvoicePDF(inv);
      showNotify(`Invoice #${inv.invoiceNumber} downloaded as official PDF with BuySmart Logo!`);
    } catch (e: any) {
      showNotify('Failed to generate PDF: ' + e?.message, 'error');
    }
  };

  const handleDownloadReceiptPDF = async (rec: ReceiptRecord) => {
    try {
      await downloadReceiptPDF(rec);
      showNotify(`Receipt #${rec.receiptNumber} downloaded with official BuySmart Stamp & Logo!`);
    } catch (e: any) {
      showNotify('Failed to generate Receipt PDF: ' + e?.message, 'error');
    }
  };
  // WhatsApp Message Link (opens the portable invoice page on any device)
  const getWhatsAppMessage = (inv: InvoiceRecord) => {
    const link = buildPublicInvoiceLink(inv);
    return `Hi, ${inv.clientName},
You have an outstanding amount of
${formatNaira(inv.total)}
for the invoice - ${inv.invoiceNumber} from Buysmart Procurement Limited.

View and pay your invoice at -
${link}

Or pay by direct transfer:
${bankAccountLine()}

• The Buysmart Procurement Limited Team`;
  };

  const handleOpenWhatsAppShare = (inv: InvoiceRecord) => {
    const rawPhone = (inv.clientWhatsApp || inv.clientPhone || '').replace(/[^0-9]/g, '');
    let intlPhone = rawPhone;
    if (rawPhone.startsWith('0')) {
      intlPhone = '234' + rawPhone.slice(1);
    }
    const message = getWhatsAppMessage(inv);
    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyShareLink = (inv: InvoiceRecord) => {
    const link = buildPublicInvoiceLink(inv);
    navigator.clipboard.writeText(link);
    showNotify('Invoice link copied to clipboard!');
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter((i) => {
    const matchSearch =
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.clientPhone.includes(searchQuery);
    const matchStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered Clients (name, email, phone or client code)
  const filteredClients = clients.filter((c) => {
    const query = clientSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.phone || '').includes(query) ||
      (c.clientCode || '').toLowerCase().includes(query)
    );
  });

  // Filtered Shipments (tracking ID, client name or phone)
  const filteredShipments = shipments.filter((s) => {
    const query = shipmentSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      s.trackingNumber.toLowerCase().includes(query) ||
      s.clientName.toLowerCase().includes(query) ||
      (s.clientPhone || '').includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] antialiased">
      {/* Tap anywhere outside the alerts popover to dismiss it */}
      {showNotificationsDrawer && (
        <div
          aria-hidden="true"
          onClick={() => setShowNotificationsDrawer(false)}
          className="fixed inset-0 z-30 bg-[#111111]/10"
        />
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#ECE8DF] bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#FAFAF8] p-2 border border-[#ECE8DF] flex items-center justify-center">
              <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Sora', sans-serif" }} className="text-lg font-extrabold text-[#111111]">
                  BuySmart Management Desk
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#6B5515] uppercase tracking-wider">
                  <Shield className="h-3 w-3" /> Staff &amp; Admin Unified
                </span>
              </div>
              <div className="text-xs text-[#66615B]">
                {user?.name || 'Administrator'} • {user?.staffTitle || 'Management & Operations'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
                title="Client Signup Notifications"
                className="relative p-2.5 rounded-full border border-[#DED9CF] bg-white text-[#4A4A4A] hover:text-[#C9A227] hover:border-[#C9A227] transition cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {adminNotifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#C9A227] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {adminNotifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotificationsDrawer && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white shadow-2xl border border-[#ECE8DF] p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-[#C9A227]" />
                      <span className="font-extrabold text-xs text-[#111111]">Portal Signup Alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {adminNotifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            clearAllNotifications();
                            setAdminNotifications([]);
                          }}
                          className="text-[10px] text-[#8C827A] hover:text-red-600 font-semibold cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowNotificationsDrawer(false)}
                        title="Close alerts"
                        aria-label="Close alerts"
                        className="p-1.5 rounded-lg border border-[#ECE8DF] text-[#66615B] hover:border-[#C9A227] hover:text-[#111111] transition cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#ECE8DF] py-2">
                    {adminNotifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#8C827A]">
                        No new signup alerts. When clients register on the portal, alerts appear here.
                      </div>
                    ) : (
                      adminNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`py-3 px-2 rounded-xl transition ${n.read ? 'opacity-70' : 'bg-[#FAFAF8]'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-[#111111]">{n.title}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-[#8C827A] whitespace-nowrap">{n.timestamp}</span>
                              <button
                                type="button"
                                onClick={() => setAdminNotifications(dismissAdminNotification(n.id))}
                                title="Dismiss this alert"
                                aria-label="Dismiss this alert"
                                className="p-1 rounded-md text-[#8C827A] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#4A4A4A] mt-1">{n.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                markNotificationRead(n.id);
                                setAdminNotifications(getAdminNotifications());
                                const matchedClient = clients.find(
                                  (c) =>
                                    c.clientCode === n.clientCode ||
                                    c.email.toLowerCase() === n.clientEmail.toLowerCase()
                                );
                                if (matchedClient) {
                                  setSelectedClientFolder(matchedClient);
                                  setShowNotificationsDrawer(false);
                                } else {
                                  setActiveTab('clients');
                                  setShowNotificationsDrawer(false);
                                }
                              }}
                              className="text-[10px] font-bold text-[#C9A227] hover:underline cursor-pointer"
                            >
                              Open Client Folder &rarr;
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAdminGuide((value) => !value)}
              title={showAdminGuide ? 'Hide desk guide' : 'Show desk guide'}
              className="p-2.5 rounded-full border border-[#DED9CF] bg-white text-[#4A4A4A] hover:text-[#C9A227] hover:border-[#C9A227] transition cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={refreshAllData}
              title="Refresh Data"
              className="p-2.5 rounded-full border border-[#DED9CF] bg-white text-[#4A4A4A] hover:text-[#C9A227] hover:border-[#C9A227] transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-[#DED9CF] bg-white px-4 py-2 text-xs font-semibold text-[#111111] shadow-sm transition hover:border-red-300 hover:text-red-600 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-[#ECE8DF]/60 py-2">
          {[
            { id: 'invoices', label: 'Invoices Desk', icon: FileText, badge: invoices.length },
            { id: 'receipts', label: 'Official Receipts', icon: ReceiptIcon, badge: receipts.length },
            { id: 'shipments', label: 'Shipments & Milestones', icon: Truck, badge: shipments.length },
            { id: 'clients', label: 'Clients Directory & Folders', icon: Users, badge: clients.length },
            { id: 'rates', label: 'Shipping Rates & Calculator', icon: Calculator },
            { id: 'reports', label: 'Financial Summary', icon: TrendingUp },
          ].map(({ id, label, icon: Icon, badge }: any) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as AdminTab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeTab === id
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'text-[#66615B] hover:bg-white hover:text-[#111111]'
                }`}
            >
              <Icon className={`h-4 w-4 ${activeTab === id ? 'text-[#C9A227]' : ''}`} />
              <span>{label}</span>
              {badge !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${activeTab === id ? 'bg-[#C9A227] text-white' : 'bg-[#ECE8DF] text-[#111111]'
                    }`}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Notifications Banner */}
      {notification && (
        <div
          className={`fixed top-24 right-6 z-50 rounded-2xl p-4 shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-900'
            }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          )}
          <span className="text-sm font-semibold">{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            title="Dismiss"
            aria-label="Dismiss notification"
            className="p-1 rounded-lg opacity-60 hover:opacity-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* First-visit desk guide: what each console does, with one-tap jumps */}
        {showAdminGuide && (
          <div className="mb-8 rounded-3xl border border-[#C9A227]/30 bg-[#FBF6E8] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B5515]">
                  <HelpCircle className="h-4 w-4 text-[#C9A227]" /> How the management console works
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-[#6B5515]/90">
                  Six desks, one console. Tap a card to jump to that desk — hide this guide anytime with the × or the ? button in the header.
                </p>
              </div>
              <button
                type="button"
                aria-label="Hide desk guide"
                onClick={() => {
                  setShowAdminGuide(false);
                  try { window.localStorage.setItem(ADMIN_GUIDE_KEY, '1'); } catch { /* ignore */ }
                }}
                className="shrink-0 rounded-full border border-[#C9A227]/30 bg-white p-2 text-[#6B5515] hover:text-[#111111] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {adminTabGuide.map((item) => (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group rounded-2xl border border-[#E5E2DA] bg-white p-4 text-left transition hover:border-[#C9A227] cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                    <item.icon className="h-4 w-4 text-[#C9A227]" />
                    {item.title}
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-[#C9A227] opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-4.5 text-[#66615B]">{item.body}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: INVOICES DESK & GENERATOR */}
        {/* ========================================================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-8">
            <AdminTabHint>
              Pick the customer first, add goods/freight/customs lines, then create the invoice — it is filed in that client’s folder and the share link carries the verified OPay account.
            </AdminTabHint>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl font-extrabold text-[#111111]">
                  Invoices &amp; Billing Desk
                </h1>
                <p className="text-sm text-[#66615B]">
                  Generate official BuySmart invoices, track payments, and send notifications via WhatsApp.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceForm(createBlankInvoice(invoices.map((i) => i.invoiceNumber)));
                    showNotify('Blank invoice opened — choose the customer, add the items, then create it.');
                    window.setTimeout(() => {
                      invoiceGeneratorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 80);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-[#C9A227]" />
                  <span>Create New Invoice</span>
                </button>
              </div>
            </div>

            {/* Invoices List Table */}
            <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C827A]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by client name, invoice number, phone..."
                    className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] pl-10 pr-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#C9A227]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#8C827A]">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-[#DED9CF] bg-white px-3 py-2 text-xs font-semibold text-[#111111] focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Sent">Sent</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#ECE8DF] text-[#8C827A] uppercase tracking-wider font-bold">
                      <th className="pb-3 px-3">Invoice No</th>
                      <th className="pb-3 px-3">Client</th>
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Total Amount</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE8DF]">
                    {filteredInvoices.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 px-3 text-center text-xs text-[#8C827A]">
                          {invoices.length === 0
                            ? 'No invoice has been created yet. Use “Create New Invoice” below to issue the first one.'
                            : 'No invoice matches this search or status filter.'}
                        </td>
                      </tr>
                    )}
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#FAFAF8] transition">
                        <td className="py-4 px-3 font-bold text-[#111111]">
                          <div className="flex items-center gap-2">
                            <span>{inv.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="font-bold text-[#111111]">{inv.clientName}</div>
                          <div className="text-[11px] text-[#8C827A]">{inv.clientPhone}</div>
                        </td>
                        <td className="py-4 px-3 text-[#66615B]">{inv.createdAt}</td>
                        <td className="py-4 px-3 font-extrabold text-[#111111]">{formatNaira(inv.total)}</td>
                        <td className="py-4 px-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Paid'
                                ? 'bg-green-100 text-green-800'
                                : inv.status === 'Unpaid'
                                  ? 'bg-amber-100 text-amber-800'
                                  : inv.status === 'Partial'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copy Public Invoice Link */}
                            <button
                              type="button"
                              onClick={() => {
                                const link = buildPublicInvoiceLink(inv);
                                navigator.clipboard.writeText(link);
                                showNotify(`Public Invoice Link copied: ${link}`);
                              }}
                              title="Copy Public Invoice Link"
                              className="p-2 rounded-xl bg-[#FAFAF8] border border-[#DED9CF] text-[#111111] hover:border-[#C9A227] transition cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            {/* Send to Client via WhatsApp Modal Button */}
                            <button
                              type="button"
                              onClick={() => setSendInvoiceTarget(inv)}
                              title="Send Invoice to Client (WhatsApp / Link)"
                              className="p-2 rounded-xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition cursor-pointer"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewInvoice(inv)}
                              title="Preview on Screen"
                              className="p-2 rounded-xl bg-[#FAFAF8] border border-[#DED9CF] text-[#111111] hover:border-[#C9A227] transition cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoicePDF(inv)}
                              title="Download PDF"
                              className="p-2 rounded-xl bg-[#C9A227]/15 text-[#6B5515] hover:bg-[#C9A227]/25 transition cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditInvoice(inv)}
                              title="Edit this invoice"
                              className="p-2 rounded-xl bg-[#FAFAF8] border border-[#DED9CF] text-[#111111] hover:border-[#C9A227] transition cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickReceiptFromInvoice(inv)}
                              title="Issue Official Receipt"
                              className="p-2 rounded-xl bg-[#111111] text-white hover:opacity-90 transition cursor-pointer"
                            >
                              <ReceiptIcon className="h-3.5 w-3.5 text-[#C9A227]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoice(inv)}
                              title="Delete this invoice"
                              className="p-2 rounded-xl border border-[#DED9CF] text-[#B3261E] hover:border-[#B3261E] hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Generator Form */}
            <div
              ref={invoiceGeneratorRef}
              className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-28"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ECE8DF]">
                <div>
                  <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-lg font-bold text-[#111111]">
                    {invoiceForm.id ? `Editing Invoice ${invoiceForm.invoiceNumber}` : 'Create Invoice for a Customer'}
                  </h2>
                  <p className="text-xs text-[#66615B]">
                    Pick the customer, add the items, then create the invoice — it is filed in their client folder and a
                    shareable payment link is generated instantly.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {invoiceForm.id && (
                    <button
                      type="button"
                      onClick={() => setInvoiceForm(createBlankInvoice(invoices.map((i) => i.invoiceNumber)))}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#DED9CF] bg-white px-4 py-2.5 text-xs font-bold text-[#111111] hover:border-[#C9A227] cursor-pointer"
                    >
                      <Plus className="h-4 w-4 text-[#C9A227]" />
                      <span>New Instead</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveCurrentInvoice}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#C9A227] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
                  >
                  <Save className="h-4 w-4" />
                  <span>{invoiceForm.id ? 'Update Invoice' : 'Create Invoice'}</span>
                  </button>
                </div>
              </div>

              {/* Customer picker — every invoice is issued to a real customer */}
              <div className="rounded-2xl border border-[#ECE8DF] bg-[#FAFAF8] p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1">
                    <label className={labelStyle}>Bill this customer</label>
                    <select
                      value={invoiceForm.clientId || ''}
                      onChange={(e) => {
                        const picked = clients.find((c) => c.id === e.target.value);
                        if (!picked) {
                          setInvoiceForm({
                            ...invoiceForm,
                            clientId: '',
                            clientName: '',
                            clientPhone: '',
                            clientWhatsApp: '',
                            clientEmail: '',
                            clientAddress: '',
                          });
                          return;
                        }
                        setInvoiceForm({
                          ...invoiceForm,
                          clientId: picked.id,
                          clientName: picked.name,
                          clientPhone: picked.phone,
                          clientWhatsApp: picked.whatsapp || picked.phone,
                          clientEmail: picked.email,
                          clientAddress: picked.address || '',
                        });
                      }}
                      className={inputStyle}
                    >
                      <option value="">New customer — type their details below</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} • {c.clientCode} • {c.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddClientModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-xs font-bold text-[#111111] hover:border-[#C9A227] cursor-pointer shrink-0"
                  >
                    <Users className="h-4 w-4 text-[#C9A227]" />
                    <span>Register a Client</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#8C827A]">
                  {invoiceForm.clientId
                    ? 'This invoice will be filed inside the selected client folder.'
                    : 'A brand-new customer is added to the Clients Directory automatically when you create the invoice.'}
                </p>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelStyle}>Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceForm.invoiceNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Client Name</label>
                  <input
                    type="text"
                    value={invoiceForm.clientName}
                    onChange={(e) => {
                      const value = e.target.value;
                      const picked = clients.find((c) => c.id === invoiceForm.clientId);
                      const stillSameClient =
                        picked && picked.name.trim().toLowerCase() === value.trim().toLowerCase();
                      setInvoiceForm({
                        ...invoiceForm,
                        clientName: value,
                        clientId: stillSameClient ? invoiceForm.clientId : '',
                      });
                    }}
                    placeholder="e.g. Mr. Francis Ogbeide"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Client WhatsApp / Phone</label>
                  <input
                    type="text"
                    value={invoiceForm.clientWhatsApp}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, clientWhatsApp: e.target.value, clientPhone: e.target.value })
                    }
                    placeholder="0814 555 6789"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Client Email</label>
                  <input
                    type="email"
                    value={invoiceForm.clientEmail}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                    placeholder="client@gmail.com"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Client Delivery Address</label>
                  <input
                    type="text"
                    value={invoiceForm.clientAddress}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientAddress: e.target.value })}
                    placeholder="Lekki Phase 1, Lagos"
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Payment Status</label>
                  <select
                    value={invoiceForm.status}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, status: e.target.value as InvoiceRecord['status'] })
                    }
                    className={inputStyle}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Sent">Sent</option>
                  </select>
                </div>
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                    Itemized Procurement &amp; Shipping Lines
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A227] hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {invoiceForm.lines.map((line, idx) => (
                    <div
                      key={line.id}
                      className="p-4 rounded-2xl border border-[#ECE8DF] bg-[#FAFAF8] grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                    >
                      <div className="md:col-span-3">
                        <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Category</label>
                        <select
                          value={line.type}
                          onChange={(e) => handleUpdateLine(line.id, { type: e.target.value as LineType })}
                          className="w-full rounded-xl border border-[#DED9CF] bg-white px-3 py-2 text-xs font-semibold"
                        >
                          <option value="goods">Goods Purchase</option>
                          <option value="freight">Air / Sea Freight</option>
                          <option value="customs">Customs &amp; Terminal Port</option>
                          <option value="packing">Packing &amp; Wooden Crating</option>
                          <option value="service">Sourcing &amp; Inspection Agency</option>
                        </select>
                      </div>

                      <div className="md:col-span-5">
                        <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Description</label>
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => handleUpdateLine(line.id, { description: e.target.value })}
                          placeholder="Description of item or service..."
                          className="w-full rounded-xl border border-[#DED9CF] bg-white px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Amount (NGN)</label>
                        <input
                          type="number"
                          value={line.amount}
                          onChange={(e) => handleUpdateLine(line.id, { amount: parseFloat(e.target.value) || 0 })}
                          className="w-full rounded-xl border border-[#DED9CF] bg-white px-3 py-2 text-xs font-bold"
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[#111111] text-white">
                <div>
                  <span className="text-xs uppercase tracking-wider text-white/70">Total Calculated Invoice Due</span>
                  <div className="text-2xl font-extrabold text-[#C9A227]">{formatNaira(invoiceForm.total)}</div>
                </div>

                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => setPreviewInvoice(invoiceForm)}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 cursor-pointer"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCurrentInvoice}
                    className="rounded-xl bg-[#C9A227] px-5 py-2 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                  >
                    Save &amp; Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: OFFICIAL RECEIPTS DESK */}
        {/* ========================================================= */}
        {activeTab === 'receipts' && (
          <div className="space-y-8">
            <AdminTabHint>
              Record a payment only after it is confirmed in the bank account. The receipt number continues the BSP-REC sequence and appears in the client’s portal instantly.
            </AdminTabHint>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl font-extrabold text-[#111111]">
                  Official Receipts Desk
                </h1>
                <p className="text-sm text-[#66615B]">
                  Issue and sign verified digital receipts carrying the BuySmart official management watermark.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveCurrentReceipt}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
              >
                <Save className="h-4 w-4 text-[#C9A227]" />
                <span>Save Official Receipt</span>
              </button>
            </div>

            {/* Issued Receipts Table */}
            <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#111111] mb-4">Issued Receipts Archive</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#ECE8DF] text-[#8C827A] uppercase tracking-wider font-bold">
                      <th className="pb-3 px-3">Receipt No</th>
                      <th className="pb-3 px-3">Client</th>
                      <th className="pb-3 px-3">Payment Channel</th>
                      <th className="pb-3 px-3">Amount Confirmed</th>
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE8DF]">
                    {receipts.map((rec) => (
                      <tr key={rec.id} className="hover:bg-[#FAFAF8] transition">
                        <td className="py-4 px-3 font-bold text-[#111111]">{rec.receiptNumber}</td>
                        <td className="py-4 px-3">
                          <div className="font-bold text-[#111111]">{rec.clientName}</div>
                          <div className="text-[11px] text-[#8C827A]">{rec.paymentFor}</div>
                        </td>
                        <td className="py-4 px-3 font-medium text-[#4A4A4A]">{rec.paymentMethod}</td>
                        <td className="py-4 px-3 font-extrabold text-green-700">{formatNaira(rec.amountPaid)}</td>
                        <td className="py-4 px-3 text-[#66615B]">{rec.paymentDate}</td>
                        <td className="py-4 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewReceipt(rec)}
                              className="p-2 rounded-xl bg-[#FAFAF8] border border-[#DED9CF] hover:border-[#C9A227] cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadReceiptPDF(rec)}
                              className="p-2 rounded-xl bg-[#C9A227]/15 text-[#6B5515] hover:bg-[#C9A227]/25 cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Receipt Generator Form */}
            <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-[#111111] pb-3 border-b border-[#ECE8DF]">
                Issue New Official Payment Receipt
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelStyle}>Receipt Number</label>
                  <input
                    type="text"
                    value={receiptForm.receiptNumber}
                    onChange={(e) => setReceiptForm({ ...receiptForm, receiptNumber: e.target.value })}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Client Name</label>
                  <input
                    type="text"
                    value={receiptForm.clientName}
                    onChange={(e) => setReceiptForm({ ...receiptForm, clientName: e.target.value })}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Amount Paid (NGN)</label>
                  <input
                    type="number"
                    value={receiptForm.amountPaid}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setReceiptForm({ ...receiptForm, amountPaid: val, amountInWords: numberToWordsNaira(val) });
                    }}
                    className={inputStyle}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelStyle}>Amount in Words (Auto-computed)</label>
                  <input
                    type="text"
                    readOnly
                    value={receiptForm.amountInWords}
                    className="block w-full rounded-2xl border border-[#ECE8DF] bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#66615B] italic"
                  />
                </div>
                <div>
                  <label className={labelStyle}>Payment Method</label>
                  <select
                    value={receiptForm.paymentMethod}
                    onChange={(e) =>
                      setReceiptForm({ ...receiptForm, paymentMethod: e.target.value as ReceiptRecord['paymentMethod'] })
                    }
                    className={inputStyle}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Paystack">Paystack Gateway</option>
                    <option value="Flutterwave">Flutterwave</option>
                    <option value="POS">POS Terminal</option>
                    <option value="Cash">Cash Deposit</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Transaction / Ref Number</label>
                  <input
                    type="text"
                    value={receiptForm.referenceNumber}
                    onChange={(e) => setReceiptForm({ ...receiptForm, referenceNumber: e.target.value })}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Payment For</label>
                  <input
                    type="text"
                    value={receiptForm.paymentFor}
                    onChange={(e) => setReceiptForm({ ...receiptForm, paymentFor: e.target.value })}
                    placeholder="e.g. Settlement for Invoice BSP-2026-001"
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SHIPMENTS & MILESTONES DESK (Merged from Staff) */}
        {/* ========================================================= */}
        {activeTab === 'shipments' && (
          <div className="space-y-8">
            <AdminTabHint>
              Each milestone you save here updates the client’s live tracking card and the public /track page — keep statuses current so clients never have to ask.
            </AdminTabHint>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl font-extrabold text-[#111111]">
                  Shipments &amp; Live Milestones
                </h1>
                <p className="text-sm text-[#66615B]">
                  Update shipping stages, customs releases, and active locations. Instantly reflected in client portals.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateShipmentForm({
                    clientId: '',
                    clientName: clients[0]?.name || '',
                    clientEmail: clients[0]?.email || '',
                    clientPhone: clients[0]?.phone || '',
                    clientCode: clients[0]?.clientCode || '',
                    trackingNumber: 'BSP-NG-' + Math.floor(10000 + Math.random() * 90000),
                    origin: 'Guangzhou, China',
                    destination: 'Lagos, Nigeria',
                    mode: 'air',
                    status: 'Order approved',
                    weight: 25,
                    description: '',
                    estimatedArrival: 'In 5-7 business days',
                    currentLocation: 'Guangzhou Warehouse, Baiyun',
                    staffNotes: 'Cargo received and registered at procurement hub.',
                  });
                  setShowCreateShipmentModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4 text-[#C9A227]" />
                <span>Create &amp; Assign Shipment</span>
              </button>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C827A]" />
              <input
                type="text"
                value={shipmentSearch}
                onChange={(e) => setShipmentSearch(e.target.value)}
                placeholder="Find by tracking ID, client name or phone..."
                className="w-full rounded-2xl border border-[#DED9CF] bg-white pl-10 pr-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredShipments.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#DED9CF] bg-white p-10 text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] flex items-center justify-center text-[#C9A227]">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div className="font-bold text-sm text-[#111111]">
                    {shipments.length === 0 ? 'No consignment registered yet' : 'No consignment matches that search'}
                  </div>
                  <p className="text-xs text-[#8C827A]">
                    {shipments.length === 0
                      ? 'Create and assign a shipment to start tracking cargo milestones for a client.'
                      : 'Check the tracking ID or search with the client name instead.'}
                  </p>
                </div>
              )}
              {filteredShipments.map((ship) => (
                <div
                  key={ship.id}
                  className="rounded-3xl border border-[#ECE8DF] bg-white p-6 shadow-sm hover:border-[#C9A227]/40 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ECE8DF]">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-[#C9A227]">
                        {ship.mode === 'air' ? <Plane className="h-5 w-5" /> : <Ship className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#111111]">{ship.trackingNumber}</span>
                          <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                            {ship.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#8C827A]">
                          Client: <span className="font-semibold text-[#111111]">{ship.clientName}</span> ({ship.clientPhone})
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUpdatingShipment(ship);
                        setNewShipmentStatus(ship.status);
                        setNewShipmentNote(ship.staffNotes);
                        setNewShipmentLocation(ship.currentLocation || 'Guangzhou Warehouse, Baiyun');
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-4 py-2 text-xs font-bold text-white hover:opacity-90 cursor-pointer self-start sm:self-auto"
                    >
                      <Edit className="h-3.5 w-3.5 text-[#C9A227]" />
                      <span>Update Milestone &amp; Location</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#111111]">{ship.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-[#111111] bg-[#FAFAF8] px-3 py-1.5 rounded-xl border border-[#ECE8DF] w-fit">
                      <MapPin className="h-3.5 w-3.5 text-[#C9A227]" />
                      <span className="font-bold text-[10px] uppercase text-[#8C827A]">Active Location:</span>
                      <span className="font-bold">{ship.currentLocation || 'Guangzhou Warehouse, Baiyun'}</span>
                    </div>
                  </div>

                  {/* Clean Milestone Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#8C827A]">Origin: {ship.origin}</span>
                      <span className="text-[#C9A227]">{ship.progressPercent}% Completed</span>
                      <span className="text-[#8C827A]">Destination: {ship.destination}</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#ECE8DF] overflow-hidden">
                      <div
                        className="h-full bg-[#C9A227] transition-all duration-500 rounded-full"
                        style={{ width: `${ship.progressPercent}%` }}
                      />
                    </div>

                    {/* Stage Badges */}
                    <div className="flex items-center justify-between gap-1 overflow-x-auto pt-2">
                      {ship.stages.map((stage, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center px-1">
                          <div
                            className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold ${stage.done ? 'bg-[#C9A227] text-white' : 'bg-[#ECE8DF] text-[#8C827A]'
                              }`}
                          >
                            {stage.done ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1 font-semibold ${stage.done ? 'text-[#111111]' : 'text-[#8C827A]'
                              }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#8C827A] border-t border-[#ECE8DF]/60">
                    <span>
                      Staff Notes: <span className="text-[#111111] font-medium">{ship.staffNotes}</span>
                    </span>
                    <span>Updated: {ship.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CLIENTS DIRECTORY & CLIENT FOLDERS */}
        {/* ========================================================= */}
        {activeTab === 'clients' && (
          <div className="space-y-8">
            <AdminTabHint>
              Open a client folder to see everything filed under them — invoices, receipts, and contact details. New portal signups also raise alerts in the bell inbox.
            </AdminTabHint>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl font-extrabold text-[#111111]">
                  Registered Clients &amp; Client Folders
                </h1>
                <p className="text-sm text-[#66615B]">
                  Every client added here (by staff or self signup) can be opened to view their invoices, shipments and
                  contact details, edited, or removed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddClientModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4 text-[#C9A227]" />
                <span>Add New Client</span>
              </button>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C827A]" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Find a client by name, phone, email or client code..."
                className="w-full rounded-2xl border border-[#DED9CF] bg-white pl-10 pr-4 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div className="text-xs text-[#8C827A]">
              Showing <span className="font-bold text-[#111111]">{filteredClients.length}</span> of {clients.length} client
              {clients.length === 1 ? '' : 's'} on file
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clients.length > 0 && filteredClients.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-dashed border-[#DED9CF] bg-white p-8 text-center text-xs text-[#8C827A]">
                  No client matches that search. Try the client code or phone number, or clear the search box.
                </div>
              )}
              {clients.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-dashed border-[#DED9CF] bg-white p-10 text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] flex items-center justify-center text-[#C9A227]">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="font-bold text-sm text-[#111111]">No client on file yet</div>
                  <p className="text-xs text-[#8C827A] max-w-md mx-auto">
                    The desk is empty so every record shows real data only. Add your first client to start issuing invoices,
                    receipts and shipment tracking for them.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddClientModal(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 text-[#C9A227]" />
                    <span>Add New Client</span>
                  </button>
                </div>
              )}
              {filteredClients.map((c) => {
                const clientInvs = invoices.filter(
                  (i) =>
                    i.clientId === c.id ||
                    i.clientName.toLowerCase() === c.name.toLowerCase() ||
                    (!!i.clientEmail && i.clientEmail === c.email)
                );
                const clientShips = shipments.filter(
                  (s) => s.clientName.toLowerCase() === c.name.toLowerCase() || s.clientEmail === c.email
                );

                return (
                  <div
                    key={c.id}
                    className="rounded-3xl border border-[#ECE8DF] bg-white p-6 shadow-sm hover:border-[#C9A227] transition space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] flex items-center justify-center font-bold text-[#111111]">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#111111]">{c.name}</div>
                          <div className="text-[11px] text-[#8C827A]">{c.clientCode}</div>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${c.signupMethod === 'google' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {c.signupMethod === 'google' ? 'Google Auth' : c.signupMethod === 'manual' ? 'Added by Staff' : 'Email'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#66615B]">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-[#C9A227]" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[#C9A227]" />
                        <span>{c.email}</span>
                      </div>
                      {c.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[#C9A227]" />
                          <span className="truncate">{c.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-center text-xs">
                      <div>
                        <div className="font-extrabold text-[#111111]">{clientShips.length}</div>
                        <div className="text-[10px] text-[#8C827A]">Shipments</div>
                      </div>
                      <div>
                        <div className="font-extrabold text-[#111111]">{clientInvs.length}</div>
                        <div className="text-[10px] text-[#8C827A]">Invoices</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedClientFolder(c)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] py-2.5 px-4 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer"
                      >
                        <FolderOpen className="h-4 w-4 text-[#C9A227]" />
                        <span>Open Client Folder</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClient(c)}
                        title="Remove client"
                        className="px-3 rounded-2xl border border-[#DED9CF] text-[#B3261E] hover:border-[#B3261E] hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SHIPPING RATES & CALCULATOR SETTINGS (Live Sync) */}
        {/* ========================================================= */}
        {activeTab === 'rates' && (
          <div className="space-y-8 max-w-4xl">
            <AdminTabHint>
              Rates saved here feed every client’s estimator and the public cost calculator. Update them whenever freight costs move, then verify with the calculator below.
            </AdminTabHint>
            <div>
              <div className="flex items-center gap-2">
                <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl font-extrabold text-[#111111]">
                  Shipping Rates &amp; Calculator Desk
                </h1>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase">
                  Live Sync Active
                </span>
              </div>
              <p className="text-sm text-[#66615B] mt-1">
                Configure official cargo tariffs and clearing benchmarks. Any changes saved here immediately reflect across every client portal calculator in real-time.
              </p>
            </div>

            <form onSubmit={handleSaveRates} className="space-y-6">
              {/* Air Cargo Tariffs */}
              <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#ECE8DF]">
                  <div className="p-2.5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-[#C9A227]">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#111111]">Air Freight Cargo Tariffs</h2>
                    <p className="text-xs text-[#8C827A]">Priority air shipping rates (China / Vietnam to Lagos Airport)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Air Freight Rate per KG (₦)</label>
                    <input
                      type="number"
                      required
                      value={shippingRates.airFreightRatePerKg}
                      onChange={(e) =>
                        setShippingRates({ ...shippingRates, airFreightRatePerKg: parseFloat(e.target.value) || 0 })
                      }
                      className={inputStyle}
                    />
                    <span className="text-[11px] text-[#8C827A] mt-1 block">
                      Currently: {formatNaira(shippingRates.airFreightRatePerKg)} per KG
                    </span>
                  </div>

                  <div>
                    <label className={labelStyle}>Customs Airport Clearing Fee per KG (₦)</label>
                    <input
                      type="number"
                      required
                      value={shippingRates.clearanceFeePerKg}
                      onChange={(e) =>
                        setShippingRates({ ...shippingRates, clearanceFeePerKg: parseFloat(e.target.value) || 0 })
                      }
                      className={inputStyle}
                    />
                    <span className="text-[11px] text-[#8C827A] mt-1 block">
                      Currently: {formatNaira(shippingRates.clearanceFeePerKg)} per KG
                    </span>
                  </div>
                </div>
              </div>

              {/* Sea Cargo Tariffs */}
              <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#ECE8DF]">
                  <div className="p-2.5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-[#C9A227]">
                    <Ship className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#111111]">Sea Freight Container Tariffs</h2>
                    <p className="text-xs text-[#8C827A]">Consolidated container cargo rates (Guangzhou / Yiwu to Lagos Port)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Sea Freight Rate per KG (₦)</label>
                    <input
                      type="number"
                      required
                      value={shippingRates.seaFreightRatePerKg}
                      onChange={(e) =>
                        setShippingRates({ ...shippingRates, seaFreightRatePerKg: parseFloat(e.target.value) || 0 })
                      }
                      className={inputStyle}
                    />
                    <span className="text-[11px] text-[#8C827A] mt-1 block">
                      Currently: {formatNaira(shippingRates.seaFreightRatePerKg)} per KG
                    </span>
                  </div>

                  <div>
                    <label className={labelStyle}>Sea Freight Rate per CBM (₦)</label>
                    <input
                      type="number"
                      required
                      value={shippingRates.seaFreightRatePerCbm}
                      onChange={(e) =>
                        setShippingRates({ ...shippingRates, seaFreightRatePerCbm: parseFloat(e.target.value) || 0 })
                      }
                      className={inputStyle}
                    />
                    <span className="text-[11px] text-[#8C827A] mt-1 block">
                      Currently: {formatNaira(shippingRates.seaFreightRatePerCbm)} per Cubic Metre
                    </span>
                  </div>
                </div>
              </div>

              {/* Exchange Benchmark & Handling Fees */}
              <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#ECE8DF]">
                  <div className="p-2.5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-[#C9A227]">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#111111]">Currency Benchmark &amp; Documentation</h2>
                    <p className="text-xs text-[#8C827A]">Baseline conversion and terminal verification charges</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>USD to NGN Benchmark Exchange Rate (₦/$)</label>
                    <input
                      type="number"
                      required
                      value={shippingRates.usdToNgnRate}
                      onChange={(e) =>
                        setShippingRates({ ...shippingRates, usdToNgnRate: parseFloat(e.target.value) || 0 })
                      }
                      className={inputStyle}
                    />
                    <span className="text-[11px] text-[#8C827A] mt-1 block">
                      Benchmark: $1.00 = ₦{shippingRates.usdToNgnRate.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className={labelStyle}>Standard Crating &amp; Documentation Handling Fee (₦)</label>
                    <input
                      type="number"
                      required
                      value={shippingRates.handlingFee}
                      onChange={(e) =>
                        setShippingRates({ ...shippingRates, handlingFee: parseFloat(e.target.value) || 0 })
                      }
                      className={inputStyle}
                    />
                    <span className="text-[11px] text-[#8C827A] mt-1 block">
                      Currently: {formatNaira(shippingRates.handlingFee)} per shipment
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF]">
                <div className="text-xs text-[#66615B]">
                  Last Updated: <span className="font-bold text-[#111111]">{shippingRates.lastUpdated}</span> by{' '}
                  <span className="font-bold text-[#111111]">{shippingRates.updatedBy}</span>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] py-3.5 px-8 text-xs font-bold text-white shadow-md hover:opacity-90 cursor-pointer"
                >
                  <Save className="h-4 w-4 text-[#C9A227]" />
                  <span>Save &amp; Sync Live Rates across All Portals</span>
                </button>
              </div>
            </form>

            {/* Tawk.to Live Desk Integration Setup */}
            <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#ECE8DF]">
                <div className="p-2.5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-[#C9A227]">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#111111]">Tawk.to Live Support Desk Integration</h2>
                  <p className="text-xs text-[#8C827A]">Connect your Tawk.to mobile &amp; web app so clients chat directly with management</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Tawk.to Property ID</label>
                  <input
                    type="text"
                    value={tawkConfig.propertyId}
                    onChange={(e) => setTawkConfig({ ...tawkConfig, propertyId: e.target.value })}
                    placeholder="e.g. 65f1234567890abcdef12345"
                    className={inputStyle}
                  />
                  <span className="text-[11px] text-[#8C827A] mt-1 block">
                    Found in your Tawk.to Dashboard &rarr; Administration &rarr; Property Settings
                  </span>
                </div>

                <div>
                  <label className={labelStyle}>Tawk.to Direct Chat Link (Optional)</label>
                  <input
                    type="text"
                    value={tawkConfig.directChatUrl || ''}
                    onChange={(e) => setTawkConfig({ ...tawkConfig, directChatUrl: e.target.value })}
                    placeholder="https://tawk.to/chat/your-property-id/default"
                    className={inputStyle}
                  />
                  <span className="text-[11px] text-[#8C827A] mt-1 block">
                    Direct chat link from your Tawk app channel settings
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    saveTawkConfig(tawkConfig);
                    showNotify('Tawk.to Live Desk settings saved and connected to Client Portal!');
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] py-3 px-6 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                >
                  <Save className="h-4 w-4 text-[#C9A227]" />
                  <span>Save Live Desk Connection</span>
                </button>
              </div>
            </div>

            {/* Paystack Payment Gateway Setup */}
            <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#ECE8DF]">
                <div className="p-2.5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-[#C9A227]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#111111]">Paystack Payment Gateway Configuration</h2>
                  <p className="text-xs text-[#8C827A]">Set your public API key for 1-click checkout on invoices and client portals</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Paystack Public Key</label>
                  <input
                    type="text"
                    value={paystackConfig.publicKey}
                    onChange={(e) => setPaystackConfig({ ...paystackConfig, publicKey: e.target.value })}
                    placeholder="pk_live_... or pk_test_..."
                    className={inputStyle}
                  />
                  <span className="text-[11px] text-[#8C827A] mt-1 block">
                    Your Paystack Public Key (Card, USSD, Direct Bank Transfer)
                  </span>
                </div>

                <div>
                  <label className={labelStyle}>Merchant Business Name</label>
                  <input
                    type="text"
                    value={paystackConfig.merchantName}
                    onChange={(e) => setPaystackConfig({ ...paystackConfig, merchantName: e.target.value })}
                    placeholder="BuySmart Procurement Limited"
                    className={inputStyle}
                  />
                  <span className="text-[11px] text-[#8C827A] mt-1 block">
                    Displays on client checkout modals
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    savePaystackConfig(paystackConfig);
                    showNotify('Paystack Gateway settings saved successfully!');
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] py-3 px-6 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                >
                  <Save className="h-4 w-4 text-[#C9A227]" />
                  <span>Save Paystack Configuration</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: FINANCIAL SUMMARY & REPORTS */}
        {/* ========================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            <AdminTabHint>
              These totals are computed from the invoices and receipts you have created — billed vs settled vs outstanding, per client and overall.
            </AdminTabHint>
            <div>
              <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl font-extrabold text-[#111111]">
                Stock, Clients &amp; Financial Summary
              </h1>
              <p className="text-sm text-[#66615B]">
                Live counts of registered clients, cargo on hand, deliveries completed and the money movement across the
                business.
              </p>
            </div>

            {(() => {
              const activeShipments = shipments.filter((s) => s.status !== 'Delivered');
              const deliveredShipments = shipments.filter((s) => s.status === 'Delivered');
              const totalWeight = shipments.reduce((acc, s) => acc + (Number(s.weight) || 0), 0);
              const totalInvoiced = invoices.reduce((acc, i) => acc + (Number(i.total) || 0), 0);
              const totalCollected = receipts.reduce((acc, r) => acc + (Number(r.amountPaid) || 0), 0);
              const outstanding = invoices
                .filter((i) => i.status === 'Unpaid' || i.status === 'Partial' || i.status === 'Overdue')
                .reduce((acc, i) => acc + (Number(i.total) - Number(i.amountPaid || 0)), 0);
              const paidInvoices = invoices.filter((i) => i.status === 'Paid').length;
              const clientsWithInvoices = clients.filter((c) =>
                invoices.some(
                  (i) =>
                    i.clientId === c.id ||
                    i.clientName.toLowerCase() === c.name.toLowerCase() ||
                    (!!i.clientEmail && i.clientEmail === c.email)
                )
              ).length;

              const stockCards = [
                { label: 'Registered Clients', value: clients.length.toString(), note: `${clientsWithInvoices} with active invoices`, tone: 'text-[#111111]' },
                { label: 'Cargo In Stock / In Transit', value: activeShipments.length.toString(), note: `${shipments.length} total consignments`, tone: 'text-[#6B5515]' },
                { label: 'Delivered To Clients', value: deliveredShipments.length.toString(), note: 'Completed and signed off', tone: 'text-green-700' },
                { label: 'Total Cargo Weight', value: `${totalWeight.toLocaleString('en-NG')} kg`, note: 'Across all consignments', tone: 'text-[#111111]' },
              ];

              const financeCards = [
                { label: 'Total Invoiced Volume', value: totalInvoiced, note: `${invoices.length} invoices issued`, tone: 'text-[#111111]' },
                { label: 'Total Confirmed Collections', value: totalCollected, note: `${receipts.length} verified receipts`, tone: 'text-green-700' },
                { label: 'Outstanding Receivables', value: outstanding, note: `${paidInvoices} invoices fully settled`, tone: 'text-amber-700' },
              ];

              return (
                <>
                  <div>
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#8C827A] mb-3">
                      Clients &amp; Stock Count
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {stockCards.map((card) => (
                        <div key={card.label} className="rounded-3xl border border-[#ECE8DF] bg-white p-6 shadow-sm">
                          <span className="text-xs font-bold uppercase text-[#8C827A]">{card.label}</span>
                          <div className={`mt-2 text-2xl font-extrabold ${card.tone}`}>{card.value}</div>
                          <span className="text-[11px] text-[#8C827A]">{card.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#8C827A] mb-3">
                      Financial Summary
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {financeCards.map((card) => (
                        <div key={card.label} className="rounded-3xl border border-[#ECE8DF] bg-white p-6 shadow-sm">
                          <span className="text-xs font-bold uppercase text-[#8C827A]">{card.label}</span>
                          <div className={`mt-2 text-2xl font-extrabold ${card.tone}`}>{formatNaira(card.value)}</div>
                          <span className="text-[11px] text-[#8C827A]">{card.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#111111]">
                        Stock Ledger By Consignment
                      </span>
                      <span className="text-[11px] text-[#8C827A]">{shipments.length} consignments</span>
                    </div>
                    {shipments.length === 0 ? (
                      <p className="py-6 text-center text-xs text-[#8C827A]">
                        No cargo registered yet. Add a shipment to start tracking stock.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#ECE8DF]">
                        {shipments.map((s) => (
                          <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <div className="font-bold text-[#111111]">{s.clientName}</div>
                              <div className="text-[11px] text-[#8C827A]">
                                {s.trackingNumber} • {s.description || 'Cargo'} • {s.mode === 'air' ? 'Air Freight' : 'Sea Freight'}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-semibold text-[#66615B]">{Number(s.weight) || 0} kg</span>
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${s.status === 'Delivered'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-amber-100 text-amber-800'
                                  }`}
                              >
                                {s.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: SEND INVOICE TO CLIENT (MATCHING USER REFERENCE IMAGE) */}
      {/* ========================================================= */}
      {sendInvoiceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#0F382A] text-white p-6 sm:p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/20">
              <div className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-[#C9A227]" />
                <span className="font-bold text-sm">Send Invoice to Client</span>
              </div>
              <button
                type="button"
                onClick={() => setSendInvoiceTarget(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notification Card Matching the Uploaded User Image */}
            <div className="my-6 rounded-2xl bg-white text-[#111111] p-6 shadow-lg border border-white/40 relative overflow-hidden">
              <div className="flex justify-end">
                <span className="rounded-md bg-[#E8804C] px-3 py-1 text-[11px] font-extrabold text-white uppercase tracking-wider">
                  UNPAID
                </span>
              </div>

              <div className="text-center py-4 space-y-2">
                <p className="text-sm font-semibold text-[#4A4A4A]">Hi, {sendInvoiceTarget.clientName}</p>
                <p className="text-xs text-[#66615B]">You have an outstanding amount of</p>
                <div
                  style={{ fontFamily: "'Sora', sans-serif" }}
                  className="text-2xl sm:text-3xl font-extrabold text-[#111111]"
                >
                  {formatNaira(sendInvoiceTarget.total)}
                </div>
                <p className="text-xs text-[#66615B]">
                  for an invoice from <span className="font-semibold">Buysmart Procurement Limited</span>
                </p>
              </div>

              <div className="pt-3 border-t border-[#ECE8DF] flex items-center justify-center gap-2 text-[11px] text-[#8C827A]">
                <span>Powered by</span>
                <span className="font-extrabold text-[#111111]">BuySmart Invoice</span>
              </div>
            </div>

            {/* Generated WhatsApp / Link Preview (as in user screenshot) */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/90 space-y-2">
              <p className="font-semibold text-[#C9A227]">WhatsApp / Message Preview:</p>
              <p className="whitespace-pre-line leading-relaxed font-mono text-[11px]">
                {getWhatsAppMessage(sendInvoiceTarget)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOpenWhatsAppShare(sendInvoiceTarget)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 px-4 text-xs font-bold text-white shadow-md hover:opacity-95 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Send via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyShareLink(sendInvoiceTarget)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 border border-white/30 py-3.5 px-4 text-xs font-bold text-white hover:bg-white/25 cursor-pointer"
              >
                <Copy className="h-4 w-4 text-[#C9A227]" />
                <span>Copy Shareable Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD CLIENT MANUALLY */}
      {/* ========================================================= */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#ECE8DF] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE8DF]">
              <div>
                <h3 className="text-base font-extrabold text-[#111111]">Add New Client</h3>
                <p className="text-xs text-[#8C827A]">
                  Create a client record, then issue invoices or shipments against it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                className="p-1 rounded-lg text-[#8C827A] hover:text-[#111111]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Client / Contact Name *</label>
                <input
                  type="text"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  placeholder="e.g. Mr. John Okoro"
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Business Name</label>
                <input
                  type="text"
                  value={newClientForm.businessName}
                  onChange={(e) => setNewClientForm({ ...newClientForm, businessName: e.target.value })}
                  placeholder="e.g. Skyline Retail Ltd"
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Phone Number *</label>
                <input
                  type="text"
                  value={newClientForm.phone}
                  onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                  placeholder="0803 000 0000"
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>WhatsApp Number</label>
                <input
                  type="text"
                  value={newClientForm.whatsapp}
                  onChange={(e) => setNewClientForm({ ...newClientForm, whatsapp: e.target.value })}
                  placeholder="+234 803 000 0000"
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={newClientForm.email}
                  onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                  placeholder="client@email.com"
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Category Interest</label>
                <input
                  type="text"
                  value={newClientForm.categoryInterest}
                  onChange={(e) => setNewClientForm({ ...newClientForm, categoryInterest: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelStyle}>Delivery Address</label>
                <input
                  type="text"
                  value={newClientForm.address}
                  onChange={(e) => setNewClientForm({ ...newClientForm, address: e.target.value })}
                  placeholder="Plot, street, area"
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>City</label>
                <input
                  type="text"
                  value={newClientForm.city}
                  onChange={(e) => setNewClientForm({ ...newClientForm, city: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>State</label>
                <input
                  type="text"
                  value={newClientForm.state}
                  onChange={(e) => setNewClientForm({ ...newClientForm, state: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelStyle}>Internal Notes</label>
                <textarea
                  value={newClientForm.notes}
                  onChange={(e) => setNewClientForm({ ...newClientForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Sourcing preferences, credit terms, contact history..."
                  className={inputStyle}
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#DED9CF] text-xs font-semibold text-[#4A4A4A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#C9A227] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CLIENT FOLDER (DETAIL DRAWER) */}
      {/* ========================================================= */}
      {selectedClientFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#ECE8DF] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE8DF]">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-[#6B5515] font-extrabold text-lg">
                  {selectedClientFolder.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#111111]">{selectedClientFolder.name}</h3>
                  <div className="text-xs text-[#8C827A]">
                    Client Code: <span className="font-semibold text-[#111111]">{selectedClientFolder.clientCode}</span> •{' '}
                    {selectedClientFolder.signupMethod === 'google'
                      ? 'Google Registered'
                      : selectedClientFolder.signupMethod === 'manual'
                        ? 'Added by Management Desk'
                        : 'Email Registered'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingClient(!isEditingClient);
                    setClientEditForm({
                      name: selectedClientFolder.name,
                      businessName: selectedClientFolder.businessName || '',
                      phone: selectedClientFolder.phone,
                      whatsapp: selectedClientFolder.whatsapp || selectedClientFolder.phone,
                      alternatePhone: selectedClientFolder.alternatePhone || '',
                      email: selectedClientFolder.email,
                      alternateEmail: selectedClientFolder.alternateEmail || '',
                      address: selectedClientFolder.address || '',
                      state: selectedClientFolder.state || 'Lagos State',
                      city: selectedClientFolder.city || '',
                      categoryInterest: selectedClientFolder.categoryInterest || 'Commercial & General Goods',
                      notes: selectedClientFolder.notes || '',
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#DED9CF] bg-[#FAFAF8] text-xs font-bold text-[#111111] hover:border-[#C9A227] transition cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 inline mr-1 text-[#C9A227]" />
                  <span>{isEditingClient ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClient(selectedClientFolder)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DED9CF] bg-white text-xs font-bold text-[#B3261E] hover:border-[#B3261E] hover:bg-red-50 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClientFolder(null);
                    setIsEditingClient(false);
                  }}
                  className="p-1 rounded-lg text-[#8C827A] hover:text-[#111111]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Client Info Grid / Editing Form */}
            {isEditingClient ? (
              <form onSubmit={handleSaveClientEdit} className="my-5 space-y-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 font-semibold">
                  Founder Editing Mode: Updates made here immediately sync to this client&apos;s portal and session.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelStyle}>Client Name</label>
                    <input
                      type="text"
                      required
                      value={clientEditForm.name || ''}
                      onChange={(e) => setClientEditForm({ ...clientEditForm, name: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Business / Company Name</label>
                    <input
                      type="text"
                      value={clientEditForm.businessName || ''}
                      onChange={(e) => setClientEditForm({ ...clientEditForm, businessName: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>WhatsApp Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={clientEditForm.phone || ''}
                      onChange={(e) =>
                        setClientEditForm({ ...clientEditForm, phone: e.target.value, whatsapp: e.target.value })
                      }
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Alternate Contact Phone</label>
                    <input
                      type="tel"
                      value={clientEditForm.alternatePhone || ''}
                      onChange={(e) => setClientEditForm({ ...clientEditForm, alternatePhone: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelStyle}>Delivery Address</label>
                    <input
                      type="text"
                      value={clientEditForm.address || ''}
                      onChange={(e) => setClientEditForm({ ...clientEditForm, address: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>State</label>
                    <input
                      type="text"
                      value={clientEditForm.state || ''}
                      onChange={(e) => setClientEditForm({ ...clientEditForm, state: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>City</label>
                    <input
                      type="text"
                      value={clientEditForm.city || ''}
                      onChange={(e) => setClientEditForm({ ...clientEditForm, city: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingClient(false)}
                    className="px-4 py-2 rounded-xl border border-[#DED9CF] text-xs font-semibold text-[#4A4A4A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#111111] text-xs font-bold text-white hover:opacity-90"
                  >
                    Save Changes to Client Portal
                  </button>
                </div>
              </form>
            ) : (
              <div className="my-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[#FAFAF8] p-4 rounded-2xl border border-[#ECE8DF]">
                <div>
                  <span className="text-[#8C827A] text-[10px] font-bold uppercase">Phone Number</span>
                  <p className="font-semibold text-[#111111]">{selectedClientFolder.phone}</p>
                </div>
                <div>
                  <span className="text-[#8C827A] text-[10px] font-bold uppercase">Business Name</span>
                  <p className="font-semibold text-[#111111]">{selectedClientFolder.businessName || 'Individual'}</p>
                </div>
                <div>
                  <span className="text-[#8C827A] text-[10px] font-bold uppercase">Email Address</span>
                  <p className="font-semibold text-[#111111]">{selectedClientFolder.email}</p>
                </div>
                <div>
                  <span className="text-[#8C827A] text-[10px] font-bold uppercase">Member Since</span>
                  <p className="font-semibold text-[#111111]">{selectedClientFolder.createdAt}</p>
                </div>
                <div>
                  <span className="text-[#8C827A] text-[10px] font-bold uppercase">Category Interest</span>
                  <p className="font-semibold text-[#111111]">
                    {selectedClientFolder.categoryInterest || 'General Cargo'}
                  </p>
                </div>
                {selectedClientFolder.address && (
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[#8C827A] text-[10px] font-bold uppercase">Delivery Address</span>
                    <p className="font-semibold text-[#111111]">
                      {selectedClientFolder.address}
                      {selectedClientFolder.city ? `, ${selectedClientFolder.city}` : ''}
                      {selectedClientFolder.state ? `, ${selectedClientFolder.state}` : ''}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Invoices issued to this client */}
            {(() => {
              const folderInvoices = invoices.filter(
                (i) =>
                  i.clientId === selectedClientFolder.id ||
                  i.clientName.toLowerCase() === selectedClientFolder.name.toLowerCase() ||
                  (!!i.clientEmail && i.clientEmail.toLowerCase() === (selectedClientFolder.email || '').toLowerCase())
              );
              const folderOutstanding = folderInvoices.reduce(
                (acc, i) => acc + Math.max(0, (Number(i.total) || 0) - (Number(i.amountPaid) || 0)),
                0
              );

              return (
                <div className="my-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                      Invoices ({folderInvoices.length})
                    </span>
                    <span className="text-[11px] font-bold text-[#6B5515]">
                      Outstanding: {formatNaira(folderOutstanding)}
                    </span>
                  </div>

                  {folderInvoices.length === 0 ? (
                    <p className="text-[11px] text-[#8C827A] p-3 rounded-2xl border border-dashed border-[#DED9CF] bg-[#FAFAF8]">
                      No invoice issued to this client yet. Use “Generate Invoice for this Client” below.
                    </p>
                  ) : (
                    folderInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-2xl border border-[#ECE8DF] bg-[#FAFAF8] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#111111]">{inv.invoiceNumber}</div>
                          <div className="text-[11px] text-[#8C827A]">
                            {inv.createdAt} • {inv.status} • {formatNaira(inv.total)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientFolder(null);
                              handleEditInvoice(inv);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-[#DED9CF] bg-white text-[10px] font-bold text-[#111111] hover:border-[#C9A227] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientFolder(null);
                              setSendInvoiceTarget(inv);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#111111] text-[10px] font-bold text-white hover:opacity-90 cursor-pointer"
                          >
                            Send Link
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}

            {/* Client Assigned Shipments */}
            <div className="my-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Assigned Shipments (
                  {
                    shipments.filter(
                      (s) => s.clientName.toLowerCase() === selectedClientFolder.name.toLowerCase()
                    ).length
                  }
                  )
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCreateShipmentForm({
                      clientId: selectedClientFolder.id,
                      clientName: selectedClientFolder.name,
                      clientEmail: selectedClientFolder.email,
                      clientPhone: selectedClientFolder.phone,
                      clientCode: selectedClientFolder.clientCode,
                      trackingNumber: 'BSP-NG-' + Math.floor(10000 + Math.random() * 90000),
                      origin: 'Guangzhou, China',
                      destination: 'Lagos, Nigeria',
                      mode: 'air',
                      status: 'Order approved',
                      weight: 25,
                      description: '',
                      estimatedArrival: 'In 5-7 business days',
                      currentLocation: 'Guangzhou Warehouse, Baiyun',
                      staffNotes: 'Cargo received and registered at procurement hub.',
                    });
                    setSelectedClientFolder(null);
                    setShowCreateShipmentModal(true);
                  }}
                  className="text-[11px] font-bold text-[#C9A227] hover:underline cursor-pointer"
                >
                  + Add Shipment for this Client
                </button>
              </div>

              {shipments
                .filter((s) => s.clientName.toLowerCase() === selectedClientFolder.name.toLowerCase())
                .map((ship) => (
                  <div key={ship.id} className="p-3.5 rounded-2xl border border-[#ECE8DF] bg-[#FAFAF8] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111111]">{ship.trackingNumber}</span>
                      <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 font-bold text-[10px]">
                        {ship.status}
                      </span>
                    </div>
                    <p className="text-[#66615B]">{ship.description}</p>
                    <div className="text-[11px] text-[#8C827A] flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#C9A227]" />
                      <span>{ship.currentLocation || 'Guangzhou Warehouse'}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Quick Actions for this Client */}
            <div className="pt-4 border-t border-[#ECE8DF] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCreateInvoiceForClient(selectedClientFolder)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#C9A227] py-3 px-4 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Generate Invoice for this Client</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = `https://wa.me/${selectedClientFolder.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedClientFolder.name}, this is BuySmart Procurement Limited reaching out regarding your account.`
                  )}`;
                  window.open(url, '_blank');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 px-4 text-xs font-bold text-white hover:opacity-95 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Open WhatsApp Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: UPDATE SHIPMENT MILESTONE & ACTIVE LOCATION */}
      {/* ========================================================= */}
      {updatingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#ECE8DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <div>
                <span className="font-bold text-sm text-[#111111] block">Update Milestone &amp; Active Location</span>
                <span className="text-[11px] text-[#8C827A]">
                  {updatingShipment.trackingNumber} • Client: <span className="font-semibold text-[#111111]">{updatingShipment.clientName}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUpdatingShipment(null)}
                className="text-[#8C827A] hover:text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Active Shipment Location</label>
                <input
                  type="text"
                  value={newShipmentLocation}
                  onChange={(e) => setNewShipmentLocation(e.target.value)}
                  placeholder="e.g. Murtala Muhammed Cargo Airport, Lagos / Guangzhou Warehouse"
                  className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#C9A227]"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    'Guangzhou Warehouse, Baiyun',
                    'In Flight to Lagos Cargo Terminal',
                    'Murtala Muhammed Cargo Airport, Lagos',
                    'Apapa Port Container Terminal',
                    'Ikeja Hub Clearance Office',
                    'Out for Delivery to Client Address',
                    'Delivered to Client',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewShipmentLocation(preset)}
                      className="text-[9px] px-2 py-0.5 rounded-full bg-[#FAFAF8] border border-[#ECE8DF] text-[#66615B] hover:text-[#111111] hover:border-[#C9A227] cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">New Milestone Stage</label>
                <select
                  value={newShipmentStatus}
                  onChange={(e) => setNewShipmentStatus(e.target.value as ShipmentItem['status'])}
                  className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs font-bold text-[#111111]"
                >
                  <option value="Order approved">Order approved</option>
                  <option value="Sourced in China">Sourced in China / Vietnam</option>
                  <option value="Arrived at warehouse">Arrived at warehouse</option>
                  <option value="Cargo flight booked">Cargo flight booked</option>
                  <option value="Customs clearing Lagos">Customs clearing Lagos</option>
                  <option value="Ready for pickup">Ready for pickup</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Staff Notes for Client</label>
                <textarea
                  rows={3}
                  value={newShipmentNote}
                  onChange={(e) => setNewShipmentNote(e.target.value)}
                  placeholder="e.g. Cargo landed at Lagos Airport. Clearing agent processing final customs release."
                  className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE8DF]">
              <button
                type="button"
                onClick={() => setUpdatingShipment(null)}
                className="rounded-xl border border-[#DED9CF] px-4 py-2 text-xs font-semibold text-[#4A4A4A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyShipmentUpdate}
                className="rounded-xl bg-[#111111] px-5 py-2 text-xs font-bold text-white hover:opacity-90"
              >
                Save Milestone &amp; Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE & ASSIGN NEW SHIPMENT */}
      {/* ========================================================= */}
      {showCreateShipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#ECE8DF] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <div>
                <span className="font-bold text-sm text-[#111111] block">Create &amp; Assign New Shipment</span>
                <span className="text-[11px] text-[#8C827A]">
                  New cargo registered here is immediately visible in the assigned client&apos;s portal.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateShipmentModal(false)}
                className="text-[#8C827A] hover:text-[#111111]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShipmentSubmit} className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">
                  Assign to Registered Client *
                </label>
                <select
                  value={createShipmentForm.clientId || ''}
                  onChange={(e) => {
                    const sel = clients.find((c) => c.id === e.target.value);
                    if (sel) {
                      setCreateShipmentForm({
                        ...createShipmentForm,
                        clientId: sel.id,
                        clientName: sel.name,
                        clientEmail: sel.email,
                        clientPhone: sel.phone,
                        clientCode: sel.clientCode,
                      });
                    }
                  }}
                  className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs font-bold text-[#111111]"
                >
                  <option value="">-- Choose a registered client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.businessName ? `(${c.businessName})` : ''} • {c.clientCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={createShipmentForm.clientName}
                    onChange={(e) => setCreateShipmentForm({ ...createShipmentForm, clientName: e.target.value })}
                    className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Tracking Number</label>
                  <input
                    type="text"
                    required
                    value={createShipmentForm.trackingNumber}
                    onChange={(e) => setCreateShipmentForm({ ...createShipmentForm, trackingNumber: e.target.value })}
                    className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs font-mono font-bold text-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Cargo Description *</label>
                <input
                  type="text"
                  required
                  value={createShipmentForm.description}
                  onChange={(e) => setCreateShipmentForm({ ...createShipmentForm, description: e.target.value })}
                  placeholder="e.g. Commercial Blenders & High-Speed Juicers (50 Cartons)"
                  className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Freight Mode</label>
                  <select
                    value={createShipmentForm.mode}
                    onChange={(e) =>
                      setCreateShipmentForm({ ...createShipmentForm, mode: e.target.value as 'air' | 'sea' })
                    }
                    className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs font-bold text-[#111111]"
                  >
                    <option value="air">Air Freight</option>
                    <option value="sea">Sea Freight</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Weight (KG)</label>
                  <input
                    type="number"
                    required
                    value={createShipmentForm.weight}
                    onChange={(e) =>
                      setCreateShipmentForm({ ...createShipmentForm, weight: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Initial Status</label>
                  <select
                    value={createShipmentForm.status}
                    onChange={(e) =>
                      setCreateShipmentForm({
                        ...createShipmentForm,
                        status: e.target.value as ShipmentItem['status'],
                      })
                    }
                    className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs font-bold text-[#111111]"
                  >
                    <option value="Order approved">Order approved</option>
                    <option value="Sourced in China">Sourced in China</option>
                    <option value="Arrived at warehouse">Arrived at warehouse</option>
                    <option value="Cargo flight booked">Cargo flight booked</option>
                    <option value="Customs clearing Lagos">Customs clearing Lagos</option>
                    <option value="Ready for pickup">Ready for pickup</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Origin</label>
                  <input
                    type="text"
                    value={createShipmentForm.origin}
                    onChange={(e) => setCreateShipmentForm({ ...createShipmentForm, origin: e.target.value })}
                    className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">Destination</label>
                  <input
                    type="text"
                    value={createShipmentForm.destination}
                    onChange={(e) => setCreateShipmentForm({ ...createShipmentForm, destination: e.target.value })}
                    className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">
                  Current Active Location
                </label>
                <input
                  type="text"
                  value={createShipmentForm.currentLocation}
                  onChange={(e) => setCreateShipmentForm({ ...createShipmentForm, currentLocation: e.target.value })}
                  placeholder="e.g. Guangzhou Warehouse, Baiyun"
                  className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">
                  Estimated Delivery Timeline
                </label>
                <input
                  type="text"
                  value={createShipmentForm.estimatedArrival}
                  onChange={(e) => setCreateShipmentForm({ ...createShipmentForm, estimatedArrival: e.target.value })}
                  placeholder="e.g. In 5-7 business days / Nov 28, 2026"
                  className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C827A] uppercase mb-1 block">
                  Staff / Operational Notes
                </label>
                <textarea
                  rows={2}
                  value={createShipmentForm.staffNotes}
                  onChange={(e) => setCreateShipmentForm({ ...createShipmentForm, staffNotes: e.target.value })}
                  className="w-full rounded-xl border border-[#DED9CF] p-2.5 text-xs text-[#111111]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE8DF]">
                <button
                  type="button"
                  onClick={() => setShowCreateShipmentModal(false)}
                  className="rounded-xl border border-[#DED9CF] px-4 py-2 text-xs font-semibold text-[#4A4A4A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#111111] px-5 py-2 text-xs font-bold text-white hover:opacity-90"
                >
                  Register &amp; Assign Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INVOICE PREVIEW WITH WATERMARK & LOGO */}
      {/* ========================================================= */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-10 shadow-2xl border border-[#ECE8DF] my-8 relative overflow-hidden">
            {/* Subtle Balanced Watermark */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden opacity-[0.035]">
              <div className="text-center rotate-[-25deg] transform">
                <div className="text-6xl font-black uppercase tracking-wider text-[#111111]">
                  BUYSMART
                </div>
                <div className="text-2xl font-extrabold tracking-widest text-[#C9A227] mt-1">
                  OFFICIAL COMMERCIAL INVOICE
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pb-6 border-b border-[#ECE8DF] relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-[#111111] p-1.5 border border-[#C9A227]/40 flex items-center justify-center shadow-md shrink-0">
                  <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="font-extrabold text-base text-[#111111]">BUYSMART PROCUREMENT LIMITED</div>
                  <div className="text-[11px] text-[#C9A227] font-bold">CAC RC REGISTERED • OFFICIAL INVOICE</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadInvoicePDF(previewInvoice)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#111111] px-4 py-2 text-xs font-bold text-white hover:opacity-90 shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5 text-[#C9A227]" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  className="p-2 rounded-xl text-[#8C827A] hover:text-[#111111] hover:bg-[#FAFAF8]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="py-6 space-y-6 relative z-10 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-[#8C827A] uppercase text-[10px]">Invoice To:</span>
                  <div className="font-extrabold text-sm text-[#111111]">{previewInvoice.clientName}</div>
                  <div className="text-[#66615B]">{previewInvoice.clientPhone}</div>
                  <div className="text-[#66615B]">{previewInvoice.clientEmail}</div>
                  {previewInvoice.clientAddress && <div className="text-[#66615B]">{previewInvoice.clientAddress}</div>}
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm text-[#111111]">#{previewInvoice.invoiceNumber}</div>
                  <div className="text-[#66615B]">Date: {previewInvoice.createdAt}</div>
                  <div className="text-[#66615B]">Due: {previewInvoice.dueDate}</div>
                  <span className="inline-block mt-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 font-bold text-[10px] uppercase">
                    {previewInvoice.status}
                  </span>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#ECE8DF] text-[#8C827A] font-bold uppercase text-[10px]">
                    <th className="py-2">Description</th>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE8DF]">
                  {previewInvoice.lines.map((l, i) => (
                    <tr key={i}>
                      <td className="py-2.5 font-medium text-[#111111]">{l.description}</td>
                      <td className="py-2.5 text-[#8C827A]">{LINE_LABELS[l.type] || l.type}</td>
                      <td className="py-2.5 text-right font-bold text-[#111111]">{formatNaira(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-4 border-t border-[#ECE8DF]">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#161616] via-[#222222] to-[#161616] text-white border border-[#C9A227]/40 shadow-sm text-right min-w-[260px]">
                  <span className="text-[10px] uppercase tracking-wider text-[#C9A227] font-bold block">Total Amount Due</span>
                  <div className="text-2xl font-black text-white mt-0.5">{formatNaira(previewInvoice.total)}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] space-y-1 text-[11px] text-[#66615B]">
                <div className="font-bold text-[#111111]">Official Settlement Account:</div>
                {COMPANY_BANK_ACCOUNTS.map((account) => (
                  <div key={account.accountNumber}>{bankAccountLine(account)}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECEIPT PREVIEW WITH OFFICIAL SEAL */}
      {/* ========================================================= */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-10 shadow-2xl border border-[#ECE8DF] relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE8DF]">
              <span className="font-extrabold text-sm text-green-700">★ OFFICIAL RECEIPT OF PAYMENT</span>
              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
                className="text-[#8C827A] hover:text-[#111111]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-6 space-y-4 text-xs">
              <div className="flex justify-between">
                <div>
                  <span className="text-[#8C827A] text-[10px] uppercase font-bold">Received From:</span>
                  <div className="text-base font-extrabold text-[#111111]">{previewReceipt.clientName}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-[#111111]">#{previewReceipt.receiptNumber}</div>
                  <div className="text-[#8C827A]">{previewReceipt.paymentDate}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                <span className="text-[10px] uppercase font-bold text-green-800">Total Confirmed Settlement</span>
                <div className="text-3xl font-extrabold text-green-800 mt-1">{formatNaira(previewReceipt.amountPaid)}</div>
                <div className="text-xs text-green-900 italic mt-1">{previewReceipt.amountInWords}</div>
              </div>

              <div className="space-y-1 text-[#66615B]">
                <div>
                  Payment For: <span className="font-semibold text-[#111111]">{previewReceipt.paymentFor}</span>
                </div>
                <div>
                  Channel: <span className="font-semibold text-[#111111]">{previewReceipt.paymentMethod}</span> (Ref:{' '}
                  {previewReceipt.referenceNumber})
                </div>
              </div>

              {/* Official Seal Badge */}
              <div className="pt-4 border-t border-[#ECE8DF] flex items-center justify-center text-center">
                <div className="px-5 py-2.5 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#6B5515]">
                  <div className="font-extrabold text-xs">BUYSMART PROCUREMENT LIMITED</div>
                  <div className="text-[10px]">RC REGISTERED • EXECUTIVE MANAGEMENT DESK</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
