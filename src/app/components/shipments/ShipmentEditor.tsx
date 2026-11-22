'use client';

import { useState } from 'react';
import { Plus, Trash2, Plane, Ship, Save } from 'lucide-react';
import { sheetsRequest, setSessionPassphrase } from '../../lib/sheets';
import type { ShipmentItem, ShippingMode } from './types';

const input =
  'block w-full rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]';
const lab = 'text-sm font-medium text-[#111111]';

export type ShipmentEditorProps = {
  passphrase: string;
  onCreated?: (trackingId: string) => void;
  onCancel?: () => void;
};

function Field({ labelText, children, note, required }: { labelText: string; children: React.ReactNode; note?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className={lab + ' block mb-1'}>
        {labelText}{required ? ' <span className="text-[#C9A227]">*</span>' : ''}
      </label>
      {children}
      {note && <span className="mt-0.5 text-xs text-[#66615B]">{note}</span>}
    </div>
  );
}

export function ShipmentEditor({ passphrase, onCreated, onCancel }: ShipmentEditorProps) {
  const [form, setForm] = useState({
    invoiceNumber: '', clientName: '', clientPhone: '', clientWhatsApp: '', clientEmail: '',
    clientNotes: '', mode: 'air' as ShippingMode, carrier: '', awbBl: '', weightKg: '',
    cbm: '', packages: '', eta: '', status: 'Order approved',
  });
  const [items, setItems] = useState<ShipmentItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const etaValue = form.eta ? new Date(form.eta).toISOString().slice(0, 16) : '';

  const addItem = () => {
    setItems([...items, { name: '', quantity_total: 1, quantity_shipped: 0, status: 'Pending' }]);
  };
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      setSessionPassphrase(passphrase);
      const data = await sheetsRequest(
        'createShipment',
        {
          invoice_number: form.invoiceNumber, client_name: form.clientName,
          client_phone: form.clientPhone, client_whatsapp: form.clientWhatsApp,
          client_email: form.clientEmail, client_notes: form.clientNotes,
          mode: form.mode, carrier: form.carrier, awb_bl: form.awbBl,
          weight_kg: Number(form.weightKg) || 0, cbm: Number(form.cbm) || 0,
          packages: Number(form.packages) || 0, eta: form.eta, status: form.status,
          items: items.map((item) => ({
            name: item.name, quantity_total: item.quantity_total, quantity_shipped: item.quantity_shipped,
          })),
        },
        { passphrase }
      );
      if (data.ok && data.tracking_id) {
        onCreated?.(data.tracking_id as string);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      alert(error instanceof Error ? error.message : 'Could not create shipment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field labelText="Invoice number" required>
          <input
            name="invoiceNumber" value={form.invoiceNumber}
            onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
            className={input} placeholder="e.g. BSP-2026-003"
          />
        </Field>
        <Field labelText="Mode">
          <select
            name="mode" value={form.mode}
            onChange={(e) => setForm({ ...form, mode: e.target.value as ShippingMode })}
            className={input}
          >
            <option value="air"><Plane className="mr-2 h-4 w-4 shrink-0" /> Air freight</option>
            <option value="sea"><Ship className="mr-2 h-4 w-4 shrink-0" /> Sea freight</option>
          </select>
        </Field>
        <Field labelText="Client name" required>
          <input
            name="clientName" value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            className={input} placeholder="Client name"
          />
        </Field>
        <Field labelText="Client phone">
          <input
            name="clientPhone" value={form.clientPhone}
            onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
            className={input} placeholder="0810 013 0714"
          />
        </Field>
        <Field labelText="WhatsApp number">
          <input
            name="clientWhatsApp" value={form.clientWhatsApp}
            onChange={(e) => setForm({ ...form, clientWhatsApp: e.target.value })}
            className={input} placeholder="0810 013 0714"
          />
        </Field>
        <Field labelText="Client email">
          <input
            name="clientEmail" type="email" value={form.clientEmail}
            onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
            className={input} placeholder="client@example.com"
          />
        </Field>
        <Field labelText="Carrier">
          <input
            name="carrier" value={form.carrier}
            onChange={(e) => setForm({ ...form, carrier: e.target.value })}
            className={input} placeholder="Airline / shipping line"
          />
        </Field>
        <Field labelText="AWB / Bill of lading">
          <input
            name="awbBl" value={form.awbBl}
            onChange={(e) => setForm({ ...form, awbBl: e.target.value })}
            className={input} placeholder="AWB or BL number"
          />
        </Field>
        <Field labelText="Weight (kg)">
          <input
            name="weightKg" type="number" value={form.weightKg}
            onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
            className={input} placeholder="214.5"
          />
        </Field>
        <Field labelText="CBM">
          <input
            name="cbm" type="number" value={form.cbm}
            onChange={(e) => setForm({ ...form, cbm: e.target.value })}
            className={input} placeholder="e.g. 1.8"
          />
        </Field>
        <Field labelText="Packages">
          <input
            name="packages" type="number" value={form.packages}
            onChange={(e) => setForm({ ...form, packages: e.target.value })}
            className={input} placeholder="1"
          />
        </Field>
        <Field labelText="ETA (date and time)" note="Can be changed later with a reason on every update.">
          <input
            name="eta" type="datetime-local" value={etaValue}
            onChange={(e) => setForm({ ...form, eta: e.target.value })}
            className={input}
          />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={lab}>Items in this shipment</span>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 rounded-full border border-[#DED9CF] bg-white px-3.5 py-2 text-sm text-[#111111] transition hover:bg-[#FAFAF8]"
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-4 items-end">
              <input
                value={item.name}
                onChange={(e) =>
                  setItems(
                    items.map((it, i) =>
                      i === index ? { ...it, name: e.target.value } : it
                    )
                  )
                }
                className={input} placeholder="Item description"
              />
              <input
                type="number" value={item.quantity_total}
                onChange={(e) =>
                  setItems(
                    items.map((it, i) =>
                      i === index ? { ...it, quantity_total: Number(e.target.value) || 0 } : it
                    )
                  )
                }
                className={input} placeholder="Total qty"
              />
              <input
                type="number" value={item.quantity_shipped}
                onChange={(e) =>
                  setItems(
                    items.map((it, i) =>
                      i === index ? { ...it, quantity_shipped: Number(e.target.value) || 0 } : it
                    )
                  )
                }
                className={input} placeholder="Shipped qty"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-full border border-[#DED9CF] bg-white p-2 text-[#111111] transition hover:bg-[#FAFAF8]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Field labelText="Internal note (client never sees this)" note="e.g. Pay supplier on delivery; fragile items on top">
        <textarea
          name="clientNotes" value={form.clientNotes}
          onChange={(e) => setForm({ ...form, clientNotes: e.target.value })}
          rows={2} className={input}
        />
      </Field>

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
          <Save className="h-4 w-4" /> Create shipment
        </button>
      </div>
    </form>
  );
}
