
import React, { useState } from 'react';
import { PasswordEyeIcon, PasswordEyeOffIcon } from '../icons/Icons';
import Button from '../ui/Button';

interface RegisterStep1Props {
    formData: any;
    setFormData: (data: any) => void;
    onNext: () => void;
}

const RegisterStep1: React.FC<RegisterStep1Props> = ({ formData, setFormData, onNext }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate a quick validation before proceeding
        setTimeout(() => {
            setIsLoading(false);
            onNext();
        }, 500);
    };

    const inputClasses = "mt-2 appearance-none relative block w-full px-3 py-3 bg-slate-100 dark:bg-[#1A1A1A] border border-slate-300 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-accent-green focus:border-accent-green sm:text-sm";
    const labelClasses = "text-xs font-medium text-slate-500 dark:text-slate-400";


    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="flex gap-4">
                <div className="flex-1">
                    <label htmlFor="firstName" className={labelClasses}>First Name</label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className={inputClasses}
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="lastName" className={labelClasses}>Last Name</label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className={inputClasses}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email-register" className={labelClasses}>Email</label>
                <input
                    id="email-register"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="example@gmail.com"
                />
            </div>
            
            <div>
                <label htmlFor="password-register" className={labelClasses}>Password</label>
                <div className="relative">
                    <input
                        id="password-register"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="6+ characters"
                    />
                    <div className="absolute inset-y-0 right-0 top-1 pr-3 flex items-center text-sm leading-5">
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 focus:outline-none">
                            {showPassword ? (
                                <PasswordEyeOffIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            ) : (
                                <PasswordEyeIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            <div>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Processing...' : 'Next'}
                </Button>
            </div>
        </form>
    );
};

export default RegisterStep1;
