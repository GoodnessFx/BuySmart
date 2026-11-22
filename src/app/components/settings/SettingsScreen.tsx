'use client';

import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { loadSettings, saveSettings, webAppUrl, sheetsRequest } from '../../lib/sheets';

const input =
  'block w-full rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]';
const lab = 'text-sm font-medium text-[#111111]';

type FeatureKey = keyof NonNullable<ReturnType<typeof loadSettings>['features']>;

const FEATURES: { key: FeatureKey; label: string; description: string }[] = [
  {
    key: 'shipments',
    label: 'Shipment tracker',
    description: 'Staff shipment editor and public client tracking pages.',
  },
  {
    key: 'quotes',
    label: 'Quote requests',
    description: 'Guided client quote form, staff reply thread, and quote-to-invoice conversion.',
  },
  {
    key: 'payments',
    label: 'Payments and receipts',
    description: 'Payment proof approval, receipts, and milestone schedules.',
  },
  {
    key: 'inspections',
    label: 'Pre-shipment inspection',
    description: 'Inspection reports with client approve / request changes decisions.',
  },
  {
    key: 'reports',
    label: 'Reports and statements',
    description: 'Admin revenue, ageing, delivery, and client statement screens.',
  },
  {
    key: 'offline',
    label: 'Offline queue',
    description: 'Staff updates made while offline sync when the connection returns.',
  },
];

export function SettingsScreen() {
  const settings = loadSettings();
  const [webApp, setWebApp] = useState(settings.webAppUrl || '');
  const [features, setFeatures] = useState({ ...settings.features });
  const [defaultTerms, setDefaultTerms] = useState(settings.defaultTerms || '');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  const toggleFeature = (key: FeatureKey) => {
    setFeatures({ ...features, [key]: !features[key] });
  };

  const save = async () => {
    setSaving(true);
    try {
      saveSettings({
        webAppUrl: webApp.trim() || undefined,
        features,
        defaultTerms,
      });
      setTestMessage('Settings saved.');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setTestMessage('Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!webApp.trim()) {
      setTestMessage('Please paste the web app URL first.');
      return;
    }
    setTesting(true);
    setTestMessage('');
    try {
      const response = await fetch(webApp.trim() + '?action=shipments', { method: 'GET' });
      const text = await response.text();
      JSON.parse(text);
      setTestMessage('Connected to the Apps Script web app.');
    } catch (error) {
      setTestMessage('Could not reach the web app. Check the URL and deployment.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <h2 className="text-[clamp(1.5rem,5vw,2rem)] font-extrabold text-[#111111] tracking-[-0.02em]" style={{ fontFamily: "'Sora', sans-serif" }}>
        Settings
      </h2>

      <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-6 sm:p-8 space-y-6">
        <p className={lab}>BuySmart backend (Google Apps Script)</p>
        <label className={lab + ' block mb-2'}>Web app URL</label>
        <div className="flex gap-2">
          <input
            value={webApp}
            onChange={(e) => setWebApp(e.target.value)}
            className={"flex-1 " + input}
            placeholder="https://script.google.com/macros/s/.../exec"
          />
          <button
            type="button"
            onClick={testConnection}
            disabled={testing}
            className="rounded-full border border-[#DED9CF] bg-white px-5 py-3 text-sm text-[#4A4A4A] transition disabled:opacity-60 hover:bg-[#FAFAF8]"
          >
            {testing ? 'Testing...' : 'Test'}
          </button>
        </div>
        {testMessage && (
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="h-3 w-3 text-[#C9A227]" />
            <span className="text-[#4A4A4A]">{testMessage}</span>
          </div>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#C9A227' }}
        >
          <Save className="h-4 w-4" /> Save settings
        </button>
      </div>

      <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={lab}>Features</p>
            <p className="text-xs text-[#66615B]">Switch any new feature off if you need to.</p>
          </div>
        </div>
        <div className="space-y-3">
          {FEATURES.map((feature) => (
            <div key={feature.key} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E5E2DA] bg-[#FAFAF8]">
              <div>
                <p className="text-sm font-semibold text-[#111111]">{feature.label}</p>
                <p className="text-xs text-[#4A4A4A]">{feature.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature(feature.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors p-0.5 ${
                  features[feature.key] ? 'border-[#C9A227]' : 'border-[#DED9CF]'
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                    features[feature.key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#E5E2DA] bg-white p-6 sm:p-8 space-y-3">
        <p className={lab}>Default invoice terms</p>
        <p className="text-xs text-[#66615B]">Shown on invoices unless edited per document.</p>
        <textarea
          value={defaultTerms}
          onChange={(e) => setDefaultTerms(e.target.value)}
          rows={6}
          className={input}
          placeholder="Payment confirms acceptance of the invoice; goods were procured and shipped based on the client's approved order; ..."
        />
      </div>

      <div className="rounded-xl border border-[#E5E2DA] bg-[#FAFAF8] p-5">
        <p className="text-xs text-[#66615B] uppercase tracking-wider mb-3">Important</p>
        <p className="text-sm text-[#4A4A4A] leading-relaxed">
          Staff and Admin passphrases are entered in the Staff portal and checked by the
          Apps Script backend. They are never saved in this app or in the repo. Prices,
          supplier costs, profit and internal notes never leave the admin side.
        </p>
      </div>
    </div>
  );
}
