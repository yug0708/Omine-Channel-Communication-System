import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UCLogo, UKFlagIcon, PasswordEyeIcon, PasswordEyeOffIcon, EmailIcon, LockIcon, CheckIcon, InfoIcon, CloseIcon } from '../components/icons/Icons';
import Button from '../components/ui/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await auth.login(email, password);
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
    <div className="flex min-h-screen w-full">
      {/* Left Side - Feature Showcase */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#E6F4FF] to-[#F0F9FF] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative elements could go here */}

        <div className="z-10 max-w-lg w-full">
          <div className="flex justify-center mb-8">
            {/* Custom Logo Construction to match image */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="bg-[#007BFF] rounded-lg p-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white" />
                  </svg>
                </div>
              </div>
              <span className="text-3xl font-bold text-[#1a1a1a]">WowChat</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-center text-[#007BFF] mb-4">Welcome to WowChat</h1>
          <p className="text-center text-gray-500 mb-12 text-lg">All-in-One Omni-Channel Communication Platform</p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-[#007BFF] rounded-full p-1">
                    <CheckIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col relative">
        {/* Language Selector */}
        <div className="absolute top-6 right-6">
          <button className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors">
            <UKFlagIcon className="h-6 w-6 rounded-sm shadow-sm" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
            </div>

            {/* Sign-in Tips */}
            {showTips && (
              <div className="bg-[#E0F7FA] border border-[#B2EBF2] rounded-lg p-4 relative">
                <button
                  onClick={() => setShowTips(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <InfoIcon className="h-5 w-5 text-[#00BCD4]" />
                  </div>
                  <div className="text-xs text-[#006064] space-y-1">
                    <p className="font-semibold">Sign-in Tips</p>
                    <ul className="list-disc pl-4 space-y-0.5">
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
                <label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EmailIcon className="h-5 w-5 text-gray-400 !bg-transparent !text-gray-400" />
                    {/* Note: EmailIcon in Icons.tsx has a bg color hardcoded, we might need to override it or use a different icon. 
                           The current EmailIcon has `bg-blue-500 text-white`. I should probably use a simpler icon or override classes.
                           Let's check EmailIcon implementation again. It has hardcoded classes. 
                           I'll use a raw SVG here for better control to match the design exactly.
                        */}
                  </div>
                  {/* Overriding the icon above with a raw one for this specific design */}
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-500">Password</label>
                  <div className="text-xs">
                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</Link>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                    placeholder="Enter password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 focus:outline-none text-gray-400 hover:text-gray-500">
                      {showPassword ? (
                        <PasswordEyeOffIcon className="h-5 w-5" />
                      ) : (
                        <PasswordEyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0069D9] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1 inline-flex">
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