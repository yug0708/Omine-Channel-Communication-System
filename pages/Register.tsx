import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UKFlagIcon, CheckIcon, EmailIcon, LockIcon, PasswordEyeIcon, PasswordEyeOffIcon, UserIcon, PhoneIcon, ChevronDownIcon, SearchIcon, ExclamationCircleIcon } from '../components/icons/Icons';
import Button from '../components/ui/Button';
import { COUNTRIES, Country } from '../data/countries';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Country Dropdown State
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'IN') || COUNTRIES[0]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowCountryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First Name is required!";
        if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required!";
        if (!formData.email.trim()) newErrors.email = "Email is required!";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid!";

        // Phone validation could be added here, but user didn't explicitly ask for it in the error list, 
        // though "Phone" is a field. The image shows "Password must be at least 6 characters long".
        // I will assume phone is required too but maybe not shown in the specific screenshot error list, 
        // or I'll stick to what's visible. The screenshot shows errors for First Name, Last Name, Email, Password.
        // I'll add phone required just in case.
        // Actually, looking at the screenshot again, I don't see a phone error in the summary list, 
        // but it's good practice. I'll leave it optional or just check if empty if I want to be strict.
        // Let's stick to the visible errors: First Name, Last Name, Email, Password.

        if (!formData.password) newErrors.password = "Password is required!";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters long";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            // Logic for next step would go here
            console.log('Next step with data:', { ...formData, countryCode: selectedCountry.dial_code });
        }
    };

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dial_code.includes(searchQuery)
    );

    const features = [
        "Unified Inbox – Manage WhatsApp, Email, Website Chat, and Calls in one place",
        "Real-Time Notifications – Never miss a customer message again",
        "Team Collaboration – Assign, track, and resolve conversations together",
        "Powerful Automations – Chatbots, auto-replies, and smart routing",
        "Enterprise-Grade Security – Data protection you can trust"
    ];

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Feature Showcase (Same as Login) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#E6F4FF] to-[#F0F9FF] flex-col items-center justify-center p-12 relative overflow-hidden">
                <div className="z-10 max-w-lg w-full">
                    <div className="flex justify-center mb-8">
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

            {/* Right Side - Registration Form */}
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
                            <h2 className="text-2xl font-bold text-gray-900">Get started</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
                            </p>
                        </div>

                        {/* Error Summary Box */}
                        {Object.keys(errors).length > 0 && (
                            <div className="bg-[#FFF4E5] border border-[#FFCCBC] rounded-lg p-4 mb-6 flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <ExclamationCircleIcon className="h-5 w-5 text-[#FF5722]" />
                                </div>
                                <div className="text-sm text-[#BF360C] space-y-1">
                                    {Object.values(errors).map((err, index) => (
                                        <p key={index}>• {err}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-blue-500">Personal Information</h3>
                        </div>

                        <form onSubmit={handleNext} className="space-y-5" noValidate>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="firstName" className={`block text-xs font-medium mb-1 ${errors.firstName ? 'text-[#FF5722]' : 'text-gray-500'}`}>First Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-900" />
                                        </div>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.firstName ? 'border-[#FF5722]' : 'border-gray-300'}`}
                                            placeholder=""
                                        />
                                    </div>
                                    {errors.firstName && <p className="mt-1 text-xs text-[#FF5722]">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="lastName" className={`block text-xs font-medium mb-1 ${errors.lastName ? 'text-[#FF5722]' : 'text-gray-500'}`}>Last Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-900" />
                                        </div>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.lastName ? 'border-[#FF5722]' : 'border-gray-300'}`}
                                            placeholder=""
                                        />
                                    </div>
                                    {errors.lastName && <p className="mt-1 text-xs text-[#FF5722]">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className={`block text-xs font-medium mb-1 ${errors.email ? 'text-[#FF5722]' : 'text-gray-500'}`}>Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full pl-10 pr-3 py-3 border rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.email ? 'border-[#FF5722]' : 'border-gray-300'}`}
                                        placeholder="example@gmail.com"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-[#FF5722]">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                                <div className="relative flex rounded-full shadow-sm" ref={dropdownRef}>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-20">
                                        <button
                                            type="button"
                                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                            className="flex items-center gap-1 focus:outline-none hover:bg-gray-100 p-1 rounded transition-colors"
                                        >
                                            <span className="text-xl">{selectedCountry.flag}</span>
                                            <ChevronDownIcon className="h-3 w-3 text-gray-500" />
                                        </button>

                                        {/* Vertical Divider */}
                                        <div className="h-6 w-px bg-gray-300 mx-2"></div>

                                        {/* Dropdown Menu */}
                                        {showCountryDropdown && (
                                            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                                <div className="p-2 border-b border-gray-100">
                                                    <div className="relative">
                                                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search..."
                                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto">
                                                    {filteredCountries.map((country) => (
                                                        <button
                                                            key={country.code}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedCountry(country);
                                                                setShowCountryDropdown(false);
                                                                setSearchQuery('');
                                                            }}
                                                            className={`w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-colors text-left ${selectedCountry.code === country.code ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <span className="text-xl mr-3">{country.flag}</span>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{country.name}</div>
                                                                <div className="text-xs text-gray-500">{country.code} ({country.dial_code})</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {filteredCountries.length === 0 && (
                                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No countries found</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="appearance-none block w-full pl-20 pr-3 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className={`block text-xs font-medium mb-1 ${errors.password ? 'text-[#FF5722]' : 'text-gray-500'}`}>Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockIcon className="h-5 w-5 text-gray-900" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full pl-10 pr-10 py-3 border rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.password ? 'border-[#FF5722]' : 'border-gray-300'}`}
                                        placeholder="6+ characters"
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
                                {errors.password && <p className="mt-1 text-xs text-[#FF5722]">{errors.password}</p>}
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0069D9] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Next
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                <span>Step 1 of 3</span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-1.5">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '33%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
