import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, CheckIcon, UKFlagIcon } from '../components/icons/Icons';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Password reset requested for:', email);
        setIsSubmitted(true);
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
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#E6FDF9] to-[#F0FDFB] flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="z-10 max-w-lg w-full">
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="bg-emerald-500 rounded-lg p-2">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-3xl font-bold text-[#1a1a1a]">WowChat</span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-center text-emerald-500 mb-4">Welcome to WowChat</h1>
                    <p className="text-center text-gray-500 mb-12 text-lg">All-in-One Omni-Channel Communication Platform</p>

                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="bg-emerald-500 rounded-full p-1">
                                        <CheckIcon className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Forgot Password Form */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col relative">
                {/* Language Selector */}
                <div className="absolute top-6 right-6">
                    <button className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <UKFlagIcon className="h-6 w-6 rounded-sm shadow-sm" />
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16">
                    <div className="w-full max-w-sm">

                        {/* Lock Icon */}
                        <div className="flex justify-center mb-6">
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
                                {/* Shackle */}
                                <path d="M24 32V22C24 13.1634 31.1634 6 40 6C48.8366 6 56 13.1634 56 22V32" stroke="#FFC107" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Body */}
                                <rect x="12" y="32" width="56" height="48" rx="14" fill="#10B981" />
                                {/* Shine effect */}
                                <path d="M12 46C12 38.268 18.268 32 26 32H54C61.732 32 68 38.268 68 46V80H12V46Z" fill="white" fillOpacity="0.05" />
                                {/* Question Mark */}
                                <path d="M40 64V68" stroke="white" strokeWidth="5" strokeLinecap="round" />
                                <path d="M40 60V57C40 54 44.5 54 44.5 50.5C44.5 47 40 47 40 47C36.5 47 35.5 49 35.5 49" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {isSubmitted ? (
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Request Sent</h1>
                                <p className="text-center text-gray-500 mb-8 text-sm">
                                    If an account exists for <span className="font-semibold text-gray-800">{email}</span>, you will receive an email with instructions on how to reset your password.
                                </p>
                                <Link to="/login" className="font-semibold text-emerald-500 hover:text-emerald-600 hover:underline flex items-center justify-center">
                                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                                    Return to sign in
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-xl font-bold text-center text-gray-900 mb-2">Forgot your password?</h1>
                                <p className="text-center text-gray-500 mb-10 text-xs px-4">
                                    Please enter the email address associated with your account and we'll email you a link to reset your password.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="relative">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="peer appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                            placeholder="example@gmail.com"
                                        />
                                        <label
                                            htmlFor="email"
                                            className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-emerald-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-emerald-600"
                                        >
                                            Email address
                                        </label>
                                    </div>

                                    <div>
                                        <Button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                            Send request
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-8 text-center">
                                    <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900 text-xs flex items-center justify-center">
                                        <ChevronLeftIcon className="h-3 w-3 mr-1" />
                                        Return to sign in
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
