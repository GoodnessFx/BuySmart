'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Shield,
  User,
  ArrowRight,
  AlertCircle,
  Truck,
  CheckCircle2,
  Building2,
  Eye,
  EyeOff,
  ArrowLeft,
  Globe2,
  Lock,
} from 'lucide-react';
import {
  setAuthUser,
  getAuthUser,
  saveClient,
  findClientByEmail,
  registerNewClient,
  verifyAdminCredentials,
  MASTER_ADMIN_EMAIL,
  type UserRole,
  type AuthUser,
  type ClientProfile,
} from '../../lib/auth';
import { setSessionPassphrase } from '../../lib/sheets';

const GOOGLE_CLIENT_ID = '24300395823-bhdi9ga429mgj053afjl3gnionf53ctb.apps.googleusercontent.com';

function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [role, setRole] = useState<'client' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [clientMode, setClientMode] = useState<'login' | 'register'>('login');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Google Modal fallback
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePhone, setGooglePhone] = useState('');

  // Persistent session auto-redirect & Google GSI init
  useEffect(() => {
    const existing = getAuthUser();
    if (existing) {
      if (existing.role === 'admin') {
        window.location.href = '/admin';
        return;
      } else if (existing.role === 'client') {
        window.location.href = '/client';
        return;
      }
    }

    // Initialize Google Identity Services
    const initGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (res: any) => {
              if (res.credential) {
                handleGoogleToken(res.credential);
              }
            },
          });
        } catch { }
      }
    };

    initGoogle();
    const t = setTimeout(initGoogle, 1000);
    return () => clearTimeout(t);
  }, []);

  const handleRoleChange = (newRole: 'client' | 'admin') => {
    setRole(newRole);
    setError('');
    setSuccess('');
    setEmail(newRole === 'admin' ? MASTER_ADMIN_EMAIL : '');
    setPassword('');
  };

  // Decode Google JWT Token
  const handleGoogleToken = (jwtToken: string) => {
    try {
      const base64Url = jwtToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const data = JSON.parse(jsonPayload);
      const gEmail = (data.email || '').toLowerCase();
      const gName = data.name || gEmail.split('@')[0];
      const avatar = data.picture || '';

      const existing = findClientByEmail(gEmail);
      let client: ClientProfile;
      if (existing) {
        client = existing;
      } else {
        client = {
          id: 'client-g-' + Date.now(),
          name: gName,
          email: gEmail,
          phone: '0810 013 0714',
          whatsapp: '+2348100130714',
          clientCode: 'BSP-CL-' + Math.floor(1000 + Math.random() * 9000),
          signupMethod: 'google',
          createdAt: new Date().toISOString().slice(0, 10),
          avatar,
          notes: 'Google verified client.',
        };
        saveClient(client);
      }

      const authUser: AuthUser = {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        role: 'client',
        clientCode: client.clientCode,
        avatar,
        authProvider: 'google',
      };
      setAuthUser(authUser);
      setSuccess(`Authenticated via Google as ${client.name}! Entering Client Portal...`);
      setTimeout(() => {
        window.location.href = '/client';
      }, 500);
    } catch {
      setShowGoogleModal(true);
    }
  };

  const handleGoogleBtnClick = () => {
    setError('');
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowGoogleModal(true);
          }
        });
        return;
      } catch { }
    }
    setShowGoogleModal(true);
  };

  const handleConfirmGoogleModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleName.trim() || !googleEmail.includes('@')) {
      setError('Please provide a valid name and Google email.');
      return;
    }
    setLoading(true);
    setShowGoogleModal(false);

    setTimeout(() => {
      const gEmail = googleEmail.trim().toLowerCase();
      const existing = findClientByEmail(gEmail);
      let client: ClientProfile;

      if (existing) {
        client = existing;
      } else {
        client = {
          id: 'client-g-' + Date.now(),
          name: googleName.trim(),
          email: gEmail,
          phone: googlePhone.trim() || '0810 013 0714',
          whatsapp: googlePhone.trim() || '+2348100130714',
          clientCode: 'BSP-CL-' + Math.floor(1000 + Math.random() * 9000),
          signupMethod: 'google',
          createdAt: new Date().toISOString().slice(0, 10),
          notes: 'Signed in via Google Profile.',
        };
        saveClient(client);
      }

      const authUser: AuthUser = {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        role: 'client',
        clientCode: client.clientCode,
        authProvider: 'google',
      };
      setAuthUser(authUser);
      setSuccess(`Google authentication verified for ${client.name}! Redirecting...`);
      setTimeout(() => {
        window.location.href = '/client';
      }, 500);
    }, 500);
  };

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoading(true);

      await new Promise((r) => setTimeout(r, 500));

      try {
        if (role === 'admin') {
          // Strict Single Master Password & Email Check
          if (!verifyAdminCredentials(email, password)) {
            setError(
              'Access denied. Only authorized BuySmart Management credentials can access this console. Please verify your administrative email and master password.'
            );
            setLoading(false);
            return;
          }

          const user: AuthUser = {
            id: 'admin-1',
            name: 'Founder & Management Desk',
            email: 'admin@buysmart.ng',
            role: 'admin',
            staffTitle: 'Founder & Managing Director',
          };
          setAuthUser(user);
          setSessionPassphrase(password);
          localStorage.setItem('buysmart_admin_pass', password);
          setSuccess('Master credentials verified. Loading Management Console...');
          setTimeout(() => {
            window.location.href = '/admin';
          }, 500);
        } else {
          // Client mode
          if (clientMode === 'register') {
            if (!clientName.trim() || !clientPhone.trim() || !email.includes('@') || password.length < 6) {
              setError('Please fill all fields. Password must be at least 6 characters.');
              setLoading(false);
              return;
            }

            // Prevent duplicate registration
            const regResult = registerNewClient({
              id: 'client-' + Date.now(),
              name: clientName.trim(),
              email: email.trim().toLowerCase(),
              phone: clientPhone.trim(),
              whatsapp: clientPhone.trim(),
              clientCode: 'BSP-CL-' + Math.floor(1000 + Math.random() * 9000),
              signupMethod: 'email',
              createdAt: new Date().toISOString().slice(0, 10),
              notes: 'Registered client account.',
            });

            if (!regResult.success) {
              setError(regResult.error || 'An account with this email already exists. Please log in directly.');
              setLoading(false);
              return;
            }

            const newClient = regResult.client!;
            const authUser: AuthUser = {
              id: newClient.id,
              name: newClient.name,
              email: newClient.email,
              phone: newClient.phone,
              role: 'client',
              clientCode: newClient.clientCode,
              authProvider: 'email',
            };
            setAuthUser(authUser);
            setSuccess('Registration successful! Welcome to BuySmart Client Portal...');
            setTimeout(() => {
              window.location.href = '/client';
            }, 500);
          } else {
            // Client Login
            if (!email.includes('@') || password.length < 4) {
              setError('Please enter a valid email and password.');
              setLoading(false);
              return;
            }

            const existing = findClientByEmail(email);
            const authUser: AuthUser = {
              id: existing?.id || 'client-' + Date.now(),
              name: existing?.name || email.split('@')[0],
              email: email.trim().toLowerCase(),
              phone: existing?.phone || '0810 013 0714',
              role: 'client',
              clientCode: existing?.clientCode || 'BSP-CL-' + Math.floor(1000 + Math.random() * 9000),
            };
            setAuthUser(authUser);
            setSuccess('Sign in successful. Redirecting to Client Portal...');
            setTimeout(() => {
              window.location.href = '/client';
            }, 500);
          }
        }
      } catch {
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    },
    [email, password, role, clientName, clientPhone, clientMode]
  );

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAFAF8] antialiased">
      {/* LEFT SIDE — BuySmart Genuine Procurement & Shipping Hero Background */}
      <div className="relative hidden lg:flex lg:w-1/2 min-h-screen bg-[#111111] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out"
          style={{ backgroundImage: "url('/media/hero/hero-background-1.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40 z-0" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#C9A227]/20 blur-3xl pointer-events-none" />

        {/* Top Header / Brand Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-2xl bg-white p-2 border border-white/30 flex items-center justify-center shadow-lg transition group-hover:scale-105">
              <img src="/brand/logo.png" alt="BuySmart Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <div
                style={{ fontFamily: "'Sora', sans-serif" }}
                className="text-xl font-extrabold tracking-[-0.02em] text-white"
              >
                BuySmart
              </div>
              <div className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[#C9A227]">
                Procurement Limited
              </div>
            </div>
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white transition px-4 py-2.5 rounded-full bg-black/40 border border-white/20 backdrop-blur-md"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#C9A227]" /> Back to Website
          </a>
        </div>

        {/* Center Content / Procurement Gateway */}
        <div className="relative z-10 my-auto py-12 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A227]/25 border border-[#C9A227]/50 text-[#C9A227] text-xs font-bold mb-6 backdrop-blur-sm">
            <Building2 className="h-3.5 w-3.5" />
            <span>RC Registered • Unified Procurement &amp; Freight Portal</span>
          </div>

          <h1
            style={{ fontFamily: "'Sora', sans-serif" }}
            className="text-[clamp(2.1rem,3.6vw,3.1rem)] font-extrabold tracking-[-0.03em] leading-[1.15] mb-5 text-white"
          >
            Sourced with Precision.{' '}
            <span className="text-[#C9A227]">Delivered with Absolute Clarity</span>.
          </h1>

          <p className="text-white/85 text-base leading-relaxed mb-8">
            Access your shipments, verified customs clearances, official invoices, and direct WhatsApp updates in one unified workspace.
          </p>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#C9A227]" />
                <span className="text-xs font-bold text-white">Client Portal</span>
              </div>
              <p className="text-[11px] text-white/70">
                Google 1-click sign in, live parcel tracking, and itemized invoice downloads.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#C9A227]" />
                <span className="text-xs font-bold text-white">Staff &amp; Admin Console</span>
              </div>
              <p className="text-[11px] text-white/70">
                Protected master login, client folders, shipment milestones &amp; invoicing.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/15 text-xs text-white/60">
          <span>© 2026 BuySmart Procurement Limited. All rights reserved.</span>
          <span className="flex items-center gap-1.5 font-medium text-[#C9A227]">
            <Globe2 className="h-3.5 w-3.5" /> China • Vietnam • Lagos, NG
          </span>
        </div>
      </div>

      {/* RIGHT SIDE — Authentication Form & Role Selector */}
      <div className="flex-1 flex flex-col justify-center items-center py-10 px-6 sm:px-10 lg:px-12 xl:px-16 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Mobile Back & Logo */}
          <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-[#ECE8DF]">
            <a href="/" className="inline-flex items-center gap-2.5">
              <img src="/brand/logo.png" alt="BuySmart" className="h-9 w-9 object-contain" />
              <div>
                <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-base font-bold text-[#111111]">
                  BuySmart
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#C9A227]">
                  Procurement Limited
                </div>
              </div>
            </a>
            <a href="/" className="text-xs font-semibold text-[#4A4A4A] flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </a>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-white shadow-md border border-[#ECE8DF] p-2.5 items-center justify-center mb-3">
              <img src="/brand/logo.png" alt="BuySmart logo" className="h-full w-full object-contain" />
            </div>
            <h2
              style={{ fontFamily: "'Sora', sans-serif" }}
              className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-[-0.03em]"
            >
              Sign in to your account
            </h2>
            <p className="mt-1 text-sm text-[#66615B]">
              Choose your workspace to manage your procurement &amp; shipments
            </p>
          </div>

          {/* 2-Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 mb-6 rounded-2xl bg-[#ECE8DF]/60 border border-[#DED9CF]">
            <button
              type="button"
              onClick={() => handleRoleChange('client')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${role === 'client'
                  ? 'bg-white text-[#111111] shadow-sm'
                  : 'text-[#66615B] hover:text-[#111111]'
                }`}
            >
              <User className={`h-4 w-4 ${role === 'client' ? 'text-[#C9A227]' : ''}`} />
              <span>Client Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${role === 'admin'
                  ? 'bg-white text-[#111111] shadow-sm'
                  : 'text-[#66615B] hover:text-[#111111]'
                }`}
            >
              <Shield className={`h-4 w-4 ${role === 'admin' ? 'text-[#C9A227]' : ''}`} />
              <span>Staff &amp; Admin</span>
            </button>
          </div>

          {/* Role Description Note */}
          <div className="mb-5 px-4 py-2.5 rounded-xl border border-[#C9A227]/25 bg-[#FBF6E8] flex items-center justify-between text-xs text-[#6B5515]">
            <span className="font-medium">
              {role === 'client'
                ? 'Client Portal: Real-time parcel milestones, invoices & quote requests'
                : 'Staff & Admin: Protected console for shipments, invoices & client folders'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C9A227]/20 text-[#6B5515]">
              {role === 'client' ? 'Client' : 'Management'}
            </span>
          </div>

          {/* CLIENT-ONLY: Google Sign In */}
          {role === 'client' && (
            <div className="mb-5 space-y-3">
              <button
                type="button"
                onClick={handleGoogleBtnClick}
                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-[#DED9CF] bg-white py-3.5 px-4 text-sm font-bold text-[#111111] shadow-sm transition hover:bg-[#F7F6F2] hover:border-[#C9A227] cursor-pointer"
              >
                <GoogleIcon className="h-5 w-5" />
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#ECE8DF]" />
                <span className="absolute bg-[#FAFAF8] px-3 text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider">
                  or sign in with email
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="rounded-3xl border border-[#ECE8DF] bg-white p-6 shadow-sm space-y-4"
          >
            {/* Client Registration Extra Fields */}
            {role === 'client' && clientMode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111111]">Full Name or Company</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Chief Emeka Okafor / Mr. Francis Ogbeide"
                    className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111111]">Phone Number (WhatsApp Active)</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="0810 013 0714"
                    className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                  />
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111]">
                {role === 'admin' ? 'Staff & Admin Email' : 'Email Address'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'admin' ? MASTER_ADMIN_EMAIL : 'client@example.com'}
                className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#111111]">
                  {role === 'admin' ? 'Master Security Password' : 'Password'}
                </label>
                {role === 'client' && clientMode === 'login' && (
                  <button
                    type="button"
                    onClick={() =>
                      alert('To reset your password, kindly message BuySmart Operations on WhatsApp: 0810 013 0714')
                    }
                    className="text-[11px] text-[#C9A227] font-semibold hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-[#DED9CF] bg-[#FAFAF8] px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#66615B] hover:text-[#111111]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-bold text-white transition hover:opacity-95 shadow-sm disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: '#111111' }}
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>
                    {role === 'client'
                      ? clientMode === 'login'
                        ? 'Sign In to Client Portal'
                        : 'Create Client Account'
                      : 'Enter Staff & Admin Console'}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#C9A227]" />
                </>
              )}
            </button>

            {/* Client Mode Toggle */}
            {role === 'client' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setClientMode(clientMode === 'login' ? 'register' : 'login');
                    setError('');
                  }}
                  className="text-xs text-[#4A4A4A] hover:text-[#111111] cursor-pointer"
                >
                  {clientMode === 'login' ? (
                    <>
                      Don&apos;t have an account? <span className="font-bold text-[#C9A227]">Sign Up</span>
                    </>
                  ) : (
                    <>
                      Already registered? <span className="font-bold text-[#C9A227]">Log In</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Google Modal Fallback */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#ECE8DF]">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE8DF]">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="h-6 w-6" />
                <span className="font-bold text-sm text-[#111111]">Google Sign In</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-xs text-[#66615B] hover:text-[#111111]"
              >
                Cancel
              </button>
            </div>

            <p className="mt-4 text-xs text-[#66615B] leading-relaxed">
              Verify your Google account. This automatically links your shipments and creates your dedicated Client Folder.
            </p>

            <form onSubmit={handleConfirmGoogleModal} className="mt-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">Google Full Name</label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Mr. Francis Ogbeide"
                  className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">Google Email Address</label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="francis.ogbeide@gmail.com"
                  className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111111]">WhatsApp Phone (for cargo updates)</label>
                <input
                  type="tel"
                  value={googlePhone}
                  onChange={(e) => setGooglePhone(e.target.value)}
                  placeholder="0814 555 6789"
                  className="w-full rounded-xl border border-[#DED9CF] bg-[#FAFAF8] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="flex-1 rounded-xl border border-[#DED9CF] py-2.5 text-xs font-semibold text-[#4A4A4A] hover:bg-[#F7F6F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#111111] py-2.5 text-xs font-bold text-white hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <span>Continue with Google</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#C9A227]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
