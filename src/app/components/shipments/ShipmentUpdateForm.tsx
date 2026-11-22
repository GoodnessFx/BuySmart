'use client';

import { useState, useCallback } from 'react';
import { Camera, Image, FileText, Clock, Trash2, Send, AlertCircle } from 'lucide-react';
import { sheetsRequest } from '../../lib/sheets';
import type { ShipmentStatus } from './types';

const input =
  'block w-full rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]';
const lab = 'text-sm font-medium text-[#111111]';

type LocalFile = { file: File; preview: string; data: string };

const DEFAULT_STATUSES = [
  'Order approved', 'Supplier paid', 'At China warehouse', 'Inspected', 'Packed',
  'Left origin', 'In transit', 'Arrived in Lagos', 'Customs clearing',
  'Customs cleared', 'Out for delivery', 'Delivered',
];

const EXCEPTION_STATUSES = ['Delayed', 'Held at customs', 'Issue reported'];

function compressFile(file: File, maxWidth = 1600, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(event.target?.result as string); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = event.target?.result as string;
    };
  });
}

function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

export type ShipmentUpdateFormProps = {
  passphrase: string;
  shipmentId: string;
  onSaved?: () => void;
  onCancel?: () => void;
};

export function ShipmentUpdateForm({ passphrase, shipmentId, onSaved, onCancel }: ShipmentUpdateFormProps) {
  const [status, setStatus] = useState<ShipmentStatus>('Order approved');
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [clientVisible, setClientVisible] = useState(true);
  const [updateEta, setUpdateEta] = useState(false);
  const [etaNew, setEtaNew] = useState('');
  const [etaReason, setEtaReason] = useState('');
  const [photos, setPhotos] = useState<LocalFile[]>([]);
  const [documents, setDocuments] = useState<LocalFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isException = EXCEPTION_STATUSES.includes(status);

  const nowString = useCallback(() => new Date().toISOString().slice(0, 16), []);

  const addPhotos = async (fileList: FileList | null) => {
    if (!fileList) return;
    const next = [...photos];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;
      const preview = await compressFile(file);
      next.push({ file, preview, data: dataUrlToBase64(preview) });
    }
    setPhotos(next);
  };

  const addDocuments = async (fileList: FileList | null) => {
    if (!fileList) return;
    const next = [...documents];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        next.push({ file, preview: reader.result as string, data: dataUrlToBase64(reader.result as string) });
        setDocuments(next);
      };
    }
  };

  const removePhoto = (index: number) => setPhotos(photos.filter((_, i) => i !== index));
  const removeDocument = (index: number) => setDocuments(documents.filter((_, i) => i !== index));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isException && !note.trim()) {
      alert('A reason is required for ' + status + '.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        shipment_id: shipmentId,
        status,
        location,
        note,
        internal_note: internalNote,
        is_client_visible: clientVisible,
        occurred_at: occurredAt,
        photos: photos.map((p) => ({
          name: p.file.name, mime_type: p.file.type, data: p.data,
        })),
        documents: documents.map((p) => ({
          name: p.file.name, mime_type: p.file.type, data: p.data,
        })),
        ...(updateEta ? { eta: etaNew, eta_reason: etaReason } : {}),
      };
      await sheetsRequest('addUpdate', payload, { passphrase });
      onSaved?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      alert(error instanceof Error ? error.message : 'Could not add update.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={lab + ' block mb-1'}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
            className={input}
          >
            {DEFAULT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            {EXCEPTION_STATUSES.map((s) => (
              <option key={s} value={s}>{s} <span className="text-xs font-normal text-[#C9A227]">(reason required)</span></option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={lab + ' block mb-1'}>Date and time</label>
          <span className="mt-0.5 text-xs text-[#66615B]">Defaults to now. Can be set to an earlier time.</span>
          <input
            type="datetime-local" value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className={input}
          />
          <button
            type="button"
            onClick={() => setOccurredAt(nowString())}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DED9CF] bg-white px-3 py-1.5 text-xs text-[#111111] transition hover:bg-[#FAFAF8]"
          >
            <Clock className="h-3 w-3" /> Now
          </button>
        </div>
        <div className="space-y-1.5">
          <label className={lab + ' block mb-1'}>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={input}
            placeholder="e.g. China warehouse, Apapa port, Lagos hub"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={lab + ' block mb-1'}>Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className={input}
          placeholder="Goods left origin port today..."
        />
        <span className="mt-0.5 text-xs text-[#66615B]">What the client will see if 'Client can see this' is on.</span>
      </div>

      {isException && (
        <div className="rounded-xl border border-[#F6E7BC] bg-[#FCFBF4] p-4">
          <AlertCircle className="mr-2 h-5 w-5 text-[#C9A227]" />
          <span className="text-sm text-[#111111]">
            {status} is an exception status  the note above will show the client a calm banner on their tracking page.
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className={lab + ' block mb-1'}>Internal note (private  client never sees this)</label>
        <textarea
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          rows={2}
          className={input}
          placeholder="e.g. Waiting on BL from carrier..."
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={clientVisible}
          onChange={(e) => setClientVisible(e.target.checked)}
          className="h-4 w-4 rounded border-[#DED9CF] text-[#C9A227] accent-[#C9A227]"
        />
        <span className={lab}>Client can see this update on their tracking page</span>
      </label>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-sm text-[#4A4A4A] transition hover:border-[#C9A227]">
            <Camera className="h-5 w-5 shrink-0" />
            <span>Take photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => addPhotos(e.target.files)}
            />
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-sm text-[#4A4A4A] transition hover:border-[#C9A227]">
            <Image className="h-5 w-5 shrink-0" />
            <span>Choose photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addPhotos(e.target.files)}
            />
          </label>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5 shrink-0">
              <img src={photo.preview} alt="" className="w-16 h-16 rounded-xl object-cover border border-[#DED9CF]" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="rounded-full border border-[#DED9CF] bg-white p-1 text-[#111111] transition hover:bg-[#FAFAF8]"
                title="Remove"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-sm text-[#4A4A4A] transition hover:border-[#C9A227]">
          <FileText className="h-5 w-5 shrink-0" />
          <span>Add document (packing list, BL, customs papers)</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) => addDocuments(e.target.files)}
          />
        </label>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {documents.map((doc, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-16 h-16 rounded-xl border border-[#DED9CF] flex items-center justify-center text-[10px] text-[#4A4A4A]">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-[10px] leading-none truncate w-16 text-[#4A4A4A]">{doc.file.name}</span>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="rounded-full border border-[#DED9CF] bg-white p-1 text-[#111111] transition hover:bg-[#FAFAF8]"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={updateEta}
            onChange={(e) => setUpdateEta(e.target.checked)}
            className="h-4 w-4 rounded border-[#DED9CF] text-[#C9A227] accent-[#C9A227]"
          />
          <span className={lab}>Update the shipment ETA</span>
        </label>
        {updateEta && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={lab + ' block mb-1'}>New ETA</label>
              <input
                type="datetime-local" value={etaNew}
                onChange={(e) => setEtaNew(e.target.value)}
                className={input}
              />
            </div>
            <div className="space-y-1.5">
              <label className={lab + ' block mb-1'}>Reason for change (shown to client)</label>
              <input
                value={etaReason}
                onChange={(e) => setEtaReason(e.target.value)}
                className={input}
                placeholder="e.g. Vessel delayed by weather"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DED9CF] bg-white px-6 py-4 text-sm font-semibold text-[#111111] transition hover:bg-[#FAFAF8]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#C9A227' }}
        >
          <Send className="h-4 w-4" /> Add update
        </button>
      </div>
    </form>
  );
}
