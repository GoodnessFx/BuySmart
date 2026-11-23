/**
 * Public invoice sharing.
 *
 * Business records live in the management desk's browser storage, so a plain
 * "/invoice?num=..." link cannot show anything on a client's phone. Every share
 * link therefore carries a compact, self-contained snapshot of the invoice in the
 * URL fragment (the fragment is never sent to the server, so the amount cannot be
 * lost to a redirect) and always points at "/" — which every host serves.
 *
 * Format: https://buysmart.ng/#/invoice?num=BSP-2026-001&d=<snapshot>
 */

import { type InvoiceRecord, type InvoiceLine, type LineType } from './auth';

export const CANONICAL_SITE_ORIGIN = 'https://buysmart.ng';

const SNAPSHOT_PARAM = 'd';

type CompactLine = [LineType, string, number, number | undefined, number | undefined, number];

type CompactInvoice = {
  n: string;
  i: string;
  cn: string;
  cp: string;
  cw: string;
  ce: string;
  ca: string;
  cur: string;
  ex: number;
  exd: string;
  pb: number;
  dc: number;
  t: string;
  l: CompactLine[];
  s: number;
  tt: number;
  ap: number;
  st: InvoiceRecord['status'];
  pl: string;
  c: string;
  dd: string;
  nt: string;
};

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeInvoiceSnapshot(invoice: InvoiceRecord): string {
  const compact: CompactInvoice = {
    n: invoice.invoiceNumber,
    i: invoice.id,
    cn: invoice.clientName,
    cp: invoice.clientPhone,
    cw: invoice.clientWhatsApp || '',
    ce: invoice.clientEmail || '',
    ca: invoice.clientAddress || '',
    cur: invoice.currency || 'NGN',
    ex: Number(invoice.exchangeRate) || 0,
    exd: invoice.exchangeRateDate || '',
    pb: Number(invoice.previousBalance) || 0,
    dc: Number(invoice.discount) || 0,
    t: invoice.terms || '',
    l: (invoice.lines || []).map((line) => [
      line.type,
      line.description,
      Number(line.quantity) || 1,
      line.weight,
      line.rate,
      Number(line.amount) || 0,
    ]),
    s: Number(invoice.subtotal) || 0,
    tt: Number(invoice.total) || 0,
    ap: Number(invoice.amountPaid) || 0,
    st: invoice.status,
    pl: invoice.paymentLink || '',
    c: invoice.createdAt,
    dd: invoice.dueDate,
    nt: invoice.notes || '',
  };

  return toBase64Url(JSON.stringify(compact));
}

export function decodeInvoiceSnapshot(token: string): InvoiceRecord | null {
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as CompactInvoice;
    if (!parsed || !parsed.n || !parsed.cn) return null;
    if (!Array.isArray(parsed.l)) return null;

    const lines: InvoiceLine[] = parsed.l.map((line, index) => ({
      id: `link-line-${index}`,
      type: line[0],
      description: line[1],
      quantity: line[2],
      weight: line[3],
      rate: line[4],
      amount: line[5],
    }));

    return {
      id: parsed.i || `link-${parsed.n}`,
      invoiceNumber: parsed.n,
      clientName: parsed.cn,
      clientPhone: parsed.cp || '',
      clientWhatsApp: parsed.cw || '',
      clientEmail: parsed.ce || '',
      clientAddress: parsed.ca || '',
      currency: parsed.cur || 'NGN',
      exchangeRate: parsed.ex || 0,
      exchangeRateDate: parsed.exd || '',
      previousBalance: parsed.pb || 0,
      discount: parsed.dc || 0,
      terms: parsed.t || '',
      lines,
      subtotal: parsed.s || 0,
      total: parsed.tt || 0,
      amountPaid: parsed.ap || 0,
      status: parsed.st || 'Unpaid',
      paymentLink: parsed.pl || '',
      createdAt: parsed.c || '',
      dueDate: parsed.dd || '',
      notes: parsed.nt || '',
    };
  } catch {
    return null;
  }
}

type LinkLocation = {
  invoiceNumber?: string;
  receiptNumber?: string;
  trackingNumber?: string;
  snapshot: InvoiceRecord | null;
  view?: string;
};

/** Reads num/d/receipt/tracking from either "#/invoice?..." or "?..." URLs. */
export function readLinkLocation(): LinkLocation {
  if (typeof window === 'undefined') return { snapshot: null };

  const queryPool: URLSearchParams[] = [];
  const hash = window.location.hash || '';

  if (hash.includes('?')) {
    queryPool.push(new URLSearchParams(hash.slice(hash.indexOf('?') + 1)));
  }
  queryPool.push(new URLSearchParams(window.location.search));

  const read = (key: string): string | undefined => {
    for (const params of queryPool) {
      const value = params.get(key);
      if (value) return value;
    }
    return undefined;
  };

  const snapshotToken = read(SNAPSHOT_PARAM);
  const snapshot = snapshotToken ? decodeInvoiceSnapshot(snapshotToken) : null;
  const invoiceNumber = read('num') || read('invoice') || snapshot?.invoiceNumber;
  const view = hash.includes('receipt') || window.location.search.includes('receipt') ? 'receipt' : undefined;

  return {
    invoiceNumber,
    receiptNumber: read('receipt'),
    trackingNumber: read('track'),
    snapshot,
    view,
  };
}

/** Builds a portable public invoice link that renders on any device. */
export function buildInvoiceLink(invoice: InvoiceRecord, origin?: string): string {
  const base = (origin || (typeof window !== 'undefined' ? window.location.origin : CANONICAL_SITE_ORIGIN)).replace(/\/$/, '');
  const token = encodeInvoiceSnapshot(invoice);
  return `${base}/#/invoice?num=${encodeURIComponent(invoice.invoiceNumber)}&${SNAPSHOT_PARAM}=${token}`;
}

/**
 * Share links must point at a host that really serves this app. When the desk runs
 * on localhost we fall back to the canonical domain; when it runs on the live
 * deployment we keep that deployment's origin so the client never lands on a
 * server that answers plain JSON.
 */
function resolveShareOrigin(): string {
  if (typeof window === 'undefined' || window.location.protocol === 'file:') return CANONICAL_SITE_ORIGIN;
  const origin = window.location.origin;
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/i.test(origin);
  return isLocal ? CANONICAL_SITE_ORIGIN : origin;
}

export function buildPublicInvoiceLink(invoice: InvoiceRecord): string {
  return buildInvoiceLink(invoice, resolveShareOrigin());
}
