
import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { COUNTRIES as countries, Country } from '../../data/countries';
import { ChevronDownIcon, SearchIcon } from '../icons/Icons';

interface CountryCodePickerProps {
    value: string; // The country code, e.g., 'IN'
    onChange: (code: string) => void;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry = useMemo(() =>
        countries.find(c => c.code === value) || countries.find(c => c.code === 'IN'),
        [value]);

    // Position dropdown using fixed coords from button's bounding rect
    const openDropdown = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: 288,
                zIndex: 9999,
            });
        }
        setIsOpen(prev => !prev);
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                buttonRef.current && !buttonRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Reposition on scroll/resize
    useEffect(() => {
        if (!isOpen) return;
        const reposition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownStyle({
                    position: 'fixed',
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: 288,
                    zIndex: 9999,
                });
            }
        };
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [isOpen]);

    const filteredCountries = useMemo(() =>
        countries.filter(country =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.dial_code.includes(searchTerm) ||
            country.code.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [searchTerm]);

    const handleSelect = (country: Country) => {
        onChange(country.code);
        setIsOpen(false);
        setSearchTerm('');
    };

    const dropdown = isOpen ? (
        <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white dark:bg-[#1a2235] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700"
        >
            {/* Search */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0056D2] text-sm text-slate-800 dark:text-white placeholder-slate-400"
                        autoFocus
                    />
                </div>
            </div>
            {/* List */}
            <ul
                className="max-h-56 overflow-y-auto py-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}
            >
                {filteredCountries.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-slate-400 text-center">No results found</li>
                ) : (
                    filteredCountries.map(country => (
                        <li
                            key={country.code}
                            onClick={() => handleSelect(country)}
                            className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${value === country.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                                    alt={country.name}
                                    className="w-5 h-3.5 rounded-sm object-cover flex-shrink-0"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{country.name}</span>
                                    <span className="text-xs text-slate-400">{country.code} ({country.dial_code})</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{country.dial_code}</span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    ) : null;

    return (
        <div className="relative flex items-center self-stretch">
            <button
                ref={buttonRef}
                type="button"
                onClick={openDropdown}
                className="flex items-center h-full px-3 py-2.5 focus:outline-none bg-transparent gap-1.5"
            >
                <img
                    src={`https://flagcdn.com/w20/${selectedCountry?.code.toLowerCase()}.png`}
                    alt={selectedCountry?.name}
                    className="w-5 h-3.5 rounded-sm object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{selectedCountry?.code}</span>
                <ChevronDownIcon className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {typeof document !== 'undefined' && ReactDOM.createPortal(dropdown, document.body)}
        </div>
    );
};

export default CountryCodePicker;
