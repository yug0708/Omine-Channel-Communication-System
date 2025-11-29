
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { COUNTRIES as countries, Country } from '../../data/countries';
import { ChevronDownIcon, SearchIcon } from '../icons/Icons';

interface CountryCodePickerProps {
    value: string; // The country code, e.g., 'IN'
    onChange: (code: string) => void;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry = useMemo(() =>
        countries.find(c => c.code === value) || countries.find(c => c.code === 'IN'),
        [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredCountries = useMemo(() =>
        countries.filter(country =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.dial_code.includes(searchTerm)
        ),
        [searchTerm]);

    const handleSelect = (country: Country) => {
        onChange(country.code);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center h-full px-3 py-2.5 rounded-l-md bg-white dark:bg-dark-bg border border-r-0 border-slate-300 dark:border-slate-700 focus:outline-none"
            >
                <span className="text-xl">
                    {selectedCountry?.flag}
                </span>
                <ChevronDownIcon className="h-4 w-4 ml-1 text-slate-400" />
            </button>
            {isOpen && (
                <div className="absolute z-10 top-full mt-1 w-72 bg-white dark:bg-dark-card rounded-md shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="p-2">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon className="h-5 w-5 text-slate-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-dark-bg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-accent-green text-sm"
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul
                        className="max-h-60 overflow-y-auto"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#4b5563 #1f2937'
                        }}
                    >
                        {filteredCountries.map(country => (
                            <li
                                key={country.code}
                                onClick={() => handleSelect(country)}
                                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${value === country.code ? 'bg-slate-200 dark:bg-slate-600' : ''}`}
                            >
                                <div className="flex items-center">
                                    <span className="text-xl mr-3">{country.flag}</span>
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{country.name}</span>
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{country.dial_code}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CountryCodePicker;
