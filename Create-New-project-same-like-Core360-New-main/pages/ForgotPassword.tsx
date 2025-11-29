
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ForgotPasswordLockIcon, ChevronLeftIcon } from '../components/icons/Icons';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Password reset requested for:', email);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-login-bg text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white dark:bg-dark-login-card rounded-2xl p-8 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <ForgotPasswordLockIcon className="h-20 w-20" />
                    </div>

                    {isSubmitted ? (
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Request Sent</h1>
                            <p className="text-center text-slate-500 dark:text-slate-400 mt-4 text-sm">
                                If an account exists for <span className="font-semibold text-slate-800 dark:text-white">{email}</span>, you will receive an email with instructions on how to reset your password.
                            </p>
                            <div className="mt-8">
                                <Link to="/login" className="font-semibold text-accent-green hover:underline flex items-center justify-center">
                                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                                    Return to sign in
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Forgot your password?</h1>
                            <p className="text-center text-slate-500 dark:text-slate-400 mt-2 text-sm">
                                Please enter the email address associated with your account and we'll email you a link to reset your password.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                <div>
                                    <label htmlFor="email" className="text-xs font-medium text-slate-500 dark:text-slate-400">Email address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-2 appearance-none relative block w-full px-3 py-3 bg-slate-100 dark:bg-[#38414E] border border-slate-300 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-accent-green focus:border-accent-green sm:text-sm"
                                        placeholder="example@gmail.com"
                                    />
                                </div>
                                
                                <div>
                                    <Button type="submit" className="w-full">
                                        Send request
                                    </Button>
                                </div>
                            </form>
                            <div className="mt-6 text-center">
                                <Link to="/login" className="font-semibold text-slate-500 dark:text-slate-400 hover:text-accent-green text-sm flex items-center justify-center">
                                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                                    Return to sign in
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
