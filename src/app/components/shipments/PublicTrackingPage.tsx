'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, MapPin, FileText, Send } from 'lucide-react';
import { trackingFetch } from '../../lib/sheets';
import type { ShipmentStatus } from './types';

const PROGRESS: ShipmentStatus[] = [
  'Order approved', 'Supplier paid', 'At China warehouse', 'Inspected', 'Packed',
  'Left origin', 'In transit', 'Arrived in Lagos', 'Customs clearing',
  'Customs cleared', 'Out for delivery', 'Delivered',
];

const EXCEPTION_SET = new Set(['Delayed', 'Held at customs', 'Issue reported']);

function statusColor(status: ShipmentStatus) {
  if (status === 'Delivered') return 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]';
  if (EXCEPTION_SET.has(status)) return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
  return 'bg-[#FAFAF8] text-[#4A4A4A] border-[#E5E2DA]';
}

export function PublicTrackingPage() {
  const [trackingId, setTrackingId] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const poll = useCallback(async () => {
    if (!trackingId) return;
    try {
      const result = await trackingFetch(trackingId);
      if (result.ok) setData(result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [trackingId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '';
    setTrackingId(id);
    if (id) poll();
    const timer = setInterval(poll, 60000);
    return () => clearInterval(timer);
  }, [trackingId, poll]);

  const shipment = data?.shipment;
  const updates = data?.updates || [];
  const items = data?.items || [];
  const currentIndex = Math.max(0, PROGRESS.indexOf(shipment?.status || 'Order approved'));
  const progress = PROGRESS.length ? Math.round((currentIndex / (PROGRESS.length - 1)) * 100) : 0;
  const latest = updates[updates.length - 1];
  const exception = shipment && EXCEPTION_SET.has(shipment.status);
  const trackingUrl = `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(trackingId)}`;

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-8 text-center">
          <p className="text-[#4A4A4A]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-6">
      {!trackingId && (
        <div className="max-w-xl mx-auto rounded-[28px] border border-[#E5E2DA] bg-white p-8 text-center">
          <h2 className="text-[clamp(1.5rem,5vw,2rem)] font-extrabold text-[#111111] tracking-[-0.02em] mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
            Track your shipment
          </h2>
          <p className="mb-6 text-[#4A4A4A]">Open your tracking link to see the status of your delivery.</p>
        </div>
      )}
      {trackingId && shipment && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-extrabold text-[#111111] tracking-[-0.02em]" style={{ fontFamily: "'Sora', sans-serif" }}>
                {trackingId}
              </h2>
              <a
                href={trackingUrl}
                className="inline-flex items-center gap-2 rounded-full border border-[#DED9CF] bg-white px-3.5 py-2 text-xs text-[#4A4A4A] transition hover:bg-[#FAFAF8]"
              >
                <span className="h-3 w-3 rounded-full bg-[#C9A227]/10 text-[#C9A227] flex items-center justify-center text-[10px]">Link</span> Copy
              </a>
            </div>
            {exception && (
              <div className="rounded-xl border border-[#F6E7BC] bg-[#FCFBF4] p-4 mb-4">
                <span className="flex items-center gap-2 text-xs text-[#92400E]">
                  ?? {shipment.status}{latest?.note ? ' � ' + latest.note : ''}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs text-[#66615B]">Current status</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor(shipment.status)}`}>
                  {shipment.status}
                </span>
              </div>
              {shipment.eta && (
                <div className="text-right">
                  <p className="text-xs text-[#66615B]">ETA</p>
                  <p className="text-sm font-semibold text-[#111111]">{new Date(shipment.eta).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              )}
            </div>
            <div className="w-full bg-[#E5E2DA] rounded-full h-2.5 mb-6 overflow-hidden">
              <div className="h-full bg-[#C9A227]" style={{ width: progress + '%' }} />
            </div>
            <p className="text-xs text-[#66615B] uppercase tracking-wider mb-3">Journey progress</p>

            <div className="space-y-5">
              {updates.map((update) => (
                <div key={update.update_id} className="relative flex gap-3">
                  <div className="relative w-1">
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-0.5 bg-[#E5E2DA]" />
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 h-3 w-3 rounded-full border-[#C9A227] border-2 bg-white" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor(update.status)}`}>
                        {update.status}
                      </span>
                      <span className="text-xs text-[#4A4A4A]">{new Date(update.created_at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {update.location && (
                      <span className="flex items-center gap-1 text-xs text-[#4A4A4A]">
                        <MapPin className="h-3 w-3" /> {update.location}
                      </span>
                    )}
                    {update.note && <p className="text-sm text-[#111111]">{update.note}</p>}
                    {(update.photos?.length || 0) > 0 && (
                      <div className="flex gap-2">
                        {update.photos.map((photo: any, i: number) => (
                          <img key={i} src={photo.url} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#DED9CF]" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {updates.length === 0 && <p className="text-xs text-[#4A4A4A]">No updates yet.</p>}
            </div>

            <div className="mt-8 border-t border-[#E5E2DA] pt-6">
              <p className="text-xs text-[#66615B] uppercase tracking-wider mb-3">Items in this shipment</p>
              <div className="space-y-2">
                {items.map((item: any) => (
                  <div key={item.item_id} className="flex justify-between text-sm">
                    <span className="text-[#4A4A4A]">{item.name}</span>
                    <span className="text-[#111111]">{item.quantity_shipped} / {item.quantity_total}</span>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-[#4A4A4A]">No items listed.</p>}
              </div>
            </div>

            <div className="mt-8 border-t border-[#E5E2DA] pt-6">
              <p className="text-xs text-[#66615B] uppercase tracking-wider mb-3">Documents</p>
              <div className="space-y-2">
                {updates.flatMap((update: any) =>
                  (update.documents || []).map((doc: any, i: number) => (
                    <a
                      key={update.update_id + i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-2 text-sm text-[#C9A227] underline underline-offset-4"
                    >
                      <FileText className="h-4 w-4" /> {doc.name}
                    </a>
                  ))
                )}
                {updates.flatMap((u: any) => (u.documents || [])).length === 0 && (
                  <p className="text-xs text-[#4A4A4A]">No documents yet.</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DED9CF] bg-white px-5 py-3 text-sm text-[#4A4A4A] transition hover:bg-[#FAFAF8]"
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl);
                  // eslint-disable-next-line no-alert
                  alert('Tracking link copied.');
                }}
              >
                <span className="h-3 w-3 rounded-full bg-[#C9A227]/10 text-[#C9A227] flex items-center justify-center text-[10px]">??</span> Copy link
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `BuySmart shipment ${trackingId}: ${shipment.status}` + (shipment.eta ? `. ETA: ${shipment.eta}` : '') + `. Track: ${trackingUrl}`
                )}`}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: '#C9A227' }}
              >
                <Send className="h-4 w-4" /> Share on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
