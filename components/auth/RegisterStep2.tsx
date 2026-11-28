
import React, { useState } from 'react';
import { ChevronDownIcon } from '../icons/Icons';
import Button from '../ui/Button';

interface RegisterStep2Props {
    formData: any;
    setFormData: (data: any) => void;
    onPrevious: () => void;
    onSave: () => void;
}

const RegisterStep2: React.FC<RegisterStep2Props> = ({ formData, setFormData, onPrevious, onSave }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate saving data
        setTimeout(() => {
            setIsLoading(false);
            onSave();
        }, 1000);
    };

    const inputClasses = "mt-2 appearance-none relative block w-full px-3 py-3 bg-slate-100 dark:bg-[#1A1A1A] border border-slate-300 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white rounded-md focus:outline-none focus:ring-accent-green focus:border-accent-green sm:text-sm";
    const labelClasses = "text-xs font-medium text-slate-500 dark:text-slate-400";


    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
                <label htmlFor="organizationName" className={labelClasses}>Organization Name</label>
                <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={handleChange}
                    className={inputClasses}
                />
            </div>
            <div>
                <label htmlFor="crNumber" className={labelClasses}>CR Number</label>
                <input
                    id="crNumber"
                    name="crNumber"
                    type="text"
                    required
                    value={formData.crNumber}
                    onChange={handleChange}
                    className={inputClasses}
                />
            </div>
            <div className="relative">
                <label htmlFor="businessIndustry" className={labelClasses}>Business Industry</label>
                <select
                    id="businessIndustry"
                    name="businessIndustry"
                    required
                    value={formData.businessIndustry}
                    onChange={handleChange}
                    className={inputClasses}
                >
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>E-commerce</option>
                    <option>Education</option>
                </select>
                <ChevronDownIcon className="h-5 w-5 text-slate-400 absolute right-3 top-10 pointer-events-none" />
            </div>
            <div className="relative">
                <label htmlFor="companySize" className={labelClasses}>Company Size</label>
                <select
                    id="companySize"
                    name="companySize"
                    required
                    value={formData.companySize}
                    onChange={handleChange}
                    className={inputClasses}
                >
                    <option>1-10 Employees</option>
                    <option>11-50 Employees</option>
                    <option>51-200 Employees</option>
                    <option>201-500 Employees</option>
                    <option>500+ Employees</option>
                </select>
                <ChevronDownIcon className="h-5 w-5 text-slate-400 absolute right-3 top-10 pointer-events-none" />
            </div>

            <div className="flex gap-4 pt-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onPrevious}
                    className="w-full"
                >
                    Previous
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
};

export default RegisterStep2;
