import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { UCLogo, UKFlagIcon, PasswordEyeIcon, PasswordEyeOffIcon, CheckIcon, InfoIcon, CloseIcon } from '../components/icons/Icons';
import Button from '../components/ui/Button';

const inputClass =
  'block w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all dark:border-white/[0.12] dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20';

const STATIC_EMAIL = 'yugshah82@gmail.com';
const STATIC_PASSWORD = 'Variance@2025';

const Login: React.FC = () => {
  const [email, setEmail] = useState(STATIC_EMAIL);
  const [password, setPassword] = useState(STATIC_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const auth = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

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
    'Unified inbox across WhatsApp, email, chat, and voice',
    'Real-time alerts so you never miss a message',
    'Team workflows with assignments and tracking',
    'Automations, bots, and smart routing',
    'Enterprise-grade security and compliance',
  ];

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100 via-emerald-50/35 to-teal-100/25 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" aria-hidden />
      <div className="pointer-events-none absolute inset-0 dashboard-mesh dashboard-grid-bg opacity-70 dark:opacity-80" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[min(520px,65vh)] w-[min(960px,130vw)] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/16" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-[10%] h-80 w-80 rounded-full bg-teal-500/16 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-1/4 right-[5%] h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />

      {/* Brand panel */}
      <div className="relative z-10 hidden lg:flex lg:w-[52%] flex-col justify-between p-12 xl:p-16">
        <div className="flex items-center gap-3">
          <UCLogo className="h-11 w-11" />
          <span className="text-2xl font-bold tracking-tight text-white">WowChat</span>
        </div>

        <div className="max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500 mb-3">Omni-channel platform</p>
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight">
            One workspace for every customer conversation
          </h1>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            Manage channels, collaborate with your team, and respond faster — from a single modern dashboard.
          </p>

          <ul className="mt-10 space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-500/30">
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                </span>
                <span className="text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} WowChat · Secure sign-in
        </p>
      </div>

      {/* Form panel */}
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-end px-6 pt-6 sm:px-10 lg:px-12">
          <div className="mr-auto flex items-center gap-2 lg:hidden">
            <UCLogo className="h-9 w-9" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">WowChat</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800/90"
            aria-label="Change language"
          >
            <UKFlagIcon className="h-4 w-4 rounded-sm" />
            <span className="hidden sm:inline">English</span>
          </button>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[440px]">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-8 shadow-[0_24px_64px_-12px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-10 dark:border-white/[0.12] dark:bg-slate-900/75 dark:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] dark:ring-1 dark:ring-white/[0.08] dark:backdrop-blur-md">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" aria-hidden />

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Welcome back — enter your credentials to continue.
                  </p>
                </div>
              </div>

              {showTips && (
                <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 dark:border-emerald-500/25 dark:bg-emerald-950/40">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 dark:bg-emerald-500/20">
                    <InfoIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">Quick tips</p>
                      <button
                        type="button"
                        onClick={() => setShowTips(false)}
                        className="shrink-0 rounded-lg p-1 text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-500 dark:hover:text-emerald-200 transition-colors"
                        aria-label="Dismiss tips"
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs leading-relaxed text-emerald-800/90 dark:text-emerald-200/80">
                      <li>• Use your registered work email.</li>
                      <li>• Check Caps Lock if sign-in fails.</li>
                      <li>
                        •{' '}
                        <Link to="/forgot-password" className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300">
                          Reset password
                        </Link>{' '}
                        if needed.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pr-11`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <PasswordEyeOffIcon className="h-5 w-5" /> : <PasswordEyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-center text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="!w-full !rounded-xl !py-3.5 !text-sm !font-semibold !bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-400 hover:!to-teal-400 hover:!shadow-emerald-500/40 !border-0 !shadow-lg !shadow-emerald-500/30 focus:!ring-emerald-500 active:!scale-[0.99] transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="mt-8 border-t border-slate-200/80 dark:border-white/[0.06]" />

              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 inline-flex items-center gap-1 transition-colors"
                >
                  Create account
                  <span aria-hidden="true">→</span>
                </Link>
              </p>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secured with encrypted connection
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
