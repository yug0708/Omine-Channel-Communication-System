import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { UCLogo, UKFlagIcon, PasswordEyeIcon, PasswordEyeOffIcon, CheckIcon } from '../components/icons/Icons';

const STATIC_EMAIL    = 'yugshah82@gmail.com';
const STATIC_PASSWORD = 'Variance@2025';

// ── Floating particles ─────────────────────────────────────────────────────────
const Particle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={style}
  />
);

// ── Login page ─────────────────────────────────────────────────────────────────
const Login: React.FC = () => {
  const [email, setEmail]             = useState(STATIC_EMAIL);
  const [password, setPassword]       = useState(STATIC_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [focused, setFocused]         = useState<'email' | 'password' | null>(null);

  const auth           = useAuth();
  const { showToast }  = useToast();
  const navigate       = useNavigate();
  const location       = useLocation();
  const from           = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await auth.login(STATIC_EMAIL, STATIC_PASSWORD);
      showToast('Login successful', 'success');
      navigate(from, { replace: true });
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Unified inbox: WhatsApp, email, chat & voice',
    'Real-time alerts & smart notifications',
    'Team workflows with assignments & tracking',
    'Enterprise-grade security & compliance',
  ];

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-950">
      {/* ── Animated background ───────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* Animated mesh orbs */}
        <div
          className="absolute float-orb"
          style={{
            top: '-10%', left: '-5%',
            width: '55vw', height: '55vw',
            maxWidth: 700, maxHeight: 700,
            background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 65%)',
            borderRadius: '50%',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '40%', right: '-10%',
            width: '40vw', height: '40vw',
            maxWidth: 500, maxHeight: 500,
            background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 65%)',
            borderRadius: '50%',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-5%', left: '30%',
            width: '30vw', height: '30vw',
            maxWidth: 400, maxHeight: 400,
            background: 'radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 65%)',
            borderRadius: '50%',
            animation: 'float 12s ease-in-out infinite 2s',
          }}
        />

        {/* Grid overlay */}
        <div className="absolute inset-0 dashboard-grid-bg opacity-30" />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <Particle key={i} style={{
            width:  `${4 + (i * 3) % 8}px`,
            height: `${4 + (i * 3) % 8}px`,
            top:    `${10 + (i * 12) % 80}%`,
            left:   `${5 + (i * 17) % 85}%`,
            background: i % 2 === 0 ? 'rgba(16,185,129,0.4)' : 'rgba(14,165,233,0.3)',
            animation: `float ${6 + i * 1.5}s ease-in-out infinite ${i * 0.8}s`,
            filter: 'blur(1px)',
          }} />
        ))}
      </div>

      {/* ── Main layout ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">

        {/* ── Left brand panel ─────────────────────────────────────── */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in-up">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/30 pulse-glow">
              <UCLogo className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">WowChat</span>
          </div>

          {/* Hero text */}
          <div className="max-w-lg stagger-item" style={{ animationDelay: '0.1s' }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">
              Omni-channel platform
            </p>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.1] mb-5">
              One workspace for every{' '}
              <span className="gradient-text">customer conversation</span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed mb-10">
              Manage channels, collaborate with your team, and respond faster — from a single modern dashboard.
            </p>

            <ul className="space-y-3.5">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 stagger-item" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <span className="flex-shrink-0 h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                  <span className="text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} WowChat · Secure sign-in
          </p>
        </div>

        {/* ── Right form panel ─────────────────────────────────────── */}
        <div className="flex flex-1 flex-col min-h-screen">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 sm:px-10 pt-6">
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <UCLogo className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-bold text-white">WowChat</span>
            </div>
            <div className="ml-auto">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <UKFlagIcon className="h-4 w-4 rounded-sm" />
                <span className="hidden sm:inline">English</span>
              </button>
            </div>
          </div>

          {/* Centered form */}
          <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8 lg:px-12">
            <div className="w-full max-w-[420px] animate-fade-in-up">

              {/* Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-slate-900/80 backdrop-blur-xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.06]">
                {/* Top shimmer line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                {/* Corner glow */}
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

                <div className="p-8 sm:p-9">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Welcome back</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Sign in to continue to your workspace</p>
                      </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Users', value: '2.4K+' },
                        { label: 'Messages', value: '1M+' },
                        { label: 'Uptime', value: '99.9%' },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-center">
                          <p className="text-sm font-bold text-emerald-400">{stat.value}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                        Email address
                      </label>
                      <div className={`relative flex items-center rounded-xl border bg-white/[0.05] transition-all duration-200 ${
                        focused === 'email'
                          ? 'border-emerald-500/60 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
                          : 'border-white/[0.1] hover:border-white/20'
                      }`}>
                        <div className="pl-3.5 flex-shrink-0">
                          <svg className={`h-4 w-4 transition-colors ${focused === 'email' ? 'text-emerald-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          onFocus={() => setFocused('email')}
                          onBlur={() => setFocused(null)}
                          className="flex-1 bg-transparent py-3 px-3 text-sm text-white placeholder:text-slate-500 outline-none"
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className={`relative flex items-center rounded-xl border bg-white/[0.05] transition-all duration-200 ${
                        focused === 'password'
                          ? 'border-emerald-500/60 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
                          : 'border-white/[0.1] hover:border-white/20'
                      }`}>
                        <div className="pl-3.5 flex-shrink-0">
                          <svg className={`h-4 w-4 transition-colors ${focused === 'password' ? 'text-emerald-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onFocus={() => setFocused('password')}
                          onBlur={() => setFocused(null)}
                          className="flex-1 bg-transparent py-3 px-3 text-sm text-white placeholder:text-slate-500 outline-none pr-10"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <PasswordEyeOffIcon className="h-4 w-4" /> : <PasswordEyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-center text-sm text-red-400 animate-fade-in-up">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-ripple w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Signing in…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Sign in
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </form>

                  {/* Footer */}
                  <div className="mt-6 pt-5 border-t border-white/[0.06]">
                    <p className="text-center text-sm text-slate-500">
                      Don&apos;t have an account?{' '}
                      <Link
                        to="/register"
                        className="font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
                      >
                        Create account
                        <span aria-hidden="true">→</span>
                      </Link>
                    </p>

                    <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secured with encrypted connection
                    </p>
                  </div>
                </div>

                {/* Bottom shimmer line */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
