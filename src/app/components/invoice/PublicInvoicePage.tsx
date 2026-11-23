'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Building2,
  ArrowRight,
  Phone,
  MessageSquare,
  Shield,
  CreditCard,
  Package,
  User,
  LogIn,
  Check,
  Receipt as ReceiptIcon,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  findInvoiceByNumber,
  findReceiptByNumber,
  getStoredInvoices,
  getStoredReceipts,
  getAuthUser,
  formatNaira,
  type InvoiceRecord,
  type ReceiptRecord,
  type LineType,
} from '../../lib/auth';
import { downloadInvoicePDF, downloadReceiptPDF } from '../../lib/pdf';
import { initiatePaystackCheckout } from '../../lib/paystack';
import { buildInvoiceLink, readLinkLocation } from '../../lib/invoice-link';
import { COMPANY_BANK_ACCOUNTS } from '../../lib/bank';

const LINE_LABELS: Record<LineType, string> = {
  goods: 'Goods Purchase',
  freight: 'Air / Sea Freight',
  customs: 'Customs & Port Terminal Clearing',
  packing: 'Packing & Protective Crating Fee',
  service: 'Procurement & Inspection Agency Fee',
  exchange: 'Exchange Conversion Charges',
};

export function PublicInvoicePage() {
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);
  const [receipt, setReceipt] = useState<ReceiptRecord | null>(null);
  const [activeView, setActiveView] = useState<'invoice' | 'receipt'>('invoice');
  const [copied, setCopied] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [lookupState, setLookupState] = useState<'loading' | 'ready' | 'not-found'>('loading');
  const [lookupNumber, setLookupNumber] = useState('');
  const [lookupError, setLookupError] = useState('');

  const currentUser = getAuthUser();

  const showInvoice = (found: InvoiceRecord, preferReceipt = false) => {
    setInvoice(found);
    const matchingReceipt = getStoredReceipts().find(
      (r) => r.invoiceNumber.toLowerCase() === found.invoiceNumber.toLowerCase()
    );
    if (matchingReceipt) {
      setReceipt(matchingReceipt);
      setActiveView(preferReceipt ? 'receipt' : 'invoice');
    }
    setLookupNumber(found.invoiceNumber);
    setLookupState('ready');
  };

  useEffect(() => {
    const resolveLink = () => {
      const link = readLinkLocation();
      setInvoice(null);
      setReceipt(null);
      setActiveView('invoice');
      setLookupError('');
      setLookupState('loading');

      if (link.receiptNumber) {
        const foundReceipt = findReceiptByNumber(link.receiptNumber);
        if (foundReceipt) {
          setReceipt(foundReceipt);
          setActiveView('receipt');
          const relatedInv = findInvoiceByNumber(foundReceipt.invoiceNumber);
          if (relatedInv) setInvoice(relatedInv);
          setLookupNumber(foundReceipt.invoiceNumber);
          setLookupState('ready');
          return;
        }
      }

      if (link.invoiceNumber) {
        const stored = findInvoiceByNumber(link.invoiceNumber);
        if (stored) {
          showInvoice(stored, false);
          return;
        }
      }

      // The share link carries its own invoice snapshot, so it renders on any device
      // even when no record exists in this browser's storage.
      if (link.snapshot) {
        showInvoice(link.snapshot, false);
        return;
      }

      if (!link.invoiceNumber) {
        const all = getStoredInvoices();
        if (all.length > 0) {
          showInvoice(all[0], false);
          return;
        }
      }

      setLookupNumber(link.invoiceNumber || '');
      setLookupState('not-found');
    };

    resolveLink();
    // A pasted or edited link only changes the fragment, so resolve it again.
    window.addEventListener('hashchange', resolveLink);
    return () => window.removeEventListener('hashchange', resolveLink);
  }, []);

  const handleManualLookup = (event: React.FormEvent) => {
    event.preventDefault();
    const target = lookupNumber.trim();
    if (!target) return;

    const foundReceipt = findReceiptByNumber(target);
    if (foundReceipt) {
      setReceipt(foundReceipt);
      setActiveView('receipt');
      const relatedInv = findInvoiceByNumber(foundReceipt.invoiceNumber);
      if (relatedInv) setInvoice(relatedInv);
      setLookupState('ready');
      return;
    }

    const foundInvoice = findInvoiceByNumber(target);
    if (foundInvoice) {
      showInvoice(foundInvoice, false);
      return;
    }

    setLookupError(
      'No invoice with that number is available on this device. Ask BuySmart Management to resend the original invoice link.'
    );
  };

  const handleCopyLink = async () => {
    const portableLink = invoice ? buildInvoiceLink(invoice) : window.location.href;
    try {
      await navigator.clipboard.writeText(portableLink);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyAccount = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
    } catch {}
    setCopiedAccount(accountNumber);
    setTimeout(() => setCopiedAccount(''), 3000);
  };

  const handleWhatsAppConfirm = () => {
    if (!invoice) return;
    const msg = `Hello BuySmart Procurement Limited, I am verifying payment settlement for Invoice #${invoice.invoiceNumber} (${formatNaira(
      invoice.total
    )}) for ${invoice.clientName}.`;
    window.open(`https://wa.me/2348100130714?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePaystackPay = async () => {
    if (!invoice) return;
    setIsPaying(true);
    try {
      await initiatePaystackCheckout({
        invoice,
        onSuccess: (newReceipt, updatedInv) => {
          setIsPaying(false);
          setInvoice(updatedInv);
          setReceipt(newReceipt);
          setPaySuccess(true);
          setActiveView('receipt');
        },
        onClose: () => {
          setIsPaying(false);
        },
        onError: (err) => {
          setIsPaying(false);
          alert('Paystack notice: ' + err.message);
        },
      });
    } catch (err) {
      setIsPaying(false);
      alert(
        'Online payment is not available yet: ' +
          ((err as Error)?.message || 'the Paystack public key has not been configured.') +
          '\n\nPlease use the official bank accounts below or contact BuySmart Management.'
      );
    }
  };

  if (lookupState === 'loading' && !invoice && !receipt) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-[#111111] p-2.5 border border-[#C9A227]/40 shadow-sm mx-auto flex items-center justify-center">
            <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
          </div>
          <p className="text-sm font-semibold text-[#111111]">Loading official commercial document...</p>
        </div>
      </div>
    );
  }

  if (lookupState === 'not-found' && !invoice && !receipt) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white border border-[#ECE8DF] p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#111111] p-2 border border-[#C9A227]/40 flex items-center justify-center shrink-0">
              <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
            </div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-base font-extrabold text-[#111111]">
                BuySmart Invoice Desk
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A227]">Procurement Limited</div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] p-4 text-xs text-[#4A4A4A] leading-relaxed">
            <span className="font-bold text-[#111111]">Open your invoice:</span> enter the invoice number exactly as it
            appears on your document (for example BSP-2026-001), or use the secure link sent to you by BuySmart.
          </div>

          <form onSubmit={handleManualLookup} className="space-y-3">
            <input
              type="text"
              value={lookupNumber}
              onChange={(e) => {
                setLookupNumber(e.target.value);
                setLookupError('');
              }}
              placeholder="Invoice number e.g. BSP-2026-001"
              className="w-full rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]"
            />
            {lookupError && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{lookupError}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] py-3 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer"
            >
              <FileText className="h-4 w-4 text-[#C9A227]" />
              <span>Open Invoice</span>
            </button>
          </form>

          <div className="flex items-center justify-center gap-3 pt-2 border-t border-[#ECE8DF] text-[11px] font-semibold">
            <a href="/" className="text-[#66615B] hover:text-[#111111]">
              BuySmart Home
            </a>
            <span className="text-[#DED9CF]">•</span>
            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://wa.me/2348100130714?text=${encodeURIComponent(
                    'Hello BuySmart, please resend my invoice payment link.'
                  )}`,
                  '_blank'
                )
              }
              className="inline-flex items-center gap-1.5 text-[#128C7E] hover:underline cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              Request my link
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = invoice?.status === 'Paid';

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 antialiased relative">
      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        {/* Navigation Bar / Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ECE8DF] gap-4">
          <a href="/" className="inline-flex items-center gap-3.5 group">
            <div className="h-12 w-12 rounded-2xl bg-[#111111] p-2 border border-[#C9A227]/40 flex items-center justify-center shadow-md shrink-0">
              <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
            </div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-lg font-extrabold text-[#111111] leading-tight">
                BuySmart
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A227]">
                Procurement Limited
              </div>
            </div>
          </a>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DED9CF] bg-white px-3.5 py-2 text-xs font-semibold text-[#4A4A4A] hover:border-[#C9A227] transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-[#C9A227]" />}
              <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
            </button>

            {invoice && (
              <button
                type="button"
                onClick={() => downloadInvoicePDF(invoice)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DED9CF] bg-white px-3.5 py-2 text-xs font-bold text-[#111111] hover:border-[#C9A227] transition cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-[#C9A227]" />
                <span>Invoice PDF</span>
              </button>
            )}

            {receipt && (
              <button
                type="button"
                onClick={() => downloadReceiptPDF(receipt)}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-green-800 transition cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Receipt PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Client Portal Connection Banner (Prompt Login or Register if Guest) */}
        <div className="rounded-2xl border border-[#ECE8DF] bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FAFAF8] border border-[#ECE8DF] flex items-center justify-center text-[#C9A227] shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div className="text-xs">
              {currentUser ? (
                <div>
                  <span className="font-semibold text-[#111111]">Logged in as {currentUser.name}</span>
                  <p className="text-[#66615B] text-[11px]">Synced with your procurement account</p>
                </div>
              ) : (
                <div>
                  <span className="font-semibold text-[#111111]">Viewing as Verified Commercial Guest</span>
                  <p className="text-[#66615B] text-[11px]">Log in or create a client account to track live shipment milestones</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {currentUser ? (
              <a
                href={currentUser.role === 'admin' ? '/admin' : '/client'}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#111111] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition"
              >
                <span>Open {currentUser.role === 'admin' ? 'Founder Console' : 'My Client Portal'}</span>
                <ArrowRight className="h-3 w-3 text-[#C9A227]" />
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1 rounded-xl border border-[#DED9CF] bg-white px-3 py-1.5 text-xs font-semibold text-[#111111] hover:border-[#C9A227] transition"
                >
                  <LogIn className="h-3 w-3 text-[#C9A227]" />
                  <span>Client Login</span>
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center gap-1 rounded-xl bg-[#C9A227] px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-95 transition"
                >
                  <span>Create Account</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Tab Toggle if both Invoice and Receipt exist */}
        {receipt && invoice && (
          <div className="flex items-center p-1 rounded-2xl bg-[#ECE8DF]/60 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setActiveView('invoice')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeView === 'invoice' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#66615B] hover:text-[#111111]'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Commercial Invoice</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('receipt')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeView === 'receipt' ? 'bg-white text-green-700 shadow-xs' : 'text-[#66615B] hover:text-[#111111]'
              }`}
            >
              <ReceiptIcon className="h-3.5 w-3.5 text-green-600" />
              <span>Official Receipt</span>
            </button>
          </div>
        )}

        {/* Success Banner after Paystack payment */}
        {paySuccess && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-900 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <div className="text-xs">
              <div className="font-extrabold text-sm text-green-900">Payment Successfully Confirmed!</div>
              <div>Your invoice has been settled via Paystack and your official receipt has been issued below.</div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: COMMERCIAL INVOICE */}
        {/* ======================================================== */}
        {activeView === 'invoice' && invoice && (
          <div className="rounded-3xl bg-white border border-[#ECE8DF] p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden">
            {/* Subtle Corporate Watermark */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden opacity-[0.035]">
              <div className="text-center rotate-[-25deg] transform">
                <div className="text-6xl sm:text-7xl font-black uppercase tracking-wider text-[#111111]">
                  BUYSMART
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#C9A227] mt-1">
                  OFFICIAL COMMERCIAL INVOICE
                </div>
              </div>
            </div>

            {/* Document Header & Status */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#ECE8DF] relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-[#111111] p-2 border border-[#C9A227]/40 flex items-center justify-center shadow-md shrink-0">
                  <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="font-black text-base text-[#111111] uppercase tracking-wide">
                    BuySmart Procurement Limited
                  </div>
                  <div className="text-[11px] font-bold text-[#C9A227]">
                    CAC RC REGISTERED • OFFICIAL COMMERCIAL INVOICE
                  </div>
                  <div className="text-[10px] text-[#8C827A] mt-0.5">
                    6 Bassey Street, Egbeda, Lagos • 0810 013 0714
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span
                  className={`inline-block rounded-md px-3.5 py-1 text-xs font-black uppercase tracking-wider ${
                    isPaid ? 'bg-green-600 text-white' : 'bg-[#E8804C] text-white'
                  }`}
                >
                  {isPaid ? 'PAID & CONFIRMED' : 'UNPAID • AWAITING SETTLEMENT'}
                </span>
                <div className="font-mono font-bold text-sm text-[#111111] mt-2">
                  #{invoice.invoiceNumber}
                </div>
                <div className="text-[11px] text-[#66615B]">Issued: {invoice.createdAt}</div>
                <div className="text-[11px] text-[#66615B]">Due: {invoice.dueDate}</div>
              </div>
            </div>

            {/* Client "Billed To" Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] relative z-10 text-xs">
              <div>
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#8C827A] block mb-1">
                  Billed To (Client / Consignee):
                </span>
                <div className="font-extrabold text-sm text-[#111111]">{invoice.clientName}</div>
                <div className="text-[#66615B] mt-0.5">{invoice.clientPhone}</div>
                {invoice.clientEmail && <div className="text-[#66615B]">{invoice.clientEmail}</div>}
                {invoice.clientAddress && <div className="text-[#8C827A] mt-1">{invoice.clientAddress}</div>}
              </div>

              <div className="sm:text-right">
                <span className="font-bold text-[10px] uppercase tracking-wider text-[#8C827A] block mb-1">
                  Procurement Summary:
                </span>
                <div className="text-[#66615B]">
                  Currency: <span className="font-bold text-[#111111]">{invoice.currency || 'NGN'}</span>
                </div>
                {invoice.exchangeRate > 0 && (
                  <div className="text-[#66615B]">
                    Exchange Rate: <span className="font-semibold text-[#111111]">₦{invoice.exchangeRate.toLocaleString()} / $1</span>
                  </div>
                )}
                <div className="text-[#8C827A] mt-1">
                  Status: <span className="font-bold text-[#111111]">{invoice.status}</span>
                </div>
              </div>
            </div>

            {/* Itemized Charges Table */}
            <div className="space-y-3 relative z-10">
              <span className="font-bold text-xs uppercase tracking-wider text-[#8C827A]">
                Itemized Procurement & Logistics Charges
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#ECE8DF] text-[10px] uppercase font-bold text-[#8C827A]">
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5 text-right">Qty / Wt</th>
                      <th className="py-2.5 text-right">Amount (NGN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE8DF]">
                    {invoice.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF8]/80 transition">
                        <td className="py-3 font-semibold text-[#111111]">{line.description}</td>
                        <td className="py-3 text-[11px] text-[#66615B]">{LINE_LABELS[line.type] || line.type}</td>
                        <td className="py-3 text-right text-[#66615B]">
                          {line.weight ? `${line.weight} kg` : `${line.quantity || 1}`}
                        </td>
                        <td className="py-3 text-right font-bold text-[#111111]">{formatNaira(line.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Redesigned Executive Total & Settlement Card (Replacing plain black block) */}
            <div className="rounded-2xl border border-[#ECE8DF] bg-[#FAFAF8] p-5 space-y-4 relative z-10">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#66615B]">
                  <span>Subtotal Amount</span>
                  <span className="font-semibold text-[#111111]">{formatNaira(invoice.subtotal)}</span>
                </div>

                {invoice.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount Applied</span>
                    <span className="font-semibold">-{formatNaira(invoice.discount)}</span>
                  </div>
                )}

                {invoice.previousBalance > 0 && (
                  <div className="flex justify-between text-[#66615B]">
                    <span>Previous Outstanding Balance</span>
                    <span className="font-semibold text-[#111111]">{formatNaira(invoice.previousBalance)}</span>
                  </div>
                )}
              </div>

              {/* Total Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#161616] via-[#222222] to-[#161616] text-white border border-[#C9A227]/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#C9A227]">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Total Outstanding Settlement</span>
                  </div>
                  <div
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight"
                  >
                    {formatNaira(invoice.total)}
                  </div>
                  <div className="text-[11px] text-white/70 mt-0.5">
                    {isPaid ? 'Settlement confirmed in full' : 'Net payable for goods, shipping & clearance'}
                  </div>
                </div>

                {!isPaid && (
                  <button
                    type="button"
                    onClick={handlePaystackPay}
                    disabled={isPaying}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#DFB738] py-3.5 px-6 text-xs font-black text-[#111111] shadow-lg hover:opacity-95 transition cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isPaying ? 'Connecting to Paystack...' : 'Pay Online with Paystack'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Direct Bank Transfer Payment Accounts */}
            <div className="rounded-2xl border border-[#ECE8DF] bg-white p-5 space-y-3 relative z-10 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-[#ECE8DF]">
                <Building2 className="h-4 w-4 text-[#C9A227]" />
                <span className="font-extrabold text-xs text-[#111111]">
                  Official Corporate Settlement Account (Direct Transfer)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {COMPANY_BANK_ACCOUNTS.map((account) => (
                  <div
                    key={account.accountNumber}
                    className="p-4 rounded-xl bg-[#FAFAF8] border border-[#ECE8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-[#111111]">{account.bankName}</div>
                      <div className="text-[11px] text-[#66615B]">{account.accountName}</div>
                      <div className="font-mono font-black text-xl text-[#C9A227] tracking-wide">
                        {account.accountNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(account.accountNumber)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DED9CF] bg-white px-4 py-2.5 text-[11px] font-bold text-[#111111] hover:border-[#C9A227] transition cursor-pointer shrink-0"
                    >
                      {copiedAccount === account.accountNumber ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          <span>Account number copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-[#C9A227]" />
                          <span>Copy account number</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 relative z-10">
              <button
                type="button"
                onClick={handleWhatsAppConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 px-4 text-xs font-bold text-white shadow-sm hover:opacity-95 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Confirm Payment via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => downloadInvoicePDF(invoice)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] py-3.5 px-4 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#C9A227]" />
                <span>Download Official PDF Invoice</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: OFFICIAL PAYMENT RECEIPT */}
        {/* ======================================================== */}
        {activeView === 'receipt' && receipt && (
          <div className="rounded-3xl bg-white border border-[#ECE8DF] p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden">
            {/* Subtle Corporate Watermark */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden opacity-[0.035]">
              <div className="text-center rotate-[-25deg] transform">
                <div className="text-6xl sm:text-7xl font-black uppercase tracking-wider text-green-900">
                  PAID & CONFIRMED
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-widest text-green-800 mt-1">
                  OFFICIAL SETTLEMENT RECEIPT
                </div>
              </div>
            </div>

            {/* Receipt Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#ECE8DF] relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-[#111111] p-2 border border-[#C9A227]/40 flex items-center justify-center shadow-md shrink-0">
                  <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="font-black text-base text-[#111111] uppercase tracking-wide">
                    BuySmart Procurement Limited
                  </div>
                  <div className="text-[11px] font-bold text-green-700">
                    ★ OFFICIAL PAYMENT RECEIPT • RC REGISTERED
                  </div>
                  <div className="text-[10px] text-[#8C827A] mt-0.5">
                    Corporate Affairs Commission • Verified Settlement
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block rounded-md bg-green-600 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white">
                  CONFIRMED & SETTLED
                </span>
                <div className="font-mono font-bold text-sm text-[#111111] mt-2">
                  #{receipt.receiptNumber}
                </div>
                <div className="text-[11px] text-[#66615B]">Date: {receipt.paymentDate}</div>
                <div className="text-[11px] text-[#66615B]">Ref: {receipt.referenceNumber}</div>
              </div>
            </div>

            {/* Received From & Settlement Card */}
            <div className="p-6 rounded-2xl bg-green-50/70 border border-green-200 text-center space-y-2 relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-wider text-green-800">
                Total Confirmed Settlement
              </span>
              <div
                style={{ fontFamily: "'Sora', sans-serif'" }}
                className="text-3xl sm:text-4xl font-black text-green-900 tracking-tight"
              >
                {formatNaira(receipt.amountPaid)}
              </div>
              <div className="text-xs text-green-800 italic">{receipt.amountInWords}</div>
            </div>

            {/* Receipt Breakdown */}
            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] space-y-3 relative z-10 text-xs">
              <div className="flex justify-between pb-2 border-b border-[#ECE8DF]">
                <span className="text-[#8C827A] font-bold uppercase text-[10px]">Received From (Client)</span>
                <span className="font-extrabold text-[#111111]">{receipt.clientName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#ECE8DF]">
                <span className="text-[#8C827A] font-bold uppercase text-[10px]">Payment For</span>
                <span className="font-medium text-[#111111]">{receipt.paymentFor}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#ECE8DF]">
                <span className="text-[#8C827A] font-bold uppercase text-[10px]">Channel & Gateway</span>
                <span className="font-semibold text-[#111111]">
                  {receipt.paymentMethod} {receipt.bankName ? `(${receipt.bankName})` : ''}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#ECE8DF]">
                <span className="text-[#8C827A] font-bold uppercase text-[10px]">Transaction Reference</span>
                <span className="font-mono font-bold text-[#111111]">{receipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C827A] font-bold uppercase text-[10px]">Balance Remaining</span>
                <span className="font-bold text-green-700">{formatNaira(receipt.balanceRemaining || 0)}</span>
              </div>
            </div>

            {/* Official CAC Seal */}
            <div className="pt-2 flex items-center justify-center text-center relative z-10">
              <div className="px-6 py-3 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#6B5515] text-xs">
                <div className="font-black text-xs tracking-wider">BUYSMART PROCUREMENT LIMITED</div>
                <div className="text-[10px] mt-0.5">OFFICIAL ELECTRONIC MANAGEMENT DESK • RC REGISTERED</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 relative z-10">
              <button
                type="button"
                onClick={() => downloadReceiptPDF(receipt)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] py-3.5 px-4 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#C9A227]" />
                <span>Download Official Receipt PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('invoice')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#DED9CF] bg-white py-3.5 px-4 text-xs font-bold text-[#111111] shadow-sm hover:border-[#C9A227] cursor-pointer"
              >
                <FileText className="h-4 w-4 text-[#C9A227]" />
                <span>View Associated Invoice</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
