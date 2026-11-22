'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { loadQueue } from '../../lib/sheets';

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' && navigator.onLine);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    const update = () => {
      setOnline(typeof navigator !== 'undefined' && navigator.onLine);
      setQueued(loadQueue().length);
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online && queued === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center gap-3">
      <div className="flex flex-col">
        {!online ? (
          <span className="text-xs font-semibold text-[#111111]">You&rsquo;re offline</span>
        ) : (
          <span className="text-xs font-semibold text-[#111111]">Back online — syncing {queued} queued update{queued === 1 ? '' : 's'}…</span>
        )}
        <span className="text-xs text-[#66615B]">
          Changes made while offline save locally and sync when the connection returns.
        </span>
      </div>
      <button
        type="button"
        className="rounded-full border border-[#DED9CF] bg-white px-3 py-1.5 text-xs text-[#111111] transition hover:bg-[#FAFAF8]"
      >
        <RefreshCcw className="h-3 w-3 mr-1.5" /> Sync now
      </button>
    </div>
  );
}
