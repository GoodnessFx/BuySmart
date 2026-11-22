/**
 * BuySmart data layer for the Google Apps Script backend.
 *
 * All mutating calls need a passphrase (Staff or Admin) passed in by the caller.
 * Passphrases are never stored here — they live in session memory only and are
 * verified by the Apps Script, which stores them in Script Properties.
 *
 * Read/write of the web app URL and feature flags goes to localStorage so a small
 * team can configure the app without a developer.
 */

const SETTINGS_KEY = 'buysmart_settings';
const QUEUE_KEY = 'buysmart_offline_queue';

export type FeatureFlags = {
  shipments: boolean;
  quotes: boolean;
  payments: boolean;
  inspections: boolean;
  reports: boolean;
  offline: boolean;
};

export type AppSettings = {
  webAppUrl?: string;
  features: FeatureFlags;
  defaultTerms?: string;
};

const DEFAULT_SETTINGS: AppSettings = {
  features: {
    shipments: true,
    quotes: true,
    payments: true,
    inspections: true,
    reports: true,
    offline: true,
  },
};

export function loadSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      features: { ...DEFAULT_SETTINGS.features, ...(parsed.features || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = loadSettings();
  const next: AppSettings = {
    ...current,
    ...partial,
    features: partial.features ? { ...current.features, ...partial.features } : current.features,
  };
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function webAppUrl(): string | undefined {
  return loadSettings().webAppUrl;
}

export type SheetsResponse = { ok?: boolean; error?: string; [key: string]: unknown };

export async function sheetsRequest<T = SheetsResponse>(
  action: string,
  payload: Record<string, unknown>,
  options: { passphrase?: string; actor?: string } = {}
): Promise<T> {
  const url = webAppUrl();
  if (!url) {
    throw new Error('Google Apps Script web app URL not set in Settings.');
  }
  const body = {
    action,
    passphrase: options.passphrase ?? getSessionPassphrase(),
    actor: options.actor || 'staff',
    ...payload,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Server error (' + response.status + ')');
  }
  const data = (await response.json()) as SheetsResponse;
  if (data.ok === false) {
    throw new Error(data.error || 'Request failed.');
  }
  return data as T;
}

export async function trackingFetch(trackingId: string) {
  const url = webAppUrl();
  if (!url) {
    throw new Error('Google Apps Script web app URL not set in Settings.');
  }
  const response = await fetch(
    url + '?action=tracking&id=' + encodeURIComponent(trackingId)
  );
  if (!response.ok) {
    throw new Error('Server error (' + response.status + ')');
  }
  return response.json();
}

export type QueuedItem = {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export function queueItem(
  action: string,
  payload: Record<string, unknown>
): QueuedItem {
  const item: QueuedItem = {
    id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 8),
    action,
    payload,
    createdAt: new Date().toISOString(),
  };
  const queue = loadQueue();
  queue.push(item);
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return item;
}

export function loadQueue(): QueuedItem[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedItem[]) : [];
  } catch {
    return [];
  }
}

export function removeQueuedItem(id: string): void {
  const queue = loadQueue().filter((item) => item.id !== id);
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}


/**
 * Staff session passphrase. Kept in memory only for the lifetime of the tab
 * session — never written to localStorage. Every mutating request sends it to
 * the Apps Script, which verifies it against Script Properties.
 */

let sessionPassphrase: string | null = null;

export function setSessionPassphrase(passphrase: string | null): void {
  sessionPassphrase = passphrase;
}

export function getSessionPassphrase(): string | null {
  return sessionPassphrase;
}

export function clearSessionPassphrase(): void {
  sessionPassphrase = null;
}
