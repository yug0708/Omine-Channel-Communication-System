import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { UCLogo, UKFlagIcon, PasswordEyeIcon, PasswordEyeOffIcon, EmailIcon, LockIcon, CheckIcon, InfoIcon, CloseIcon } from '../components/icons/Icons';
import Button from '../components/ui/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('yugshah82@gmail.com');
  const [password, setPassword] = useState('Variance@2025');
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
      await auth.login(email, password);
      showToast('Login successful', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Unified Inbox – Manage WhatsApp, Email, Website Chat, and Calls in one place",
    "Real-Time Notifications – Never miss a customer message again",
    "Team Collaboration – Assign, track, and resolve conversations together",
    "Powerful Automations – Chatbots, auto-replies, and smart routing",
    "Enterprise-Grade Security – Data protection you can trust"
  ];

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-[#1C2434] transition-colors duration-300">
      {/* Left Side - Feature Showcase */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#E6F4FF] to-[#F0F9FF] dark:from-[#24303F] dark:to-[#1C2434] flex-col items-center justify-center p-12 relative overflow-hidden transition-colors duration-300">
        <div className="z-10 max-w-lg w-full">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="bg-[#007BFF] dark:bg-blue-600 rounded-lg p-2 transition-colors duration-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white" />
                  </svg>
                </div>
              </div>
              <span className="text-3xl font-bold text-[#1a1a1a] dark:text-white transition-colors duration-300">WowChat</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-center text-[#007BFF] dark:text-blue-400 mb-4 transition-colors duration-300">Welcome to WowChat</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-lg transition-colors duration-300">All-in-One Omni-Channel Communication Platform</p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-[#007BFF] dark:bg-blue-600 rounded-full p-1 transition-colors duration-300">
                    <CheckIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-300">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-[#1C2434] flex flex-col relative transition-colors duration-300">
        <div className="absolute top-6 right-6">
          <button className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors">
            <UKFlagIcon className="h-6 w-6 rounded-sm shadow-sm" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Sign in to your account</h2>
            </div>

            {showTips && (
              <div className="bg-[#E0F7FA] dark:bg-cyan-900/10 border border-[#B2EBF2] dark:border-cyan-800/30 rounded-lg p-4 relative transition-colors duration-300">
                <button
                  onClick={() => setShowTips(false)}
                  className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <InfoIcon className="h-5 w-5 text-[#00BCD4] dark:text-cyan-500 transition-colors duration-300" />
                  </div>
                  <div className="text-xs text-[#006064] dark:text-cyan-100 space-y-1 transition-colors duration-300">
                    <p className="font-semibold dark:text-cyan-400">Sign-in Tips</p>
                    <ul className="list-disc pl-4 space-y-0.5 opacity-90">
                      <li>Use your registered email.</li>
                      <li>Check if Caps Lock is on.</li>
                      <li>Need help? Forgot your password?</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-[#38414E] rounded-full text-gray-900 dark:text-white bg-white dark:bg-[#1C2434] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm transition-colors duration-300"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Password</label>
                  <div className="text-xs">
                    <Link to="/forgot-password" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300">Forgot password?</Link>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-[#38414E] rounded-full text-gray-900 dark:text-white bg-white dark:bg-[#1C2434] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-300"
                    placeholder="Enter password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 focus:outline-none text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300">
                      {showPassword ? (
                        <PasswordEyeOffIcon className="h-5 w-5" />
                      ) : (
                        <PasswordEyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 dark:text-red-400 text-sm text-center transition-colors duration-300">{error}</p>}

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0069D9] dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center justify-center gap-1 inline-flex transition-colors duration-300">
                  Get started <span aria-hidden="true">&rarr;</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;