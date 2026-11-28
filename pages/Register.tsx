import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { UKFlagIcon, CheckIcon, ChevronDownIcon, SearchIcon, ExclamationCircleIcon, PasswordEyeIcon, PasswordEyeOffIcon, ChevronLeftIcon } from '../components/icons/Icons';
import Button from '../components/ui/Button';
import { COUNTRIES, Country } from '../data/countries';

export default function Register() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        organizationName: '',
        crNumber: '',
        website: '',
        industry: '',
        companySize: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'IN') || COUNTRIES[0]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const { register } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateStep1 = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First Name is required!";
        if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required!";
        if (!formData.email.trim()) newErrors.email = "Email is required!";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid!";
        if (!formData.password) newErrors.password = "Password is required!";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters long";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.organizationName.trim()) newErrors.organizationName = "Organization Name is required";
        if (!formData.crNumber.trim()) newErrors.crNumber = "CR Number is required";
        if (!formData.website.trim()) newErrors.website = "Website is required";
        else if (!/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(formData.website)) newErrors.website = "Invalid Website URL";
        if (!formData.industry) newErrors.industry = "Business Industry is required";
        if (!formData.companySize) newErrors.companySize = "Company Size is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
                setErrors({});
                window.scrollTo(0, 0);
            }
        } else if (step === 2) {
            if (validateStep2()) {
                try {
                    setIsLoading(true);
                    const completeData = {
                        ...formData,
                        phone: `${selectedCountry.dial_code} ${formData.phone}`
                    };
                    await register(completeData);
                    showToast('Tenant Created Successfully', 'success');
                    navigate('/login');
                } catch (err: any) {
                    setErrors({ submit: err.message || "Registration failed. Please try again." });
                } finally {
                    setIsLoading(false);
                }
            }
        }
    };

    const handlePrevious = () => {
        setStep(prev => prev - 1);
        setErrors({});
        window.scrollTo(0, 0);
    };

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-[#111111] transition-colors duration-300">
            {/* Left Side - Feature Showcase */}
            <div className="hidden lg:flex w-1/2 bg-[#F9F6F2] dark:bg-[#000000] flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="z-10 max-w-lg w-full">
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="bg-emerald-500 dark:bg-emerald-600 rounded-lg p-2 transition-colors duration-300">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-3xl font-bold text-[#1a1a1a] dark:text-white transition-colors duration-300">WowChat</span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-center text-emerald-500 dark:text-emerald-400 mb-4 transition-colors duration-300">Welcome to WowChat</h1>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-lg transition-colors duration-300">All-in-One Omni-Channel Communication Platform</p>

                    <div className="space-y-6">
                        {[
                            "Unified Inbox – Manage WhatsApp, Email, Website Chat, and Calls in one place",
                            "Real-Time Notifications – Never miss a customer message again",
                            "Team Collaboration – Assign, track, and resolve conversations together",
                            "Powerful Automations – Chatbots, auto-replies, and smart routing",
                            "Enterprise-Grade Security – Data protection you can trust"
                        ].map((feature, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="bg-emerald-500 dark:bg-emerald-600 rounded-full p-1 transition-colors duration-300">
                                        <CheckIcon className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-300">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 bg-white dark:bg-[#111111] flex flex-col relative transition-colors duration-300">
                {/* Language Selector */}
                <div className="absolute top-6 right-6">
                    <button className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors">
                        <UKFlagIcon className="h-6 w-6 rounded-sm shadow-sm" />
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16">
                    <div className="w-full max-w-md space-y-8">
                        <div className="mb-8 text-center">
                            <h5 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Get started</h5>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 transition-colors duration-300">
                                Already have an account?{' '}
                                <Link to="/login" className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:underline font-medium transition-colors duration-300">Sign in</Link>
                            </p>
                            <h5 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                {step === 1 ? 'Personal Information' : 'Company Information'}
                            </h5>
                        </div>

                        {/* Error Summary Box */}
                        {Object.keys(errors).length > 0 && (
                            <div className="bg-[#FFF4E5] dark:bg-orange-900/10 border border-[#FFCCBC] dark:border-orange-800/30 rounded-lg p-4 mb-6 flex items-start gap-3 transition-colors duration-300">
                                <div className="flex-shrink-0 mt-0.5">
                                    <ExclamationCircleIcon className="h-5 w-5 text-[#FF5722] dark:text-orange-400 transition-colors duration-300" />
                                </div>
                                <div className="text-sm text-[#BF360C] dark:text-orange-200 space-y-1 transition-colors duration-300">
                                    {Object.values(errors).map((err, index) => (
                                        <p key={index}>• {err}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleNext} noValidate autoComplete="off" className="w-full">
                            {/* Step 1: Personal Information */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        {/* First Name */}
                                        <div className="relative w-1/2">
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className={`peer block w-full pl-10 pr-4 py-3 border ${errors.firstName ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-[#2A2A2A]'} rounded-full text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50 dark:bg-transparent transition-colors duration-300`}
                                                placeholder="First Name"
                                            />
                                            <label htmlFor="firstName" className="absolute left-5 -top-2.5 bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:left-5 peer-focus:text-xs peer-focus:text-emerald-600 dark:peer-focus:text-emerald-400 duration-300">
                                                First Name
                                            </label>
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                                                    <circle cx="12" cy="6" r="4" fill="currentColor"></circle>
                                                    <path fill="currentColor" d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5"></path>
                                                </svg>
                                            </div>
                                            {errors.firstName && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.firstName}</p>}
                                        </div>

                                        {/* Last Name */}
                                        <div className="relative w-1/2">
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className={`peer block w-full pl-10 pr-4 py-3 border ${errors.lastName ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-[#2A2A2A]'} rounded-full text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50 dark:bg-transparent transition-colors duration-300`}
                                                placeholder="Last Name"
                                            />
                                            <label htmlFor="lastName" className="absolute left-5 -top-2.5 bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:left-5 peer-focus:text-xs peer-focus:text-emerald-600 dark:peer-focus:text-emerald-400 duration-300">
                                                Last Name
                                            </label>
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                                                    <circle cx="12" cy="6" r="4" fill="currentColor"></circle>
                                                    <path fill="currentColor" d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5"></path>
                                                </svg>
                                            </div>
                                            {errors.lastName && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.lastName}</p>}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`peer block w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-[#2A2A2A]'} rounded-full text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50/50 dark:bg-transparent transition-colors duration-300`}
                                            placeholder="Email address"
                                        />
                                        <label htmlFor="email" className="absolute left-6 -top-2.5 bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:left-6 peer-focus:text-xs peer-focus:text-emerald-600 dark:peer-focus:text-emerald-400 duration-300">
                                            Email
                                        </label>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                                                <path fill="currentColor" fillRule="evenodd" d="M3.172 5.172C2 6.343 2 8.229 2 12s0 5.657 1.172 6.828S6.229 20 10 20h4c3.771 0 5.657 0 6.828-1.172S22 15.771 22 12s0-5.657-1.172-6.828S17.771 4 14 4h-4C6.229 4 4.343 4 3.172 5.172M18.576 7.52a.75.75 0 0 1-.096 1.056l-2.196 1.83c-.887.74-1.605 1.338-2.24 1.746c-.66.425-1.303.693-2.044.693s-1.384-.269-2.045-.693c-.634-.408-1.352-1.007-2.239-1.745L5.52 8.577a.75.75 0 0 1 .96-1.153l2.16 1.799c.933.777 1.58 1.315 2.128 1.667c.529.34.888.455 1.233.455s.704-.114 1.233-.455c.547-.352 1.195-.89 2.128-1.667l2.159-1.8a.75.75 0 0 1 1.056.097" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.email}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div className="relative">
                                        <div className={`flex rounded-full shadow-sm ring-1 ring-inset ${errors.phone ? 'ring-red-500 dark:ring-red-400' : 'ring-gray-300 dark:ring-[#2A2A2A]'} focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-500 bg-gray-50/50 dark:bg-transparent transition-colors duration-300`}>
                                            <div className="relative" ref={dropdownRef}>
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 pl-3 pr-2 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none border-r border-gray-200 dark:border-[#2A2A2A] transition-colors duration-300"
                                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                >
                                                    <span className="w-6 overflow-hidden text-xl">{selectedCountry.flag}</span>
                                                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                                                </button>

                                                {showCountryDropdown && (
                                                    <div className="absolute top-full left-0 mt-1 w-64 max-h-60 bg-white dark:bg-[#111111] rounded-xl shadow-lg border border-gray-100 dark:border-[#2A2A2A] py-1 z-50 overflow-y-auto transition-colors duration-300">
                                                        <div className="sticky top-0 bg-white dark:bg-[#111111] px-3 py-2 border-b border-gray-100 dark:border-[#2A2A2A] rounded-t-xl z-10 transition-colors duration-300">
                                                            <div className="relative">
                                                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 z-10" />
                                                                <input
                                                                    type="text"
                                                                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-[#1A1A1A] border-none rounded-full focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                                                                    placeholder="Search..."
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                        </div>
                                                        {COUNTRIES.filter(c =>
                                                            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                            c.dial_code.includes(searchQuery)
                                                        ).map((country) => (
                                                            <button
                                                                key={country.code}
                                                                type="button"
                                                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-[#1A1A1A] flex items-center gap-3 transition-colors ${selectedCountry.code === country.code ? 'bg-emerald-50/50 dark:bg-[#1A1A1A]' : ''}`}
                                                                onClick={() => {
                                                                    setSelectedCountry(country);
                                                                    setShowCountryDropdown(false);
                                                                }}
                                                            >
                                                                <span className="text-xl flex-shrink-0">{country.flag}</span>
                                                                <div className="flex flex-col items-start leading-tight">
                                                                    <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">{country.name}</span>
                                                                    <span className="text-gray-500 dark:text-gray-400 text-xs transition-colors duration-300">{country.code} ({country.dial_code})</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="block w-full border-0 bg-transparent py-3 pl-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6 transition-colors duration-300"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <label htmlFor="phone" className="absolute left-6 -top-2.5 bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                            Phone
                                        </label>
                                        {errors.phone && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.phone}</p>}
                                    </div>

                                    {/* Password */}
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`peer block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-[#2A2A2A]'} rounded-full text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50/50 dark:bg-transparent transition-colors duration-300`}
                                            placeholder="6+ characters"
                                        />
                                        <label htmlFor="password" className="absolute left-6 -top-2.5 bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:left-6 peer-focus:text-xs peer-focus:text-emerald-600 dark:peer-focus:text-emerald-400 duration-300">
                                            Password
                                        </label>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                                                <path fill="currentColor" fillRule="evenodd" d="M5.25 10.055V8a6.75 6.75 0 0 1 13.5 0v2.055c1.115.083 1.84.293 2.371.824C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16s0-4.243.879-5.121c.53-.531 1.256-.741 2.371-.824M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004Q16.676 9.999 16 10H8q-.677-.001-1.25.004z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none transition-colors duration-300"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide Password" : "Show Password"}
                                        >
                                            {showPassword ? (
                                                <PasswordEyeOffIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                                            ) : (
                                                <PasswordEyeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                                            )}
                                        </button>
                                        {errors.password && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.password}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Company Information */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    {/* Organization Name */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="organizationName"
                                            name="organizationName"
                                            required
                                            value={formData.organizationName}
                                            onChange={handleChange}
                                            className={`peer block w-full pl-10 pr-4 py-3 border ${errors.organizationName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-[#2A2A2A]'} rounded-full text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50/50 dark:bg-transparent transition-colors duration-300`}
                                            placeholder="Organization Name"
                                        />
                                        <label htmlFor="organizationName" className="absolute left-6 -top-2.5 bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:left-6 peer-focus:text-xs peer-focus:text-emerald-600 dark:peer-focus:text-emerald-400 duration-300">
                                            Organization Name
                                        </label>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className="h-5 w-5 text-gray-400 dark:text-gray-500 flex items-center justify-center transition-colors duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.organizationName && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.organizationName}</p>}
                                    </div>

                                    {/* CR Number */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="crNumber"
                                            name="crNumber"
                                            required
                                            value={formData.crNumber}
                                            onChange={handleChange}
                                            className={`peer block w-full pl-10 pr-4 py-3 border ${errors.crNumber ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-[#2A2A2A]'} rounded-full text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50/50 dark:bg-transparent transition-colors duration-300`}
                                            placeholder="CR Number"
                                        />
                                        <label htmlFor="crNumber" className="absolute left-6 -top-2.5 bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:left-6 peer-focus:text-xs peer-focus:text-emerald-600 dark:peer-focus:text-emerald-400 duration-300">
                                            CR Number
                                        </label>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className="h-5 w-5 text-gray-400 dark:text-gray-500 flex items-center justify-center transition-colors duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.crNumber && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.crNumber}</p>}
                                    </div>

                                    {/* Website */}
                                    <div className="relative">
                                        <input
                                            type="url"
                                            id="website"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className={`peer block w-full pl-10 pr-4 py-3 border ${errors.website ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-[#2A2A2A]'} rounded-full text-gray-900 dark:text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50/50 dark:bg-transparent transition-colors duration-300`}
                                            placeholder="Website"
                                        />
                                        <label htmlFor="website" className="absolute left-6 -top-2.5 bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all peer-focus:-top-2.5 peer-focus:left-6 peer-focus:text-xs peer-focus:text-emerald-600 dark:peer-focus:text-emerald-400 duration-300">
                                            Website
                                        </label>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className="h-5 w-5 text-gray-400 dark:text-gray-500 flex items-center justify-center transition-colors duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.website && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.website}</p>}
                                    </div>

                                    {/* Industry */}
                                    <div className="relative">
                                        <select
                                            id="industry"
                                            name="industry"
                                            required
                                            value={formData.industry}
                                            onChange={handleChange}
                                            className={`peer block w-full pl-10 pr-10 py-3 border ${errors.industry ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-[#2A2A2A]'} rounded-full text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50/50 dark:bg-transparent appearance-none transition-colors duration-300`}
                                        >
                                            <option className="dark:bg-[#111111]" value="" disabled hidden></option>
                                            <option className="dark:bg-[#111111]" value="Technology">Technology</option>
                                            <option className="dark:bg-[#111111]" value="Healthcare">Healthcare</option>
                                            <option className="dark:bg-[#111111]" value="Finance">Finance</option>
                                            <option className="dark:bg-[#111111]" value="Retail">Retail</option>
                                            <option className="dark:bg-[#111111]" value="Education">Education</option>
                                            <option className="dark:bg-[#111111]" value="Real Estate">Real Estate</option>
                                            <option className="dark:bg-[#111111]" value="Other">Other</option>
                                        </select>
                                        <label htmlFor="industry" className={`absolute left-6 transition-all bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 ${formData.industry ? '-top-2.5 text-xs text-emerald-600 dark:text-emerald-400' : '-top-2.5'} duration-300`}>
                                            Business Industry
                                        </label>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className="h-5 w-5 text-gray-400 dark:text-gray-500 flex items-center justify-center transition-colors duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-colors duration-300" />
                                        </div>
                                        {errors.industry && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.industry}</p>}
                                    </div>

                                    {/* Company Size */}
                                    <div className="relative">
                                        <select
                                            id="companySize"
                                            name="companySize"
                                            required
                                            value={formData.companySize}
                                            onChange={handleChange}
                                            className={`peer block w-full pl-10 pr-10 py-3 border ${errors.companySize ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-[#2A2A2A]'} rounded-full text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-50/50 dark:bg-transparent appearance-none transition-colors duration-300`}
                                        >
                                            <option className="dark:bg-[#111111]" value="" disabled hidden></option>
                                            <option className="dark:bg-[#111111]" value="1-10">1-10 Employees</option>
                                            <option className="dark:bg-[#111111]" value="11-50">11-50 Employees</option>
                                            <option className="dark:bg-[#111111]" value="51-200">51-200 Employees</option>
                                            <option className="dark:bg-[#111111]" value="201-500">201-500 Employees</option>
                                            <option className="dark:bg-[#111111]" value="500+">500+ Employees</option>
                                        </select>
                                        <label htmlFor="companySize" className={`absolute left-6 transition-all bg-white dark:bg-[#111111] px-1 text-xs font-medium text-gray-500 dark:text-gray-400 ${formData.companySize ? '-top-2.5 text-xs text-emerald-600 dark:text-emerald-400' : '-top-2.5'} duration-300`}>
                                            Company Size
                                        </label>
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className="h-5 w-5 text-gray-400 dark:text-gray-500 flex items-center justify-center transition-colors duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronDownIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-colors duration-300" />
                                        </div>
                                        {errors.companySize && <p className="text-xs text-red-500 dark:text-red-400 mt-1 pl-4 transition-colors duration-300">{errors.companySize}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className={`pt-4 flex ${step > 1 ? 'justify-between gap-4' : 'justify-end'}`}>
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevious}
                                        className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-emerald-500 dark:border-emerald-500 rounded-full shadow-sm text-sm font-medium text-emerald-500 dark:text-emerald-400 bg-white dark:bg-[#111111] hover:bg-emerald-50 dark:hover:bg-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300"
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        Previous
                                    </button>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`${step > 1 ? 'flex-1' : 'px-8'} flex justify-center items-center gap-2 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300`}
                                >
                                    {step === 2 ? 'Save' : 'Next'}
                                    {step === 1 && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path fill="currentColor" d="M10 19a1 1 0 0 1-.64-.23a1 1 0 0 1-.13-1.41L13.71 12L9.39 6.63a1 1 0 0 1 .15-1.41a1 1 0 0 1 1.46.15l4.83 6a1 1 0 0 1 0 1.27l-5 6A1 1 0 0 1 10 19"></path>
                                        </svg>
                                    )}
                                    {step === 2 && (
                                        <CheckIcon className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </form>

                        {/* Progress Bar */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">
                                <span>Step {step} of 2</span>
                            </div>
                            <div className="w-full bg-emerald-100 dark:bg-gray-700 rounded-full h-1.5 transition-colors duration-300">
                                <div
                                    className="bg-emerald-500 dark:bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(step / 2) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
