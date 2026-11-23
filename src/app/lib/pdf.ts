/**
 * BuySmart Official PDF Generator for Invoices and Receipts
 * Includes high-resolution BuySmart Logo, diagonal watermarks, and CAC executive stamp.
 */

import { jsPDF } from 'jspdf';
import {
  type InvoiceRecord,
  type ReceiptRecord,
  type LineType,
  formatNaira,
} from './auth';

const LINE_LABELS: Record<LineType, string> = {
  goods: 'Goods Purchase',
  freight: 'Air / Sea Freight',
  customs: 'Customs & Port Terminal Clearing',
  packing: 'Packing & Protective Crating Fee',
  service: 'Procurement & Inspection Agency Fee',
  exchange: 'Exchange Conversion Charges',
};

// Cache loaded logo to avoid multiple canvas conversions
let cachedLogoBase64: string | null = null;

export async function getBuySmartLogoBase64(): Promise<string> {
  if (cachedLogoBase64) return cachedLogoBase64;

  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined') {
        resolve('');
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 240;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 240, 240);
            const dataUrl = canvas.toDataURL('image/png');
            cachedLogoBase64 = dataUrl;
            resolve(dataUrl);
          } else {
            resolve('');
          }
        } catch {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = '/brand/logo.png';
    } catch {
      resolve('');
    }
  });
}

/**
 * Download Official BuySmart Invoice with Logo, Watermark & Port Information
 */
export async function downloadInvoicePDF(inv: InvoiceRecord): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Top Gold Brand Accent Bar
  doc.setFillColor(201, 162, 39);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Large Balanced Diagonal Watermark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(244, 241, 234);
  doc.text('BUYSMART PROCUREMENT LIMITED', pageWidth / 2, 142, {
    align: 'center',
    angle: 32,
  });
  doc.setFontSize(22);
  doc.setTextColor(240, 237, 230);
  doc.text(
    inv.status === 'Paid' ? 'PAID & CONFIRMED • OFFICIAL SETTLEMENT' : 'AUTHENTIC COMMERCIAL INVOICE',
    pageWidth / 2,
    156,
    { align: 'center', angle: 32 }
  );

  // 3. Load & Render BuySmart Logo in Header with Balanced Proportions
  const logoData = await getBuySmartLogoBase64();
  let textStartX = 20;

  if (logoData) {
    try {
      // Embed official BuySmart Logo (22mm x 22mm)
      doc.addImage(logoData, 'PNG', 20, 11, 22, 22);
      textStartX = 46;
    } catch {}
  }

  // Company Corporate Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 17, 17);
  doc.text('BUYSMART', textStartX, 17);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(201, 162, 39);
  doc.text('PROCUREMENT LIMITED', textStartX, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('RC Registered • Corporate Affairs Commission Nigeria', textStartX, 26.5);
  doc.text('6 Bassey Street, Egbeda, Lagos 100276, Nigeria', textStartX, 30.5);
  doc.text('Phone: 0810 013 0714 | Email: buysmartprocurementlimited@gmail.com', textStartX, 34.5);

  // Invoice Big Heading & Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(17, 17, 17);
  doc.text('INVOICE', pageWidth - 20, 22, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice No: ${inv.invoiceNumber}`, pageWidth - 20, 28, { align: 'right' });
  doc.text(`Date: ${inv.createdAt}`, pageWidth - 20, 33, { align: 'right' });
  doc.text(`Due Date: ${inv.dueDate}`, pageWidth - 20, 38, { align: 'right' });

  // Status Badge in PDF
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  if (inv.status === 'Paid') {
    doc.setTextColor(16, 120, 50);
  } else if (inv.status === 'Unpaid') {
    doc.setTextColor(220, 100, 30);
  } else {
    doc.setTextColor(30, 100, 200);
  }
  doc.text(`Status: ${inv.status.toUpperCase()}`, pageWidth - 20, 44, { align: 'right' });

  // Horizontal Separator Line
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 48, pageWidth - 20, 48);

  // Client Details Box (Bill To)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(201, 162, 39);
  doc.text('INVOICE TO (CLIENT):', 20, 56);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 17, 17);
  doc.text(inv.clientName, 20, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Phone: ${inv.clientPhone} ${inv.clientWhatsApp ? ' | WhatsApp: ' + inv.clientWhatsApp : ''}`, 20, 67);
  if (inv.clientEmail) doc.text(`Email: ${inv.clientEmail}`, 20, 71);
  if (inv.clientAddress) doc.text(`Address: ${inv.clientAddress}`, 20, 75);

  // Itemized Lines Table Header
  let y = 82;
  doc.setFillColor(245, 244, 240);
  doc.rect(20, y, pageWidth - 40, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 17, 17);
  doc.text('Item Description', 25, y + 5.5);
  doc.text('Category', 110, y + 5.5);
  doc.text('Qty/Wt', 145, y + 5.5, { align: 'right' });
  doc.text('Amount (NGN)', pageWidth - 25, y + 5.5, { align: 'right' });

  y += 12;
  doc.setFont('helvetica', 'normal');

  inv.lines.forEach((line) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 17, 17);
    doc.text(line.description || 'Service Line', 25, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(LINE_LABELS[line.type] || line.type, 110, y);

    const qtyText = line.weight ? `${line.weight} kg` : `${line.quantity || 1} unit`;
    doc.text(qtyText, 145, y, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 17, 17);
    doc.text(formatNaira(line.amount), pageWidth - 25, y, { align: 'right' });

    y += 7;
    doc.setDrawColor(240, 240, 240);
    doc.line(20, y - 1, pageWidth - 20, y - 1);
    y += 2;
  });

  // Totals Box
  y += 5;
  const totalsX = pageWidth - 90;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Subtotal:', totalsX, y);
  doc.text(formatNaira(inv.subtotal), pageWidth - 25, y, { align: 'right' });

  if (inv.previousBalance > 0) {
    y += 6;
    doc.text('Previous Balance:', totalsX, y);
    doc.text(formatNaira(inv.previousBalance), pageWidth - 25, y, { align: 'right' });
  }

  if (inv.discount > 0) {
    y += 6;
    doc.text('Discount Applied:', totalsX, y);
    doc.text('-' + formatNaira(inv.discount), pageWidth - 25, y, { align: 'right' });
  }

  y += 7;
  const boxWidth = pageWidth - totalsX - 16;
  doc.setFillColor(248, 246, 240);
  doc.roundedRect(totalsX - 4, y - 4, boxWidth, 12, 1.5, 1.5, 'F');
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.4);
  doc.roundedRect(totalsX - 4, y - 4, boxWidth, 12, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(17, 17, 17);
  doc.text(inv.status === 'Paid' ? 'TOTAL SETTLED:' : 'TOTAL DUE:', totalsX, y + 3.5);

  doc.setFontSize(11);
  doc.setTextColor(180, 135, 20);
  doc.text(formatNaira(inv.total), pageWidth - 25, y + 3.5, { align: 'right' });

  // Official Bank Details
  y += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 17, 17);
  doc.text('Official Payment Accounts (Direct Transfer):', 20, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);
  doc.text('Bank 1: Zenith Bank PLC | Account Name: BUYSMART PROCUREMENT LIMITED | Account No: 1224890123', 20, y + 5);
  doc.text('Bank 2: Providus Bank | Account Name: BUYSMART PROCUREMENT LIMITED | Account No: 5401893421', 20, y + 9);
  doc.text('Online Payment Link: ' + (inv.paymentLink || 'https://buysmart.ng/invoice?num=' + inv.invoiceNumber), 20, y + 13);

  // Bottom Management Verification Seal with Logo Icon
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', pageWidth / 2 - 45, 274, 9, 9);
    } catch {}
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(201, 162, 39);
  doc.text(
    'BUYSMART PROCUREMENT LIMITED • OFFICIAL MANAGEMENT SEAL • RC REGISTERED',
    pageWidth / 2 + 5,
    280,
    { align: 'center' }
  );

  doc.save(`BuySmart-Invoice-${inv.invoiceNumber}.pdf`);
}

/**
 * Download Official BuySmart Receipt with Logo, Watermark & Official Stamp
 */
export async function downloadReceiptPDF(rec: ReceiptRecord): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Accent Bar
  doc.setFillColor(201, 162, 39);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Large Balanced Diagonal Watermark: PAID & CONFIRMED
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.setTextColor(234, 244, 234);
  doc.text('BUYSMART PROCUREMENT LIMITED', pageWidth / 2, 138, {
    align: 'center',
    angle: 32,
  });
  doc.setFontSize(26);
  doc.setTextColor(226, 240, 226);
  doc.text('PAID & CONFIRMED • OFFICIAL RECEIPT', pageWidth / 2, 152, {
    align: 'center',
    angle: 32,
  });

  // Load BuySmart Logo with balanced proportions
  const logoData = await getBuySmartLogoBase64();
  let textStartX = 20;

  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 20, 11, 22, 22);
      textStartX = 46;
    } catch {}
  }

  // Header Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 17, 17);
  doc.text('BUYSMART', textStartX, 17);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(201, 162, 39);
  doc.text('PROCUREMENT LIMITED', textStartX, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('RC Registered • Corporate Affairs Commission Nigeria', textStartX, 26.5);
  doc.text('6 Bassey Street, Egbeda, Lagos 100276, Nigeria', textStartX, 30.5);
  doc.text('Phone: 0810 013 0714 | Email: buysmartprocurementlimited@gmail.com', textStartX, 34.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(16, 120, 50);
  doc.text('OFFICIAL RECEIPT', pageWidth - 20, 20, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Receipt No: ${rec.receiptNumber}`, pageWidth - 20, 26, { align: 'right' });
  doc.text(`Date: ${rec.paymentDate}`, pageWidth - 20, 31, { align: 'right' });
  doc.text(`Ref: ${rec.referenceNumber}`, pageWidth - 20, 36, { align: 'right' });
  doc.text(`Receipt No: ${rec.receiptNumber}`, pageWidth - 20, 28, { align: 'right' });
  doc.text(`Date: ${rec.paymentDate}`, pageWidth - 20, 33, { align: 'right' });
  doc.text(`Ref: ${rec.referenceNumber}`, pageWidth - 20, 38, { align: 'right' });

  doc.setDrawColor(220, 220, 220);
  doc.line(20, 48, pageWidth - 20, 48);

  // Receipt Content
  let y = 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Received From:', 20, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(17, 17, 17);
  doc.text(rec.clientName, 60, y);

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Amount Received:', 20, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(16, 120, 50);
  doc.text(formatNaira(rec.amountPaid), 60, y);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Amount in Words:', 20, y);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(rec.amountInWords, 60, y, { maxWidth: pageWidth - 80 });

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Payment For:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(17, 17, 17);
  doc.text(rec.paymentFor, 60, y, { maxWidth: pageWidth - 80 });

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Payment Channel:', 20, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 17, 17);
  doc.text(`${rec.paymentMethod} ${rec.bankName ? '(' + rec.bankName + ')' : ''}`, 60, y);

  // Official Stamp Seal Box (Centered)
  y += 35;
  doc.setDrawColor(201, 162, 39);
  doc.setFillColor(254, 252, 245);
  doc.roundedRect(pageWidth / 2 - 55, y, 110, 42, 3, 3, 'FD');

  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', pageWidth / 2 - 45, y + 8, 12, 12);
    } catch {}
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(201, 162, 39);
  doc.text('★ BUYSMART PROCUREMENT LIMITED ★', pageWidth / 2 + 5, y + 13, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(16, 120, 50);
  doc.text('OFFICIAL DIGITAL RECEIPT • VERIFIED', pageWidth / 2 + 5, y + 21, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`Authorized Desk: ${rec.receivedBy}`, pageWidth / 2 + 5, y + 29, { align: 'center' });
  doc.text('RC Registered • Lagos, Nigeria', pageWidth / 2 + 5, y + 35, { align: 'center' });

  doc.save(`BuySmart-Receipt-${rec.receiptNumber}.pdf`);
}
