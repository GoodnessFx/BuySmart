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
} from 'lucide-react';
import {
  findInvoiceByNumber,
  getStoredInvoices,
  formatNaira,
  type InvoiceRecord,
  type LineType,
} from '../../lib/auth';
import { downloadInvoicePDF } from '../../lib/pdf';

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Parse ?num= or ?invoice= or pathname
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceNum = urlParams.get('num') || urlParams.get('invoice') || 'BSP-2026-001';

    const found = findInvoiceByNumber(invoiceNum);
    if (found) {
      setInvoice(found);
    } else {
      const all = getStoredInvoices();
      if (all.length > 0) setInvoice(all[0]);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppConfirm = () => {
    if (!invoice) return;
    const msg = `Hello BuySmart Procurement Limited, I am confirming payment for Invoice #${invoice.invoiceNumber} (${formatNaira(
      invoice.total
    )}) for ${invoice.clientName}.`;
    window.open(`https://wa.me/2348100130714?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <img src="/brand/logo.png" alt="BuySmart" className="h-12 w-12 mx-auto object-contain" />
          <p className="text-sm font-semibold text-[#111111]">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'Paid';

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] py-10 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Header with BuySmart Logo */}
        <div className="flex items-center justify-between pb-6 border-b border-[#ECE8DF]">
          <a href="/" className="inline-flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-2xl bg-white p-2 border border-[#ECE8DF] flex items-center justify-center shadow-sm">
              <img src="/brand/logo.png" alt="BuySmart" className="h-full w-full object-contain" />
            </div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-lg font-extrabold text-[#111111]">
                BuySmart
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A227]">
                Procurement Limited
              </div>
            </div>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DED9CF] bg-white px-3.5 py-2 text-xs font-semibold text-[#4A4A4A] hover:border-[#C9A227] transition cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-[#C9A227]" />
              <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
            </button>
            <button
              type="button"
              onClick={() => downloadInvoicePDF(invoice)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#C9A227]" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Card Formatted Exactly from the User's Reference Screenshot */}
        <div className="rounded-3xl bg-white border border-[#ECE8DF] p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          {/* Top Status Badge */}
          <div className="flex justify-end">
            <span
              className={`rounded-md px-3.5 py-1 text-xs font-black uppercase tracking-wider ${
                isPaid ? 'bg-green-600 text-white' : 'bg-[#E8804C] text-white'
              }`}
            >
              {isPaid ? 'PAID & CONFIRMED' : 'UNPAID'}
            </span>
          </div>

          {/* Hero Greeting & Amount (Exact design from user screenshot) */}
          <div className="text-center py-4 space-y-2.5">
            <h2 className="text-base font-semibold text-[#4A4A4A]">Hi, {invoice.clientName}</h2>
            <p className="text-xs sm:text-sm text-[#66615B]">You have an outstanding amount of</p>
            <div
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight"
            >
              {formatNaira(invoice.total)}
            </div>
            <p className="text-xs text-[#66615B]">
              for an invoice from <span className="font-semibold text-[#111111]">Buysmart Procurement Limited</span>
            </p>
          </div>

          <div className="pt-3 border-t border-[#ECE8DF] flex items-center justify-center gap-2 text-xs text-[#8C827A]">
            <span>Powered by</span>
            <span className="font-extrabold text-[#111111]">BuySmart Invoice</span>
          </div>
        </div>

        {/* Invoice Summary Details */}
        <div className="rounded-3xl bg-white border border-[#ECE8DF] p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
            <span className="font-bold text-[#8C827A] uppercase">Invoice Number</span>
            <span className="font-mono font-bold text-sm text-[#111111]">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
            <span className="font-bold text-[#8C827A] uppercase">Issued Date</span>
            <span className="font-medium text-[#111111]">{invoice.createdAt}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-[#ECE8DF]">
            <span className="font-bold text-[#8C827A] uppercase">Due Date</span>
            <span className="font-medium text-[#111111]">{invoice.dueDate}</span>
          </div>

          {/* Itemized Line Items */}
          <div className="pt-2 space-y-2">
            <span className="font-bold text-[#8C827A] uppercase block">Itemized Charges</span>
            <div className="space-y-2">
              {invoice.lines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAF8] border border-[#ECE8DF]"
                >
                  <div>
                    <div className="font-bold text-[#111111]">{line.description}</div>
                    <div className="text-[10px] text-[#8C827A]">{LINE_LABELS[line.type] || line.type}</div>
                  </div>
                  <div className="font-bold text-[#111111]">{formatNaira(line.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Bank Account Payment Details */}
        <div className="rounded-3xl bg-white border border-[#ECE8DF] p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#ECE8DF]">
            <Building2 className="h-4 w-4 text-[#C9A227]" />
            <span className="font-extrabold text-sm text-[#111111]">Direct Bank Transfer Accounts</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] space-y-1">
              <div className="font-bold text-xs text-[#111111]">Zenith Bank PLC</div>
              <div className="text-xs text-[#66615B]">Account Name: BUYSMART PROCUREMENT LIMITED</div>
              <div className="font-mono font-bold text-sm text-[#C9A227]">1224890123</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAF8] border border-[#ECE8DF] space-y-1">
              <div className="font-bold text-xs text-[#111111]">Providus Bank</div>
              <div className="text-xs text-[#66615B]">Account Name: BUYSMART PROCUREMENT LIMITED</div>
              <div className="font-mono font-bold text-sm text-[#C9A227]">5401893421</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleWhatsAppConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 px-4 text-xs font-bold text-white shadow-sm hover:opacity-95 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Confirm Payment on WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => downloadInvoicePDF(invoice)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] py-3.5 px-4 text-xs font-bold text-white shadow-sm hover:opacity-90 cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#C9A227]" />
            <span>Download PDF with Logo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
