'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  FileText,
  CreditCard,
  MessageCircle,
  Truck,
  Plane,
  Ship,
  Clock,
  CheckCircle2,
  Download,
  ExternalLink,
  Receipt as ReceiptIcon,
  Search,
  Calculator,
  User,
  LogOut,
  ArrowRight,
  Eye,
  AlertCircle,
  Phone,
  HelpCircle,
  X,
  Share2,
  Building2,
  MapPin,
  Mail,
  Save,
  Check,
  Shield,
  Clock3,
} from 'lucide-react';
import { downloadInvoicePDF, downloadReceiptPDF } from '../../lib/pdf';
import { ModernTrackingCard } from '../shipments/ModernTrackingCard';
import {
  getAuthUser,
  clearAuthUser,
  getStoredInvoices,
  getStoredReceipts,
  getStoredShipments,
  saveQuoteRequest,
  formatNaira,
  getShippingRates,
  saveClient,
  findClientByEmail,
  setAuthUser,
  getTawkConfig,
  type InvoiceRecord,
  type ReceiptRecord,
  type ShipmentItem,
  type QuoteRequestRecord,
  type ShippingRates,
  type ClientProfile,
  type TawkConfig,
} from '../../lib/auth';

type ClientTab = 'shipments' | 'invoices' | 'profile' | 'quote' | 'estimator' | 'support';

export function ClientDashboard() {
  const [user, setUser] = useState(getAuthUser());
  const [activeTab, setActiveTab] = useState<ClientTab>('shipments');
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRecord | null>(null);

  // Quote form state
  const [quoteItem, setQuoteItem] = useState('');
  const [quoteLink, setQuoteLink] = useState('');
  const [quoteQty, setQuoteQty] = useState('1');
  const [quoteMethod, setQuoteMethod] = useState<'Air Freight' | 'Sea Freight'>('Air Freight');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('');

  // Estimator State
  const [estLength, setEstLength] = useState('40');
  const [estWidth, setEstWidth] = useState('30');
  const [estHeight, setEstHeight] = useState('30');
  const [estWeight, setEstWeight] = useState('15');
  const [estMethod, setEstMethod] = useState<'air' | 'sea'>('air');
  const [rates, setRates] = useState<ShippingRates>(getShippingRates());
  const [tawkConfig, setTawkConfig] = useState<TawkConfig>(getTawkConfig());

  // Profile Settings State
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [profName, setProfName] = useState('');
  const [profBusiness, setProfBusiness] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profWhatsapp, setProfWhatsapp] = useState('');
  const [profAltPhone, setProfAltPhone] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profAltEmail, setProfAltEmail] = useState('');
  const [profAddress, setProfAddress] = useState('');
  const [profCity, setProfCity] = useState('');
  const [profState, setProfState] = useState('Lagos State');
  const [profCategory, setProfCategory] = useState('Commercial Machinery & Equipment');
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    const allInvs = getStoredInvoices();
    const allRecs = getStoredReceipts();
    const allShips = getStoredShipments();
    setInvoices(allInvs);
    setReceipts(allRecs);
    setShipments(allShips);
    setRates(getShippingRates());
    setTawkConfig(getTawkConfig());

    const clientData = user?.email ? findClientByEmail(user.email) : undefined;
    if (clientData) {
      setProfile(clientData);
      setProfName(clientData.name || user?.name || '');
      setProfBusiness(clientData.businessName || '');
      setProfPhone(clientData.phone || user?.phone || '');
      setProfWhatsapp(clientData.whatsapp || clientData.phone || '');
      setProfAltPhone(clientData.alternatePhone || '');
      setProfEmail(clientData.email || user?.email || '');
      setProfAltEmail(clientData.alternateEmail || '');
      setProfAddress(clientData.address || '');
      setProfCity(clientData.city || '');
      setProfState(clientData.state || 'Lagos State');
      setProfCategory(clientData.categoryInterest || 'Commercial Machinery & Equipment');
    } else if (user) {
      setProfName(user.name || '');
      setProfPhone(user.phone || '');
      setProfWhatsapp(user.phone || '');
      setProfEmail(user.email || '');
    }
  }, [user]);

  const handleSignOut = () => {
    clearAuthUser();
    window.location.href = '/login';
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedClient: ClientProfile = {
      id: profile?.id || user?.id || 'client-' + Date.now(),
      name: profName.trim(),
      businessName: profBusiness.trim() || undefined,
      email: (profEmail.trim() || user?.email || '').toLowerCase(),
      alternateEmail: profAltEmail.trim() || undefined,
      phone: profPhone.trim(),
      whatsapp: profWhatsapp.trim() || profPhone.trim(),
      alternatePhone: profAltPhone.trim() || undefined,
      address: profAddress.trim() || undefined,
      city: profCity.trim() || undefined,
      state: profState.trim() || undefined,
      categoryInterest: profCategory.trim() || undefined,
      clientCode: profile?.clientCode || user?.clientCode || 'BSP-CL-1049',
      signupMethod: profile?.signupMethod || 'email',
      createdAt: profile?.createdAt || new Date().toISOString().slice(0, 10),
      notes: profile?.notes,
    };

    saveClient(updatedClient);
    setProfile(updatedClient);

    const updatedAuth: AuthUser = {
      ...(user || { id: updatedClient.id, role: 'client' }),
      name: updatedClient.name,
      email: updatedClient.email,
      phone: updatedClient.phone,
      clientCode: updatedClient.clientCode,
      role: 'client',
    };
    setAuthUser(updatedAuth);
    setUser(updatedAuth);

    setProfileMsg('Your profile and business details have been updated successfully!');
    setTimeout(() => setProfileMsg(''), 4000);
  };

  // Estimator calculation using Live Admin Rates
  const lengthNum = parseFloat(estLength) || 0;
  const widthNum = parseFloat(estWidth) || 0;
  const heightNum = parseFloat(estHeight) || 0;
  const actualWeight = parseFloat(estWeight) || 0;

  const volumetricWeight = Math.round(((lengthNum * widthNum * heightNum) / 5000) * 10) / 10;
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);
  const ratePerKg = estMethod === 'air' ? rates.airFreightRatePerKg : rates.seaFreightRatePerKg;
  const estimatedCost = Math.round(chargeableWeight * ratePerKg);

  // Filter items for current logged-in client (or fallback to all if generic client)
  const clientShipments = shipments.filter(
    (s) =>
      !user?.name ||
      s.clientName.toLowerCase().includes(user.name.toLowerCase()) ||
      (user.email && s.clientEmail && s.clientEmail.toLowerCase() === user.email.toLowerCase())
  );
  const displayShipments = clientShipments.length > 0 ? clientShipments : shipments;

  const clientInvoices = invoices.filter(
    (i) =>
      !user?.name ||
      i.clientName.toLowerCase().includes(user.name.toLowerCase()) ||
      (user.email && i.clientEmail && i.clientEmail.toLowerCase() === user.email.toLowerCase())
  );
  const displayInvoices = clientInvoices.length > 0 ? clientInvoices : invoices;

  const clientReceipts = receipts.filter(
    (r) => !user?.name || r.clientName.toLowerCase().includes(user.name.toLowerCase())
  );
  const displayReceipts = clientReceipts.length > 0 ? clientReceipts : receipts;

  // Handle quote submit -> delivered straight to Admin Portal!
  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteItem.trim()) return;

    const newQuote: QuoteRequestRecord = {
      id: 'q-' + Date.now(),
      clientName: user?.name || 'Registered Client',
      clientEmail: user?.email || 'client@buysmart.ng',
      clientPhone: user?.phone || '0810 013 0714',
      itemDescription: quoteItem,
      quantity: quoteQty + ' unit(s)',
      shippingMethod: quoteMethod,
      targetTimeline: 'Standard Procurement Schedule',
      notes: quoteNotes ? `${quoteNotes} ${quoteLink ? `(Link: ${quoteLink})` : ''}` : quoteLink,
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    saveQuoteRequest(newQuote);
    setQuoteSubmitted(true);
    setQuoteSuccessMsg(
      `Your quote request for "${quoteItem}" has been submitted directly to BuySmart Admin Desk! An officer will review and issue an invoice shortly.`
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#ECE8DF] bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#FAFAF8] p-1.5 border border-[#ECE8DF] flex items-center justify-center">
              <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Sora', sans-serif" }} className="text-lg font-extrabold tracking-[-0.02em]">
                  BuySmart
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#C9A227]/20 text-[#6B5515] text-[10px] font-bold uppercase tracking-wider">
                  Client Portal
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#66615B]">
                Live Tracking • Verified Invoices • Direct Sourcing
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A4A4A] hover:text-[#C9A227] px-3.5 py-2 rounded-full border border-[#ECE8DF] bg-[#FAFAF8] transition"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Main Site
            </a>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-[#111111]">{user?.name || 'Chief Emeka Okafor'}</span>
                <span className="text-[10px] text-[#66615B]">{user?.clientCode || 'BSP-CL-8821'}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] hover:bg-red-50 px-3.5 py-2 rounded-full border border-red-200 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2 border-t border-[#FAFAF8]">
          <button
            type="button"
            onClick={() => setActiveTab('shipments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'shipments'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#4A4A4A] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <Package className={`h-4 w-4 ${activeTab === 'shipments' ? 'text-[#C9A227]' : ''}`} />
            <span>My Active Shipments ({displayShipments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#4A4A4A] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <FileText className={`h-4 w-4 ${activeTab === 'invoices' ? 'text-[#C9A227]' : ''}`} />
            <span>Invoices &amp; Official Receipts ({displayInvoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#4A4A4A] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <User className={`h-4 w-4 ${activeTab === 'profile' ? 'text-[#C9A227]' : ''}`} />
            <span>Profile &amp; Account Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quote')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'quote'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#4A4A4A] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <MessageCircle className={`h-4 w-4 ${activeTab === 'quote' ? 'text-[#C9A227]' : ''}`} />
            <span>Request a Quote (Direct to Admin)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('estimator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'estimator'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#4A4A4A] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <Calculator className={`h-4 w-4 ${activeTab === 'estimator' ? 'text-[#C9A227]' : ''}`} />
            <span>Shipping Cost Estimator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'support'
                ? 'bg-[#111111] text-white shadow-sm'
                : 'text-[#4A4A4A] hover:bg-white hover:text-[#111111]'
            }`}
          >
            <Phone className={`h-4 w-4 ${activeTab === 'support' ? 'text-[#C9A227]' : ''}`} />
            <span>Assigned Account Officer</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 text-[#6B5515] text-xs font-bold mb-2">
              <User className="h-3.5 w-3.5" />
              <span>Verified Client Workspace</span>
            </div>
            <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
              Welcome back, {user?.name || 'Chief Emeka Okafor'}
            </h1>
            <p className="text-xs sm:text-sm text-[#66615B]">
              Track your Guangzhou/Vietnam shipments, inspect verified invoices, and submit new product sourcing requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('quote')}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-5 py-3 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
            >
              <span>Request New Sourcing</span>
              <ArrowRight className="h-4 w-4 text-[#C9A227]" />
            </button>
          </div>
        </div>

        {/* TAB 1: SHIPMENTS WITH CLEAN TRACKING PROGRESS */}
        {activeTab === 'shipments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl font-extrabold text-[#111111]">
                  My Active Parcels &amp; Cargo
                </h2>
                <p className="text-xs text-[#66615B]">Real-time milestone tracking synced with BuySmart Operations Desk.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {displayShipments.map((s) => (
                <ModernTrackingCard key={s.id} shipment={s} isAdmin={false} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: INVOICES & OFFICIAL RECEIPTS */}
        {activeTab === 'invoices' && (
          <div className="space-y-8">
            <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-6 border-b border-[#ECE8DF]">
                <div>
                  <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl font-extrabold text-[#111111]">
                    My BuySmart Invoices
                  </h2>
                  <p className="text-xs text-[#66615B]">
                    Official itemized invoices with company registration and bank details.
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#ECE8DF] text-[#8C827A] uppercase tracking-wider font-bold">
                      <th className="pb-3 px-3">Invoice No</th>
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Amount Due</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE8DF]">
                    {displayInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#FAFAF8] transition">
                        <td className="py-4 px-3 font-bold text-[#111111]">{inv.invoiceNumber}</td>
                        <td className="py-4 px-3 text-[#66615B]">{inv.createdAt}</td>
                        <td className="py-4 px-3 font-extrabold text-[#111111]">{formatNaira(inv.total)}</td>
                        <td className="py-4 px-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              inv.status === 'Paid'
                                ? 'bg-green-100 text-green-800'
                                : inv.status === 'Unpaid'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(inv)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DED9CF] bg-white px-3 py-1.5 text-xs font-semibold text-[#111111] hover:border-[#C9A227] cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#C9A227]" />
                            <span>View Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Receipts */}
            <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-6 border-b border-[#ECE8DF]">
                <div>
                  <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl font-extrabold text-[#111111]">
                    Official Payment Receipts
                  </h2>
                  <p className="text-xs text-[#66615B]">Confirmed receipts bearing BuySmart executive stamp.</p>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#ECE8DF] text-[#8C827A] uppercase tracking-wider font-bold">
                      <th className="pb-3 px-3">Receipt No</th>
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Amount Settled</th>
                      <th className="pb-3 px-3">Payment Method</th>
                      <th className="pb-3 px-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE8DF]">
                    {displayReceipts.map((rec) => (
                      <tr key={rec.id} className="hover:bg-[#FAFAF8] transition">
                        <td className="py-4 px-3 font-bold text-[#111111]">{rec.receiptNumber}</td>
                        <td className="py-4 px-3 text-[#66615B]">{rec.paymentDate}</td>
                        <td className="py-4 px-3 font-extrabold text-green-700">{formatNaira(rec.amountPaid)}</td>
                        <td className="py-4 px-3 font-medium text-[#4A4A4A]">{rec.paymentMethod}</td>
                        <td className="py-4 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(rec)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DED9CF] bg-white px-3 py-1.5 text-xs font-semibold text-[#111111] hover:border-[#C9A227] cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#C9A227]" />
                            <span>View Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REQUEST A QUOTE (DELIVERED DIRECTLY TO BUYSMART ADMIN) */}
        {activeTab === 'quote' && (
          <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl font-extrabold text-[#111111]">
                Request a Custom Procurement Quote
              </h2>
              <p className="text-xs text-[#66615B]">
                Your request is delivered instantly into the BuySmart Operations &amp; Admin Desk. An official invoice with factory pricing and freight rates will be generated for you.
              </p>
            </div>

            {quoteSubmitted ? (
              <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                <h3 className="text-sm font-bold text-green-900">Quotation Request Delivered to Admin!</h3>
                <p className="text-xs text-green-700">{quoteSuccessMsg}</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuoteSubmitted(false);
                    setQuoteItem('');
                    setQuoteLink('');
                    setQuoteNotes('');
                  }}
                  className="px-5 py-2.5 rounded-full bg-green-700 text-white text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Submit Another Item
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#111111] block mb-1">Product Name &amp; Specifications</label>
                  <input
                    required
                    value={quoteItem}
                    onChange={(e) => setQuoteItem(e.target.value)}
                    placeholder="e.g. Industrial Automatic Packaging Machinery (500 units/day capacity)"
                    className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-xs outline-none focus:border-[#C9A227] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#111111] block mb-1">Supplier / 1688 / Alibaba Product Link</label>
                  <input
                    value={quoteLink}
                    onChange={(e) => setQuoteLink(e.target.value)}
                    placeholder="https://detail.1688.com/... (optional)"
                    className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-xs outline-none focus:border-[#C9A227] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[#111111] block mb-1">Target Quantity</label>
                    <input
                      required
                      type="number"
                      value={quoteQty}
                      onChange={(e) => setQuoteQty(e.target.value)}
                      className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-xs outline-none focus:border-[#C9A227] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#111111] block mb-1">Preferred Shipping Route</label>
                    <select
                      value={quoteMethod}
                      onChange={(e) => setQuoteMethod(e.target.value as any)}
                      className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-xs outline-none focus:border-[#C9A227] focus:bg-white font-semibold"
                    >
                      <option value="Air Freight">Air Freight (Fast: 5-8 Days)</option>
                      <option value="Sea Freight">Sea Freight (Economical: 40-50 Days)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#111111] block mb-1">Additional Requirements / Notes</label>
                  <textarea
                    rows={3}
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="Specify target timeline, inspection points, factory verification requirements..."
                    className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-xs outline-none focus:border-[#C9A227] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: '#111111' }}
                >
                  <span>Deliver Quote Request to BuySmart Admin</span>
                  <ArrowRight className="h-4 w-4 text-[#C9A227]" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2.5: PROFILE & ACCOUNT SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header Card */}
            <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ECE8DF]">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-[#111111] text-[#C9A227] flex items-center justify-center text-xl font-black shadow-md">
                    {profName ? profName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl sm:text-2xl font-extrabold text-[#111111]">
                        {profName || user?.name || 'Valued Client'}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-[#66615B] mt-0.5">
                      {profBusiness ? `${profBusiness} • ` : ''}Client ID: <span className="font-mono font-bold text-[#111111]">{profile?.clientCode || user?.clientCode || 'BSP-CL-1049'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs text-[#8C827A]">
                  <div>Member Since: <span className="font-semibold text-[#111111]">{profile?.createdAt || '2026'}</span></div>
                  <div>Auth: <span className="font-semibold capitalize text-[#111111]">{profile?.signupMethod || user?.authProvider || 'Email'}</span></div>
                </div>
              </div>

              {profileMsg && (
                <div className="mt-4 p-4 rounded-2xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  <span className="font-semibold">{profileMsg}</span>
                </div>
              )}

              {/* Editable Profile Form */}
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
                <div>
                  <h3 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-3">
                    Personal &amp; Business Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-[#4A4A4A] block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#4A4A4A] block">Business / Company Name</label>
                      <input
                        type="text"
                        value={profBusiness}
                        onChange={(e) => setProfBusiness(e.target.value)}
                        placeholder="e.g. Okafor International Ventures"
                        className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ECE8DF]">
                  <h3 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-3">
                    Contact &amp; WhatsApp Communication
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-[#4A4A4A] block">Primary WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        value={profPhone}
                        onChange={(e) => {
                          setProfPhone(e.target.value);
                          if (!profWhatsapp) setProfWhatsapp(e.target.value);
                        }}
                        className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#4A4A4A] block">Alternate Phone Number</label>
                      <input
                        type="tel"
                        value={profAltPhone}
                        onChange={(e) => setProfAltPhone(e.target.value)}
                        placeholder="0802 000 0000"
                        className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#4A4A4A] block">Primary Email *</label>
                      <input
                        type="email"
                        required
                        value={profEmail}
                        onChange={(e) => setProfEmail(e.target.value)}
                        className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-[#4A4A4A] block">Alternate Email</label>
                      <input
                        type="email"
                        value={profAltEmail}
                        onChange={(e) => setProfAltEmail(e.target.value)}
                        placeholder="accounts@company.com"
                        className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ECE8DF]">
                  <h3 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-3">
                    Delivery Address &amp; Logistics Hub
                  </h3>
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-[#4A4A4A] block">Delivery / Office / Warehouse Address</label>
                      <input
                        type="text"
                        value={profAddress}
                        onChange={(e) => setProfAddress(e.target.value)}
                        placeholder="Plot 12, Commercial Road, Ikeja or Trade Fair Complex"
                        className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-[#4A4A4A] block">State</label>
                        <select
                          value={profState}
                          onChange={(e) => setProfState(e.target.value)}
                          className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                        >
                          <option value="Lagos State">Lagos State</option>
                          <option value="Abuja FCT">Abuja FCT</option>
                          <option value="Rivers State">Rivers State (Port Harcourt)</option>
                          <option value="Anambra State">Anambra State (Onitsha/Nnewi)</option>
                          <option value="Kano State">Kano State</option>
                          <option value="Ogun State">Ogun State</option>
                          <option value="Oyo State">Oyo State (Ibadan)</option>
                          <option value="Delta State">Delta State</option>
                          <option value="Edo State">Edo State (Benin)</option>
                          <option value="Enugu State">Enugu State</option>
                          <option value="Other State">Other Nigerian State</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-[#4A4A4A] block">City / Town</label>
                        <input
                          type="text"
                          value={profCity}
                          onChange={(e) => setProfCity(e.target.value)}
                          placeholder="e.g. Ikeja / Lekki / Wuse 2"
                          className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ECE8DF]">
                  <h3 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-3">
                    Primary Procurement Interest
                  </h3>
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-[#4A4A4A] block">Goods Category</label>
                    <select
                      value={profCategory}
                      onChange={(e) => setProfCategory(e.target.value)}
                      className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#C9A227] focus:bg-white"
                    >
                      <option value="Commercial Machinery & Equipment">Commercial Machinery & Equipment</option>
                      <option value="Home & Kitchen Appliances">Home & Commercial Kitchen Appliances</option>
                      <option value="Smartphones & Electronics">Smartphones, Gadgets & Electronics</option>
                      <option value="Automotive Parts & Accessories">Automotive Parts & Accessories</option>
                      <option value="Fashion, Footwear & Bags">Fashion, Footwear & Bags</option>
                      <option value="Hair, Beauty & Skincare">Hair Extensions, Beauty & Cosmetics</option>
                      <option value="Solar, Inverters & Energy">Solar Panels, Inverters & Electrical</option>
                      <option value="Hardware, Building Materials">Hardware & Building Materials</option>
                      <option value="General Import Cargo">General Import & Bulk Containers</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#111111] px-6 py-3 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
                  >
                    <Save className="h-4 w-4 text-[#C9A227]" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Invoices Sent to You by Admin Overview */}
            <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#ECE8DF]">
                <div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif" }} className="text-base font-extrabold text-[#111111]">
                    Invoices Issued to Your Account ({displayInvoices.length})
                  </h3>
                  <p className="text-xs text-[#66615B]">
                    All official proforma and commercial invoices dispatched by BuySmart management.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('invoices')}
                  className="text-xs font-bold text-[#C9A227] hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              {displayInvoices.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8C827A]">
                  No invoices currently pending. When BuySmart issues your invoice, it will appear here.
                </div>
              ) : (
                <div className="divide-y divide-[#ECE8DF]">
                  {displayInvoices.slice(0, 3).map((inv) => (
                    <div key={inv.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-extrabold text-[#111111]">#{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-[#8C827A]">Date: {inv.createdAt} • Due: {inv.dueDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-sm text-[#111111]">{formatNaira(inv.total)}</div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SHIPPING ESTIMATOR */}
        {activeTab === 'estimator' && (
          <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl font-extrabold text-[#111111]">
                  Shipping Cost Calculator
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-[#C9A227]/15 text-[#6B5515] text-[10px] font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9A227] animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-[#66615B] mt-1">
                Real-time freight estimator reflecting current BuySmart rates updated by Operations Desk.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-2xl bg-[#FAFAF8] p-1 border border-[#ECE8DF]">
              <button
                type="button"
                onClick={() => setEstMethod('air')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  estMethod === 'air' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#66615B] hover:text-[#111111]'
                }`}
              >
                <Plane className="h-3.5 w-3.5" />
                <span>Air Freight Priority ({formatNaira(rates.airFreightRatePerKg)}/kg)</span>
              </button>
              <button
                type="button"
                onClick={() => setEstMethod('sea')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  estMethod === 'sea' ? 'bg-[#111111] text-white shadow-sm' : 'text-[#66615B] hover:text-[#111111]'
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Sea Freight ({formatNaira(rates.seaFreightRatePerKg)}/kg)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-[#111111] block mb-1">Length (cm)</label>
                <input
                  type="number"
                  value={estLength}
                  onChange={(e) => setEstLength(e.target.value)}
                  className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-[#111111] block mb-1">Width (cm)</label>
                <input
                  type="number"
                  value={estWidth}
                  onChange={(e) => setEstWidth(e.target.value)}
                  className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-[#111111] block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={estHeight}
                  onChange={(e) => setEstHeight(e.target.value)}
                  className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-[#111111] block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={estWeight}
                  onChange={(e) => setEstWeight(e.target.value)}
                  className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#66615B]">Actual Weight:</span>
                <span className="font-bold text-[#111111]">{actualWeight} KG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66615B]">Volumetric Weight:</span>
                <span className="font-bold text-[#111111]">{volumetricWeight} KG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66615B]">Chargeable Weight:</span>
                <span className="font-bold text-[#111111]">{chargeableWeight} KG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66615B]">Applied Rate:</span>
                <span className="font-bold text-[#111111]">{formatNaira(ratePerKg)}/kg</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#ECE8DF] text-sm font-extrabold">
                <span>Estimated Shipping Cost:</span>
                <span className="text-[#C9A227]">{formatNaira(estimatedCost)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-[11px] text-[#66615B] flex items-center justify-between">
              <span>USD Benchmark: ₦{rates.usdToNgnRate}/$</span>
              <span>Updated: {rates.lastUpdated}</span>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE SUPPORT DESK & ASSIGNED OFFICER */}
        {activeTab === 'support' && (
          <div className="rounded-3xl border border-[#ECE8DF] bg-white p-6 sm:p-8 shadow-sm max-w-xl mx-auto text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-[#111111] text-[#C9A227] flex items-center justify-center mx-auto shadow-md">
              <MessageCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl font-extrabold text-[#111111]">
                Live Support &amp; Operations Desk
              </h2>
              <p className="text-xs text-[#66615B] mt-1">
                Direct real-time communication with BuySmart executive management and your operations desk.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] text-xs space-y-3 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-[#ECE8DF]">
                <span className="text-[#8C827A] font-bold">Desk Status:</span>
                <span className="flex items-center gap-1.5 font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                  Management Online
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Management Officer:</span>
                <span className="font-bold text-[#111111]">BuySmart Executive Management Desk</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Corporate Email:</span>
                <span className="font-bold text-[#111111]">buysmartprocurementlimited@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Emergency Phone:</span>
                <span className="font-bold text-[#111111]">0810 013 0714</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).Tawk_API?.maximize) {
                    (window as any).Tawk_API.maximize();
                  } else if (tawkConfig.directChatUrl && tawkConfig.directChatUrl.trim() !== '') {
                    window.open(tawkConfig.directChatUrl, '_blank');
                  } else if (tawkConfig.propertyId && tawkConfig.propertyId.trim() !== '') {
                    window.open(`https://tawk.to/chat/${tawkConfig.propertyId}/${tawkConfig.widgetId || 'default'}`, '_blank');
                  } else {
                    window.open('https://wa.me/2348100130714?text=Hello%20BuySmart%20Management%2C%20I%20am%20chatting%20from%20my%20Client%20Portal.', '_blank');
                  }
                }}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] py-3.5 px-6 text-xs font-bold text-white shadow-md hover:opacity-90 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 text-[#C9A227]" />
                <span>Start Live Desk Chat</span>
              </button>

              <a
                href="https://wa.me/2348100130714?text=Hello%20BuySmart%2C%20I%20am%20messaging%20from%20my%20Client%20Portal."
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#DED9CF] bg-white py-3.5 px-5 text-xs font-bold text-[#111111] hover:border-[#C9A227] transition"
              >
                <Phone className="h-4 w-4 text-green-600" />
                <span>Call / WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: VIEW INVOICE */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#ECE8DF] relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE8DF]">
              <div className="flex items-center gap-2.5">
                <img src="/brand/logo.png" alt="BuySmart" className="h-8 w-8 object-contain" />
                <span className="font-extrabold text-sm text-[#111111]">Invoice #{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadInvoicePDF(selectedInvoice)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#C9A227] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-lg text-[#8C827A] hover:text-[#111111]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex justify-between">
                <div>
                  <span className="text-[#8C827A] font-bold text-[10px] uppercase">Billed To:</span>
                  <div className="font-bold text-sm text-[#111111]">{selectedInvoice.clientName}</div>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 font-bold text-[10px] uppercase">
                    {selectedInvoice.status}
                  </span>
                  <div className="text-[#8C827A] mt-1">{selectedInvoice.createdAt}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#111111] text-white flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-white/70">Total Outstanding</span>
                <span className="text-xl font-black text-[#C9A227]">{formatNaira(selectedInvoice.total)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] space-y-1 text-[11px] text-[#66615B]">
                <div className="font-bold text-[#111111]">Direct Bank Transfer Payment:</div>
                <div>Zenith Bank PLC • Acct: 1224890123 • BUYSMART PROCUREMENT LIMITED</div>
                <div>Providus Bank • Acct: 5401893421 • BUYSMART PROCUREMENT LIMITED</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW RECEIPT */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#ECE8DF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
              <span className="font-extrabold text-sm text-green-700">★ OFFICIAL PAYMENT RECEIPT</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadReceiptPDF(selectedReceipt)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#C9A227] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="text-[#8C827A] hover:text-[#111111]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                <div className="text-2xl font-black text-green-800">{formatNaira(selectedReceipt.amountPaid)}</div>
                <div className="text-xs text-green-900 italic mt-1">{selectedReceipt.amountInWords}</div>
              </div>

              <div className="space-y-1 text-[#66615B]">
                <div>
                  Receipt No: <span className="font-bold text-[#111111]">{selectedReceipt.receiptNumber}</span>
                </div>
                <div>
                  Date: <span className="font-bold text-[#111111]">{selectedReceipt.paymentDate}</span>
                </div>
                <div>
                  Payment For: <span className="font-semibold text-[#111111]">{selectedReceipt.paymentFor}</span>
                </div>
                <div>
                  Channel: <span className="font-semibold text-[#111111]">{selectedReceipt.paymentMethod}</span> (Ref:{' '}
                  {selectedReceipt.referenceNumber})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
