import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { UCLogo, UKFlagIcon, PasswordEyeIcon, PasswordEyeOffIcon, CheckIcon } from '../components/icons/Icons';

const STATIC_EMAIL    = 'yugshah82@gmail.com';
const STATIC_PASSWORD = 'Variance@2025';

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
      await auth.login(email.trim(), password);
      showToast('Login successful', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
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
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#F9F6F2] dark:bg-[#000000]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[#F9F6F2] dark:bg-[#000000]" />
        <div className="login-orb absolute -left-32 -top-24 h-[520px] w-[520px] rounded-full bg-[#00A76F]/25 blur-3xl dark:bg-[#00A76F]/20" />
        <div className="login-orb-alt absolute -right-24 top-1/3 h-[420px] w-[420px] rounded-full bg-[#5BE49B]/30 blur-3xl dark:bg-[#007867]/35" />
        <div className="login-orb absolute bottom-[-120px] left-1/3 h-[360px] w-[360px] rounded-full bg-[#00A76F]/15 blur-3xl dark:bg-[#00A76F]/15" />
        <div className="absolute inset-0 dashboard-grid-bg opacity-80" />
        {[
          { top: '18%', left: '12%', delay: '0s' },
          { top: '62%', left: '22%', delay: '1.4s' },
          { top: '28%', left: '78%', delay: '0.6s' },
          { top: '74%', left: '68%', delay: '2s' },
          { top: '46%', left: '88%', delay: '1.1s' },
        ].map((dot) => (
          <span
            key={`${dot.top}-${dot.left}`}
            className="login-dot absolute h-1.5 w-1.5 rounded-full bg-[#00A76F] dark:bg-[#5BE49B]"
            style={{ top: dot.top, left: dot.left, animationDelay: dot.delay }}
          />
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
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">WowChat</span>
          </div>

          {/* Hero text */}
          <div className="max-w-lg stagger-item" style={{ animationDelay: '0.1s' }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">
              Omni-channel platform
            </p>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-5">
              One workspace for every{' '}
              <span className="gradient-text">customer conversation</span>
            </h1>
            <p className="text-base text-slate-600 dark:text-[#D6D3D1] leading-relaxed mb-10">
              Manage channels, collaborate with your team, and respond faster — from a single modern dashboard.
            </p>

            <ul className="space-y-3.5">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-[#E7E5E4] stagger-item" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <span className="flex-shrink-0 h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                  <span className="text-sm leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-500 dark:text-[#A8A29E]">
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
              <span className="text-base font-bold text-slate-900 dark:text-white">WowChat</span>
            </div>
            <div className="ml-auto">
              <button
                type="button"
                className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-[#2A2A2A] dark:bg-[#111111] dark:text-[#E7E5E4] dark:hover:bg-[#1A1A1A]"
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
              <div className="relative overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,14,13,0.12)] dark:border-[#2A2A2A] dark:bg-[#111111] dark:shadow-none">

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
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                        <p className="text-sm text-slate-600 dark:text-[#D6D3D1] mt-0.5">Sign in to continue to your workspace</p>
                      </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Users', value: '2.4K+' },
                        { label: 'Messages', value: '1M+' },
                        { label: 'Uptime', value: '99.9%' },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-lg bg-[#F9F6F2] border border-slate-200 px-3 py-2 text-center dark:bg-[#1A1A1A] dark:border-[#2A2A2A]">
                          <p className="text-sm font-bold text-[#007867] dark:text-[#5BE49B]">{stat.value}</p>
                          <p className="text-[10px] text-slate-600 dark:text-[#D6D3D1] mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-[#E7E5E4] mb-1.5 uppercase tracking-wide">
                        Email address
                      </label>
                      <div className={`relative flex items-center rounded-lg border bg-[#F9F6F2] dark:bg-[#1A1A1A] transition-all duration-200 ${
                        focused === 'email'
                          ? 'border-[#007867]'
                          : 'border-slate-300 dark:border-[#333333]'
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
                          className="flex-1 bg-transparent py-3 px-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none dark:text-white dark:placeholder:text-[#A8A29E]"
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-[#E7E5E4] uppercase tracking-wide">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-xs font-medium text-[#007867] hover:text-[#004B50] dark:text-[#5BE49B] dark:hover:text-[#C8FAD6] transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className={`relative flex items-center rounded-lg border bg-[#F9F6F2] dark:bg-[#1A1A1A] transition-all duration-200 ${
                        focused === 'password'
                          ? 'border-[#007867]'
                          : 'border-slate-300 dark:border-[#333333]'
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
                          className="flex-1 bg-transparent py-3 px-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none pr-10 dark:text-white dark:placeholder:text-[#A8A29E]"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 text-slate-500 hover:text-slate-700 dark:hover:text-[#E7E5E4] transition-colors"
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
                      className="w-full py-3 px-4 rounded-md bg-[#007867] hover:bg-[#004B50] dark:bg-[#00A76F] dark:hover:bg-[#007867] text-white font-semibold text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
                    <p className="text-center text-sm text-slate-600 dark:text-[#D6D3D1]">
                      Don&apos;t have an account?{' '}
                      <Link
                        to="/register"
                        className="font-semibold text-[#007867] hover:text-[#004B50] dark:text-[#5BE49B] dark:hover:text-[#C8FAD6] inline-flex items-center gap-1 transition-colors"
                      >
                        Create account
                        <span aria-hidden="true">→</span>
                      </Link>
                    </p>

                    <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-[#A8A29E]">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secured with encrypted connection
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
