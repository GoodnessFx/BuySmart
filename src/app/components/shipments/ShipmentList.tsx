'use client';

import { useState, useEffect } from 'react';
import {
  Truck,
  Plane,
  Ship,
  Clock,
  MapPin,
  Image,
  FileText,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  sheetsRequest,
  setSessionPassphrase,
  clearSessionPassphrase,
  getSessionPassphrase,
} from '../../lib/sheets';
import { ShipmentEditor } from './ShipmentEditor';
import { ShipmentUpdateForm } from './ShipmentUpdateForm';
import type { ShipmentListItem, ShipmentStatus } from './types';
import { DEFAULT_STATUSES, EXCEPTION_STATUSES } from './types';

const input =
  'block w-full rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]';
const lab = 'text-sm font-medium text-[#111111]';

const EXCEPTION_SET = new Set(['Delayed', 'Held at customs', 'Issue reported']);
const BULK_OPTIONS = [...DEFAULT_STATUSES, ...EXCEPTION_STATUSES];

function statusColor(status: ShipmentStatus) {
  if (status === 'Delivered') return 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]';
  if (EXCEPTION_SET.has(status)) return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
  return 'bg-[#FAFAF8] text-[#4A4A4A] border-[#E5E2DA]';
}

function modeIcon(mode: string) {
  return mode === 'sea' ? <Ship className="h-4 w-4" /> : <Plane className="h-4 w-4" />;
}

export function ShipmentList() {
  const sessionPassphrase = getSessionPassphrase();
  const [passphrase, setPassphrase] = useState(sessionPassphrase || '');
  const [connected, setConnected] = useState(Boolean(sessionPassphrase));
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<ShipmentListItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ShipmentStatus>('Order approved');
  const [bulkNote, setBulkNote] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  useEffect(() => {
    if (sessionPassphrase) loadShipments();
  }, [sessionPassphrase]);

  const connect = async () => {
    if (!passphrase.trim()) return;
    setLoading(true);
    try {
      await sheetsRequest('shipments', {}, { passphrase });
      setSessionPassphrase(passphrase);
      setConnected(true);
      await loadShipments();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      alert(error instanceof Error ? error.message : 'Invalid staff passphrase.');
    } finally {
      setLoading(false);
    }
  };

  const loadShipments = async () => {
    setLoading(true);
    try {
      const data = await sheetsRequest('shipments', {}, { passphrase });
      setShipments((data as any).shipments || []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    clearSessionPassphrase();
    setPassphrase('');
    setConnected(false);
    setShipments([]);
    setSelected(null);
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const applyBulk = async () => {
    if (selectedIds.size === 0) return alert('Select at least one shipment.');
    if (!bulkNote.trim() && EXCEPTION_SET.has(bulkStatus)) {
      return alert('A reason is required for ' + bulkStatus + '.');
    }
    setBulkSubmitting(true);
    try {
      await sheetsRequest(
        'bulkUpdate',
        { shipment_ids: [...selectedIds], status: bulkStatus, note: bulkNote },
        { passphrase }
      );
      setSelectedIds(new Set());
      setBulkNote('');
      await loadShipments();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      alert(error instanceof Error ? error.message : 'Bulk update failed.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const openEditor = () => setCreating(true);
  const closeEditor = () => setCreating(false);
  const onCreated = () => {
    closeEditor();
    loadShipments();
  };

  const formatDate = (value: string | undefined) => {
    if (!value) return '';
    return new Date(value).toLocaleString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (!connected) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-8 shadow-sm">
          <h2 className="text-[clamp(1.5rem,5vw,2rem)] font-extrabold text-[#111111] tracking-[-0.02em] mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
            Staff portal  Shipments
          </h2>
          <p className="mb-6 text-[#4A4A4A] leading-relaxed">
            Enter your staff passphrase to create shipments and add tracking updates.
            The passphrase is checked by BuySmart's backend and is not stored in the app.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              autoComplete="off"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className={input}
              placeholder="Staff passphrase"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={connect}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition disabled:opacity-60"
                style={{ backgroundColor: '#C9A227' }}
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-[clamp(1.5rem,5vw,2rem)] font-extrabold text-[#111111] tracking-[-0.02em]" style={{ fontFamily: "'Sora', sans-serif" }}>
            Shipments
          </h2>
          <p className="mt-2 text-[#4A4A4A]">All shipments. Tap a shipment to view its timeline and add an update.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border border-[#DED9CF] bg-white px-5 py-3 text-sm text-[#4A4A4A] transition hover:bg-[#FAFAF8]"
          >
            Sign out
          </button>
          <button
            type="button"
            onClick={openEditor}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: '#C9A227' }}
          >
            <Plus className="h-4 w-4" /> Create shipment
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#DED9CF] bg-white">
        <div className="border-b border-[#E5E2DA] px-5 py-4 flex items-center justify-between gap-3">
          <span className={lab}>Shipments</span>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as ShipmentStatus)}
                className={input}
              >
                {BULK_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyBulk}
                disabled={bulkSubmitting}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-60"
                style={{ backgroundColor: '#C9A227' }}
              >
                Apply to {selectedIds.size}
              </button>
            </div>
          )}
        </div>
        {loading && <div className="p-6 text-center text-[#4A4A4A]">Loading shipments</div>}
        {!loading && shipments.length === 0 && (
          <div className="p-8 text-center text-[#4A4A4A]">No shipments yet. Create the first shipment.</div>
        )}
        {!loading &&
          shipments.map((shipment) => {
            const isSelected = selectedIds.has(shipment.shipment_id);
            return (
              <div
                key={shipment.shipment_id}
                className="border-b border-[#E5E2DA] last:border-0 p-5 flex items-center justify-between group cursor-pointer"
                onClick={() => (selectedIds.size > 0 ? toggleSelection(shipment.shipment_id) : setSelected(shipment))}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(shipment.shipment_id)}
                    className="h-4 w-4 rounded border-[#DED9CF] text-[#C9A227] accent-[#C9A227]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#111111]">{shipment.tracking_id}</span>
                    <span className="text-xs text-[#4A4A4A]">{shipment.client_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 hidden sm:flex">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                  <span className="text-xs text-[#4A4A4A]">
                    {modeIcon(shipment.mode)}
                    {shipment.eta ? 'ETA ' + formatDate(shipment.eta) : ''}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#66615B]" />
              </div>
            );
          })}
      </div>

      {bulkSubmitting && <div className="p-4 text-center text-[#4A4A4A]">Applying to {selectedIds.size} shipments</div>}

      {selected && (
        <div className="rounded-2xl border border-[#DED9CF] bg-white p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#111111]">{selected.tracking_id}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor(selected.status)}`}>
                  {selected.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#4A4A4A]">Invoice {selected.invoice_number}  {selected.client_name}</p>
              <p className="mt-1 text-sm text-[#4A4A4A]">
                {modeIcon(selected.mode)} {selected.mode}  {selected.carrier || ''} 
                {selected.awb_bl || 'No AWB/BL'} 
                {selected.weight_kg} kg  {selected.cbm} CBM  {selected.packages} packages
              </p>
              {selected.eta && (
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  ETA {formatDate(selected.eta)}{selected.eta_reason ? '  ' + selected.eta_reason : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selected.client_phone && (
                <a href={`https://wa.me/${selected.client_phone.replace(/\s/g, '')}`} className="rounded-full border border-[#DED9CF] bg-white px-4 py-2 text-sm text-[#111111] transition hover:bg-[#FAFAF8]">
                  WhatsApp client
                </a>
              )}
              {selected.client_whatsapp && (
                <a href={`https://wa.me/${selected.client_whatsapp.replace(/\s/g, '')}`} className="rounded-full border border-[#DED9CF] bg-white px-4 py-2 text-sm text-[#111111] transition hover:bg-[#FAFAF8]">
                  WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-[#DED9CF] bg-white p-2 text-[#111111] transition hover:bg-[#FAFAF8]"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E5E2DA] bg-[#FAFAF8] p-4">
              <p className="text-xs text-[#66615B] mb-3">Items</p>
              <div className="space-y-2">
                {(selected.items || []).map((item) => (
                  <div key={item.item_id} className="flex justify-between text-sm">
                    <span className="text-[#4A4A4A]">{item.name}</span>
                    <span className="text-[#111111]">{item.quantity_shipped} / {item.quantity_total}</span>
                  </div>
                ))}
                {selected.items?.length === 0 && <p className="text-xs text-[#66615B]">No items</p>}
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E2DA] bg-[#FAFAF8] p-4">
              <p className="text-xs text-[#66615B] mb-3">Client contacts</p>
              <div className="space-y-2">
                {selected.client_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-[#4A4A4A]" />
                    <a href={`mailto:${selected.client_email}`} className="text-[#4A4A4A] underline underline-offset-4 hover:text-[#C9A227]">
                      {selected.client_email}
                    </a>
                  </div>
                )}
                {selected.client_notes && (
                  <div className="text-sm">
                    <span className="text-xs text-[#66615B] block mb-1">Internal note</span>
                    <span className="text-[#4A4A4A]">{selected.client_notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#E5E2DA] pt-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-[#111111]">Timeline</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs text-[#C9A227] underline underline-offset-4 hover:text-[#C9A227]/80"
              >
                Close shipment
              </button>
            </div>
            <div className="space-y-4">
              {(selected.updates || []).map((update) => (
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
                      <span className="text-xs text-[#4A4A4A]">{formatDate(update.created_at)}</span>
                    </div>
                    {update.location && (
                      <span className="flex items-center gap-1 text-xs text-[#4A4A4A]">
                        <MapPin className="h-3 w-3" /> {update.location}
                      </span>
                    )}
                    {update.note && <p className="mt-1 sm:mt-0 text-sm text-[#111111]">{update.note}</p>}
                    {update.eta_changed && (
                      <p className="mt-1 sm:mt-0 text-xs text-[#C9A227]">
                        ETA changed to {formatDate(update.eta_new)}{update.eta_reason ? '  ' + update.eta_reason : ''}
                      </p>
                    )}
                    {(update.photos?.length || 0) > 0 && (
                      <div className="mt-2 sm:mt-0 flex gap-2">
                        {update.photos.map((photo: any, i: number) => (
                          <img key={i} src={photo.url} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#DED9CF]" />
                        ))}
                      </div>
                    )}
                    {(update.documents?.length || 0) > 0 && (
                      <div className="mt-2 sm:mt-0 flex gap-2">
                        {update.documents.map((doc: any) => (
                          <a
                            key={doc.name}
                            href={doc.url}
                            target="_blank"
                            rel="noopener"
                            className="text-xs text-[#C9A227] underline underline-offset-4"
                          >
                            {doc.name}
                          </a>
                        ))}
                      </div>
                    )}
                    {update.internal_note && (
                      <p className="mt-1 sm:mt-0 text-xs text-[#66615B]">Internal: {update.internal_note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ShipmentUpdateForm
            passphrase={passphrase}
            shipmentId={selected.shipment_id}
            onSaved={loadShipments}
          />
        </div>
      )}

      {creating && (
        <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-6 md:p-8 shadow-sm">
          <h3 className="text-sm font-semibold text-[#111111] mb-4">New shipment</h3>
          <ShipmentEditor passphrase={passphrase} onCreated={onCreated} onCancel={closeEditor} />
        </div>
      )}
    </div>
  );
}

