'use client';

import { useState, useCallback } from 'react';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { sheetsRequest } from '../../lib/sheets';

const input =
  'block w-full rounded-2xl border border-[#DED9CF] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#C9A227]';
const lab = 'text-sm font-medium text-[#111111]';

export function LoginPage() {
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [navigated, setNavigated] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!passphrase.trim()) {
      setError('Please enter your passphrase.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Verify passphrase against Apps Script backend
      const data = await sheetsRequest(
        'shipments',
        {},
        { passphrase, actor: role }
      );
      if (data.ok) {
        // Redirect to staff portal after successful login
        window.location.href = '/shipments';
        setNavigated(true);
      } else {
        setError('Invalid passphrase.');
      }
    } catch (error: any) {
      setError(error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [passphrase, role]);

  const toggleRole = (r: 'admin' | 'staff') => {
    setRole(r);
    setError('');
    setPassphrase('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-6 sm:py-12">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-[#C9A227]" />
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-[18px] font-bold tracking-[-0.02em] text-[#111111]">
              BuySmart
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: '#C9A227' }}>
              Procurement Limited
            </div>
          </div>
        </div>

        <h2 className="text-[clamp(1.5rem,5vw,2rem)] font-extrabold text-[#111111] tracking-[-0.02em] mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
          Staff Portal
        </h2>
        <p className="mb-8 text-[#4A4A4A] text-sm">Please sign in to your account</p>

        {/* Role tabs */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <button
            type="button"
            onClick={() => toggleRole('staff')}
            className={`flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition ${
              role === 'staff'
                ? 'border-[#C9A227] bg-[#C9A227]/10 text-[#C9A227]'
                : 'border-[#DED9CF] bg-white text-[#4A4A4A] hover:border-[#C9A227]'
            }`}
          >
            <Lock className="h-3.5 w-3.5" /> STAFF
          </button>
          <button
            type="button"
            onClick={() => toggleRole('admin')}
            className={`flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition ${
              role === 'admin'
                ? 'border-[#C9A227] bg-[#C9A227]/10 text-[#C9A227]'
                : 'border-[#DED9CF] bg-white text-[#4A4A4A] hover:border-[#C9A227]'
            }`}
          >
            <Shield className="h-3.5 w-3.5" /> ADMIN
          </button>
        </div>

        {/* Login form */}
        <div className="rounded-2xl border border-[#ECE8DF] bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={lab}>Passphrase</label>
              <input
                type="password"
                autoComplete="current-password"
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setError('');
                }}
                className={input}
                placeholder="Enter staff passphrase"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-[#B91C1C]">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading || navigated}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#C9A227' }}
            >
              {loading ? 'Signing in...' : 'LOG IN'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#66615B]">
          Admin passphrase unlocks profit reports, settings, and all staff features.{' '}
          <br />
          Staff passphrase unlocks shipment creation and tracking updates.
        </p>

        <p className="mt-4 text-center text-sm text-[#4A4A4A]">
          Need access? Contact your BuySmart administrator for passphrases.
        </p>
      </div>
    </div>
  );
}
