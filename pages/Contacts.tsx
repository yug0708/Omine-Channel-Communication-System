import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Contact, Account } from '../types';
import { AccountForm } from './Accounts';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CountryCodePicker from '../components/ui/CountryCodePicker';
import { COUNTRIES as countries } from '../data/countries';
import {
  PlusIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  MoreVertIcon,
  FilterFunnelIcon,
  UserIcon,
  CloseIcon
} from '../components/icons/Icons';

// Helper to generate initials
const getInitials = (firstName: string, lastName: string) => {
  return (
    `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() ||
    '?'
  );
};

// Avatar colors
const colors = [
  'bg-teal-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-sky-500',
  'bg-pink-500'
];

const getAvatarColor = (name: string) => {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const FloatingInput: React.FC<{
  label: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ label, required, error, children, icon, suffix, ...props }) => (
  <div className="relative mt-4">
    <label className={`absolute -top-2 left-4 bg-white dark:bg-[#1a2235] px-1 text-[11px] font-bold z-10 ${error ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
      {label} {required && '*'}
    </label>
    {children ? (
      children
    ) : (
      <div className={`flex items-center w-full rounded-2xl border bg-transparent text-sm overflow-hidden ${error ? 'border-rose-500 text-rose-500' : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus-within:border-[#0056D2]'}`}>
        {icon && <div className="pl-3">{icon}</div>}
        <input
          {...props}
          required={required}
          className={`w-full px-4 py-3 bg-transparent focus:outline-none placeholder-slate-400 ${error ? 'text-slate-800 dark:text-white' : ''}`}
        />
        {suffix && <div className="pr-3">{suffix}</div>}
      </div>
    )}
    {error && <p className="text-rose-500 text-xs mt-1 ml-4 font-semibold">{error}</p>}
  </div>
);

// Per-country phone digit rules: [min, max]
const PHONE_RULES: Record<string, [number, number]> = {
  US: [10, 10], CA: [10, 10], GB: [10, 11], AU: [9, 10],
  IN: [10, 10], PK: [10, 11], CN: [11, 11], JP: [10, 11],
  DE: [10, 12], FR: [9, 10], BR: [10, 11], MX: [10, 10],
  RU: [10, 10], SA: [9, 9], AE: [9, 9], EG: [10, 10],
  NG: [10, 11], ZA: [9, 10], TR: [10, 10], IT: [9, 11],
  ES: [9, 9], NL: [9, 9], SE: [7, 13], CH: [9, 10],
  UA: [9, 10], UG: [9, 9], UY: [8, 9], UZ: [9, 9],
  RW: [9, 9], SB: [5, 7], SC: [7, 8],
};


export const ContactForm: React.FC<{
  contact?: Contact | null;
  onSave: (
    contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> | Contact
  ) => void;
  onClose: () => void;
  currentUserName?: string;
}> = ({ contact, onSave, onClose, currentUserName = '' }) => {
  const { accounts, setAccounts } = useData();
  const [countryCode, setCountryCode] = useState('IN');
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    contactNumber: contact?.contactNumber || '',
    address: contact?.address || '',
    city: contact?.city || '',
    nationalId: contact?.nationalId || '',
    country: contact?.country || '',
    accountName: contact?.accountName || '',
    assignedTo: contact?.assignedTo || currentUserName,
    lifecycle: contact?.lifecycle || 'NA',
    labels: contact?.labels || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [accountPage, setAccountPage] = useState(1);
  const [accountRowsPerPage, setAccountRowsPerPage] = useState(10);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);

  const assigneeDropdownRef = React.useRef<HTMLDivElement>(null);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

  const availableUsers = React.useMemo(() => {
    if (!currentUserName) return [];
    return [{ name: currentUserName, role: 'User' }];
  }, [currentUserName]);

  React.useEffect(() => {
    const handleOutsideAssignee = (e: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target as Node)) {
        setIsAssigneeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideAssignee);
    return () => document.removeEventListener('mousedown', handleOutsideAssignee);
  }, []);

  const handleSelectAssignee = (name: string) => {
    setFormData((prev) => ({ ...prev, assignedTo: name }));
    setIsAssigneeOpen(false);
    if (isSubmitted) {
      setErrors(validate({ ...formData, assignedTo: name }));
    }
  };

  const handleRemoveAssignee = () => {
    setFormData((prev) => ({ ...prev, assignedTo: '' }));
    if (isSubmitted) {
      setErrors(validate({ ...formData, assignedTo: '' }));
    }
  };

  const validate = (currentFormData = formData, currentCountryCode = countryCode) => {
    const newErrors: Record<string, string> = {};
    if (!currentFormData.firstName.trim()) {
      newErrors.firstName = "First Name is required!";
    }
    if (!currentFormData.lastName.trim()) {
      newErrors.lastName = "Last Name is required!";
    }
    if (!currentFormData.assignedTo.trim()) {
      newErrors.assignedTo = "Assigned To is required!";
    }
    // Email required + format
    if (!currentFormData.email.trim()) {
      newErrors.email = "Email is required!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentFormData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    // Contact number required + format
    if (!currentFormData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact Number is required!";
    } else {
      const digits = currentFormData.contactNumber.replace(/\D/g, '');
      const rule = PHONE_RULES[currentCountryCode];
      const country = countries.find(c => c.code === currentCountryCode);
      const countryName = country?.name || currentCountryCode;
      const dialCode = country?.dial_code || '';
      if (rule) {
        const [min, max] = rule;
        if (digits.length < min || digits.length > max) {
          newErrors.contactNumber = min === max
            ? `${countryName} (${dialCode}) phone numbers must be exactly ${min} digits.`
            : `${countryName} (${dialCode}) phone numbers must be ${min}–${max} digits.`;
        }
      }
    }
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (name === 'contactNumber') {
      // Always validate phone live while typing
      const allErrors = validate(updated, countryCode);
      setErrors(prev => ({ ...prev, contactNumber: allErrors.contactNumber || '' }));
    } else if (name === 'email') {
      // Always validate email live while typing
      const allErrors = validate(updated, countryCode);
      setErrors(prev => ({ ...prev, email: allErrors.email || '' }));
    } else if (isSubmitted) {
      setErrors(validate(updated, countryCode));
    }
  };

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);
    // Always re-validate phone live when country changes
    const allErrors = validate(formData, code);
    setErrors(prev => ({ ...prev, contactNumber: allErrors.contactNumber || '' }));
    if (isSubmitted) {
      setErrors(validate(formData, code));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    const validationErrors = validate(formData, countryCode);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({ ...contact, ...formData } as any);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="pt-2 pb-4">

      {/* Contact Details Section */}
      <div className="mb-6">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4">Contact Details</h3>
        <div className="space-y-4">
          <FloatingInput label="First Name" required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter first name" error={errors.firstName} />
          <FloatingInput label="Last Name" required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter last name" error={errors.lastName} />
          <FloatingInput label="Email" required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" error={errors.email} />

          <FloatingInput label="Contact Number" required>
            <div className={`flex items-center w-full rounded-2xl border bg-transparent text-sm text-slate-800 dark:text-white focus-within:border-[#0056D2] ${errors.contactNumber
              ? 'border-rose-500'
              : 'border-slate-300 dark:border-slate-700'
              }`}>
              <div className="flex-shrink-0 self-stretch flex items-center border-r border-slate-200 dark:border-slate-700">
                <CountryCodePicker value={countryCode} onChange={handleCountryCodeChange} />
              </div>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                maxLength={PHONE_RULES[countryCode] ? PHONE_RULES[countryCode][1] : 15}
                className="w-full px-4 py-3 bg-transparent focus:outline-none placeholder-slate-400"
              />
            </div>
            {errors.contactNumber && (
              <p className="text-rose-500 text-xs mt-1 ml-4 font-semibold">{errors.contactNumber}</p>
            )}
          </FloatingInput>

          <FloatingInput label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter address" />
          <FloatingInput label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" />
          <FloatingInput label="National/Iqama ID" name="nationalId" value={formData.nationalId} onChange={handleChange} placeholder="Enter national ID" />
          <FloatingInput label="Country" name="country" value={formData.country} onChange={handleChange} placeholder="Enter country" />
        </div>
      </div>

      {/* Assignment & Account Section */}
      <div className="mb-6">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-4">Assignment & Account</h3>
        <div className="space-y-4">
          <div ref={assigneeDropdownRef} className="relative mt-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Assigned To *
            </label>

            {/* Chip input box */}
            <div
              onClick={() => setIsAssigneeOpen((o) => !o)}
              className={`min-h-[42px] flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition ${errors.assignedTo
                ? 'border-2 border-rose-500 dark:border-rose-500'
                : isAssigneeOpen
                  ? 'border-2 border-[#0056D2]'
                  : 'border border-slate-300 dark:border-slate-700'
                } bg-transparent`}
            >
              {formData.assignedTo ? (
                <>
                  {/* Selected chip */}
                  <span className="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${getAvatarColor(formData.assignedTo)}`}>
                      {getInitials(formData.assignedTo.split(' ')[0] || '', formData.assignedTo.split(' ')[1] || '')}
                    </span>
                    {formData.assignedTo}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveAssignee(); }}
                      className="ml-0.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </span>
                  <span className="text-sm text-slate-400 dark:text-slate-500">Add Recipients</span>
                </>
              ) : (
                <span className="text-sm text-slate-400 dark:text-slate-500 pl-1">Add Recipients</span>
              )}

              {/* Clear all button */}
              {formData.assignedTo && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemoveAssignee(); }}
                  className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {isAssigneeOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                {availableUsers.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400">No users available</p>
                ) : (
                  availableUsers.map((u) => {
                    const isSelected = formData.assignedTo === u.name;
                    return (
                      <button
                        key={u.name}
                        type="button"
                        onClick={() => handleSelectAssignee(u.name)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected
                          ? 'bg-[#0056D2]/10 dark:bg-[#0056D2]/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                      >
                        {/* Checkmark */}
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-[#0056D2] border-[#0056D2]' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                          {isSelected && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {/* Avatar */}
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(u.name)}`}>
                          {getInitials(u.name.split(' ')[0] || '', u.name.split(' ')[1] || '')}
                        </span>
                        {/* Info */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.name}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{u.role}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {errors.assignedTo && (
              <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold mt-1.5 pl-1">
                {errors.assignedTo}
              </p>
            )}
          </div>

          <FloatingInput label="Account Name">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus-within:border-[#0056D2] overflow-hidden pr-4">
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="Search Account..."
                  className="w-full pl-4 pr-2 py-3 bg-transparent focus:outline-none placeholder-slate-400"
                />
                {formData.accountName && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, accountName: '' }))}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(true)}
                className="bg-[#10B981] text-white p-3 rounded-full hover:bg-[#059669] flex-shrink-0 transition-colors shadow-sm"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsCreateAccountModalOpen(true)}
                className="bg-[#10B981] text-white p-3 rounded-full hover:bg-[#059669] flex-shrink-0 transition-colors shadow-sm"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </FloatingInput>
        </div>
      </div>

      <div className="flex justify-center md:justify-end space-x-4 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
        <button type="button" onClick={onClose} className="px-8 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-full text-sm font-bold transition-colors shadow-sm">
          Cancel
        </button>
        <button type="submit" className="px-8 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-full text-sm font-bold transition-colors shadow-sm">
          Save
        </button>
      </div>

      {/* Account Selection Modal */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Select account"
        widthClass="max-w-5xl"
      >
        <div className="flex flex-col h-[65vh]">
          <div className="flex justify-end mb-4 items-center gap-4">
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={accountSearch}
                onChange={(e) => { setAccountSearch(e.target.value); setAccountPage(1); }}
                className="pl-9 pr-4 py-1.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] w-full"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto hide-scrollbar">
            <table className="min-w-full w-full whitespace-nowrap text-left text-sm">
              <thead className="bg-transparent border-b border-slate-200 dark:border-slate-800/80">
                <tr>
                  <TableHeader title1="Account" title2="Name" hasFilter />
                  <TableHeader title1="Email" />
                  <TableHeader title1="Contact" title2="Number" />
                  <TableHeader title1="CR" title2="Number" />
                  <TableHeader title1="City" />
                  <TableHeader title1="Country" />
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredAccounts = accounts.filter((a) =>
                    [a.name, a.email, a.crNumber, a.city, a.country, a.phone]
                      .some((val) => String(val || '').toLowerCase().includes(accountSearch.toLowerCase()))
                  );
                  const totalAccountPages = Math.max(1, Math.ceil(filteredAccounts.length / accountRowsPerPage));
                  const safeAccountPage = Math.max(1, Math.min(accountPage, totalAccountPages));
                  const paginatedAccounts = filteredAccounts.slice(
                    (safeAccountPage - 1) * accountRowsPerPage,
                    safeAccountPage * accountRowsPerPage
                  );

                  return paginatedAccounts.map((acc) => (
                    <tr
                      key={acc.id}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, accountName: acc.name }));
                        setIsAccountModalOpen(false);
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(acc.name)}`}>
                            {getInitials(acc.name, '')}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white max-w-[150px] truncate">{acc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">{acc.email || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">{acc.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">{acc.crNumber || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">{acc.city || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">{acc.country || '—'}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
          {/* Pagination Footer */}
          <div className="flex items-center justify-end px-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            {(() => {
              const filteredAccounts = accounts.filter((a) =>
                [a.name, a.email, a.crNumber, a.city, a.country, a.phone]
                  .some((val) => String(val || '').toLowerCase().includes(accountSearch.toLowerCase()))
              );
              const safeAccountPage = Math.max(1, Math.min(accountPage, Math.max(1, Math.ceil(filteredAccounts.length / accountRowsPerPage))));

              return filteredAccounts.length > 0 ? (
                <div className="flex items-center justify-end gap-4 text-sm text-slate-500 dark:text-slate-400">
                  {/* Row Per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium whitespace-nowrap">Row Per page</span>
                    <div className="relative">
                      <select
                        value={accountRowsPerPage}
                        onChange={(e) => {
                          setAccountRowsPerPage(Number(e.target.value));
                          setAccountPage(1);
                        }}
                        className="appearance-none pl-2 pr-6 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2235] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0056D2] cursor-pointer"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Range */}
                  <span className="text-xs font-medium tabular-nums whitespace-nowrap">
                    {(safeAccountPage - 1) * accountRowsPerPage + 1}–{Math.min(safeAccountPage * accountRowsPerPage, filteredAccounts.length)} of {filteredAccounts.length}
                  </span>

                  {/* Arrow buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAccountPage((p) => Math.max(1, p - 1))}
                      disabled={safeAccountPage === 1}
                      className="flex items-center justify-center w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Previous page"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setAccountPage((p) => Math.min(Math.ceil(filteredAccounts.length / accountRowsPerPage), p + 1))}
                      disabled={safeAccountPage === Math.ceil(filteredAccounts.length / accountRowsPerPage)}
                      className="flex items-center justify-center w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Next page"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </Modal>

      {/* Create Account Modal */}
      <Modal
        isOpen={isCreateAccountModalOpen}
        onClose={() => setIsCreateAccountModalOpen(false)}
        title="Create Account"
        variant="drawer"
      >
        <AccountForm
          onSave={(accountData) => {
            const now = new Date().toISOString();
            const newAccount = {
              ...accountData,
              id: `acc${Date.now()}`,
              createdAt: now,
              updatedAt: now,
            } as Account;
            setAccounts([newAccount, ...accounts]);
            setFormData((prev) => ({ ...prev, accountName: newAccount.name }));
            setIsCreateAccountModalOpen(false);
          }}
          onClose={() => setIsCreateAccountModalOpen(false)}
          currentUserName={currentUserName}
        />
      </Modal>
    </form>
  );
};

const TableHeader = ({ title1, title2, hasFilter, className }: { title1: string, title2?: string, hasFilter?: boolean, className?: string }) => (
  <th className={`px-4 py-3 font-semibold text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ${className || ''}`}>
    <div className="flex items-center gap-2">
      {title2 ? (
        <div className="flex flex-col text-[11px] leading-tight">
          <span>{title1}</span>
          <span>{title2}</span>
        </div>
      ) : (
        <span className="text-[11px]">{title1}</span>
      )}
      {hasFilter && <FilterFunnelIcon className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" />}
    </div>
  </th>
);

const downloadSampleCsv = () => {
  const headers = ['First Name', 'Last Name', 'Email', 'Contact Number', 'National ID', 'Address', 'City', 'Country'];
  const rows = [
    ['Fahad', 'Al Saud', 'fahad.alsaud@example.com', '966500000001', '1010000001', '123 King Fahad Road', 'Riyadh', 'Saudi Arabia'],
    ['Aisha', 'Al Rashid', 'aisha.rashid@example.com', '966500000002', '1010000002', '456 Olaya Street', 'Jeddah', 'Saudi Arabia'],
    ['Salem', 'Al Harbi', 'salem.harbi@example.com', '966500000003', '1010000003', '789 Tahlia Street', 'Dammam', 'Saudi Arabia'],
    ['Laila', 'Al Zahrani', 'laila.zahrani@example.com', '966500000004', '1010000004', '321 Khurais Road', 'Khobar', 'Saudi Arabia'],
    ['Majed', 'Al Otaibi', 'majed.otaibi@example.com', '966500000005', '1010000005', '654 Prince Majed Road', 'Jubail', 'Saudi Arabia'],
    ['Reem', 'Al Qahtani', 'reem.qahtani@example.com', '966500000006', '1010000006', '987 King Abdullah Road', 'Riyadh', 'Saudi Arabia'],
    ['Omar', 'Al Shehri', 'omar.shehri@example.com', '966500000007', '1010000007', '101 Prince Sultan Road', 'Jeddah', 'Saudi Arabia'],
    ['Noura', 'Al Subaie', 'noura.subaie@example.com', '966500000008', '1010000008', '202 King Saud Road', 'Hofuf', 'Saudi Arabia'],
    ['Khalid', 'Al Dossari', 'khalid.dossari@example.com', '966500000009', '1010000009', '303 Al Malaz', 'Riyadh', 'Saudi Arabia'],
    ['Fatimah', 'Al Shammeri', 'fatimah.shammeri@example.com', '966500000010', '1010000010', '404 Al Madinah Road', 'Medina', 'Saudi Arabia']
  ];

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_contacts.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Contacts: React.FC = () => {
  const { contacts, setContacts } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : 'User';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Import/Export dropdown state
  const [importExportOpen, setImportExportOpen] = useState(false);
  const importExportRef = useRef<HTMLDivElement>(null);

  // Import modal state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Merge modal state
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [primaryMergeContactId, setPrimaryMergeContactId] = useState<string | null>(null);

  // Column visibility
  const ALL_COLS = ['Last Name', 'Contact Number', 'Email', 'Account Name', 'Assigned To', 'Created Date', 'Updated Date', 'Actions'] as const;
  type ColKey = typeof ALL_COLS[number];
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(new Set(ALL_COLS));
  const [colToggleOpen, setColToggleOpen] = useState(false);
  const [colSearch, setColSearch] = useState('');
  const colToggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (importExportRef.current && !importExportRef.current.contains(e.target as Node)) {
        setImportExportOpen(false);
      }
      if (colToggleRef.current && !colToggleRef.current.contains(e.target as Node)) {
        setColToggleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Success & Error toast states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.openCreateModal) {
      handleOpenModal();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const handleOpenModal = (contact: Contact | null = null) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingContact(null);
    setIsModalOpen(false);
  };

  const handleSaveContact = (contactData: any) => {
    const now = new Date().toISOString();

    if (contactData.id) {
      setContacts(
        contacts.map((c) =>
          c.id === contactData.id
            ? { ...contactData, updatedAt: now }
            : c
        )
      );
    } else {
      const newContact = {
        ...contactData,
        id: `con${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };

      setContacts([newContact, ...contacts]);
    }
    setSuccessMessage('Contact Saved Successfully');

    handleCloseModal();
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter((c) => c.id !== id));
    }
  };

  const filteredContacts = contacts.filter((c) =>
    Object.values(c).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / rowsPerPage));
  const safePage = Math.max(1, Math.min(page, totalPages));

  const paginatedContacts = filteredContacts.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContacts(paginatedContacts.map((c) => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedContacts.length) return;
    if (window.confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) {
      setContacts(contacts.filter((c) => !selectedContacts.includes(c.id)));
      setSelectedContacts([]);
      setSuccessMessage('Contacts Deleted Successfully');
    }
  };

  const exportContactsCsv = () => {
    const headers = ['First Name', 'Last Name', 'Contact Number', 'Email', 'Account Name', 'Assigned To', 'Created Date', 'Updated Date'];
    const rows = contacts.map(c => [
      c.firstName || '',
      c.lastName || '',
      c.contactNumber || '',
      c.email || '',
      c.accountName || '',
      c.assignedTo || '',
      c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
      c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-300 ml-1">
        Contacts
      </h1>

      <div className="bg-white dark:bg-[#151B25] shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 sm:p-4 flex items-center justify-between md:justify-end gap-2.5 border-b border-slate-200 dark:border-slate-800/80">
          {/* Search bar expanding to fill space */}
          <div className="relative flex-1 md:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] w-full transition"
            />
          </div>

          {/* Action controls grouped on the right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* New Contact Button */}
            <button
              onClick={() => handleOpenModal()}
              className="bg-[#10B981] hover:bg-[#059669] text-white p-2 sm:px-4 sm:py-2 rounded-full text-sm font-medium shadow-sm flex items-center justify-center transition-colors"
              title="New Contact"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">New Contact</span>
            </button>

            {/* Column toggle button */}
            <div className="relative flex-shrink-0 hidden md:block" ref={colToggleRef}>
              <button
                onClick={() => setColToggleOpen(o => !o)}
                className="flex items-center justify-center w-8 h-8 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label="Toggle columns"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="5" height="18" rx="1" />
                  <rect x="9.5" y="3" width="5" height="18" rx="1" />
                  <rect x="17" y="3" width="5" height="18" rx="1" />
                </svg>
              </button>

              {colToggleOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden flex flex-col">
                  {/* Search inside popover */}
                  <div className="px-3 pt-3 pb-2">
                    <div className="relative">
                      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                      </svg>
                      <input
                        type="text"
                        value={colSearch}
                        onChange={e => setColSearch(e.target.value)}
                        placeholder="Search"
                        className="w-full pl-7 pr-3 py-1.5 text-sm rounded-md focus:outline-none focus:border-[#10B981]"
                        style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151' }}
                      />
                    </div>
                  </div>

                  {/* First Name — always locked */}
                  <div className="flex items-center gap-2.5 px-3 py-[7px]" style={{ opacity: 0.55 }}>
                    <span className="flex items-center justify-center h-5 w-5 rounded" style={{ background: '#10B981', flexShrink: 0 }}>
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-200">First Name</span>
                  </div>

                  {/* Scrollable columns list */}
                  <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                    {ALL_COLS.filter(c => c.toLowerCase().includes(colSearch.toLowerCase())).map(col => {
                      const checked = visibleCols.has(col);
                      return (
                        <label key={col} className="flex items-center gap-2.5 px-3 py-[7px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                          <span
                            className="flex items-center justify-center h-5 w-5 rounded flex-shrink-0 transition-colors"
                            style={{ background: checked ? '#10B981' : '#fff', border: checked ? 'none' : '2px solid #d1d5db' }}
                          >
                            {checked && (
                              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setVisibleCols(prev => {
                                const next = new Set(prev);
                                next.has(col) ? next.delete(col) : next.add(col);
                                return next;
                              });
                            }}
                            className="hidden"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-200">{col}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Footer: Show/Hide All + Reset */}
                  <div className="flex items-center justify-between px-3 py-[7px]" style={{ borderTop: '1px solid #f1f1f1' }}>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      {(() => {
                        const allChecked = visibleCols.size === ALL_COLS.length;
                        return (
                          <>
                            <span
                              className="flex items-center justify-center h-5 w-5 rounded flex-shrink-0 transition-colors"
                              style={{ background: allChecked ? '#10B981' : '#fff', border: allChecked ? 'none' : '2px solid #d1d5db' }}
                            >
                              {allChecked && (
                                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={() => {
                                if (allChecked) setVisibleCols(new Set());
                                else setVisibleCols(new Set(ALL_COLS));
                              }}
                              className="sr-only"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-200">Show/Hide All</span>
                          </>
                        );
                      })()}
                    </label>
                    <button
                      onClick={() => setVisibleCols(new Set(ALL_COLS))}
                      className="text-sm font-semibold transition-colors hover:opacity-80"
                      style={{ color: '#10B981' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Import / Export dropdown */}
            <div className="relative flex-shrink-0 hidden md:flex" ref={importExportRef}>
              <button
                onClick={() => setImportExportOpen(o => !o)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 w-8 h-8 flex items-center justify-center"
                aria-label="Import / Export"
              >
                <MoreVertIcon className="h-5 w-5" />
              </button>

              {importExportOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-40 bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                  <button
                    onClick={() => { setImportExportOpen(false); setIsImportOpen(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Import
                  </button>
                  <button
                    onClick={() => { setImportExportOpen(false); exportContactsCsv(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <svg className="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 8l5-5 5 5M12 3v12" />
                    </svg>
                    Export
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Summary Cards */}
        <div className="block md:hidden flex gap-3 overflow-x-auto pb-4 pt-3.5 px-3.5 hide-scrollbar select-none border-b border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/5">
          {/* All Contacts */}
          <div className="flex-1 min-w-[105px] p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border-2 border-emerald-500 flex flex-col gap-3.5 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-555 whitespace-nowrap">All Contacts</span>
              <span className="text-lg font-black text-slate-850 dark:text-white leading-none mt-0.5">{contacts.length}</span>
            </div>
          </div>

          {/* Favorites */}
          <div className="flex-1 min-w-[105px] p-3 rounded-2xl bg-amber-500/[0.04] dark:bg-amber-950/10 border border-slate-200 dark:border-slate-800 flex flex-col gap-3.5 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-amber-100/60 dark:bg-amber-900/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-555 whitespace-nowrap">Favorites</span>
              <span className="text-lg font-black text-slate-850 dark:text-white leading-none mt-0.5">0</span>
            </div>
          </div>

          {/* Recently Added */}
          <div className="flex-1 min-w-[105px] p-3 rounded-2xl bg-emerald-500/[0.04] dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800 flex flex-col gap-3.5 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-555 whitespace-nowrap">Recently Added</span>
              <span className="text-lg font-black text-slate-850 dark:text-white leading-none mt-0.5">
                {contacts.filter(c => {
                  if (!c.createdAt) return false;
                  return (Date.now() - new Date(c.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
                }).length}
              </span>
            </div>
          </div>
        </div>

        {/* Table for Desktop */}
        <div className="hidden md:block flex-1 overflow-auto hide-scrollbar">
          <table className="min-w-full w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-10">
              {selectedContacts.length > 0 ? (
                <tr className="bg-white dark:bg-[#151B25]" style={{ borderBottom: '1px solid rgba(16,185,129,0.25)' }}>
                  <th className="px-4 py-3" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        paginatedContacts.length > 0 &&
                        selectedContacts.length === paginatedContacts.length
                      }
                      readOnly={paginatedContacts.length === 0}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                    />
                  </th>
                  <th colSpan={visibleCols.size + (visibleCols.has('Actions') ? 0 : 1)} className="px-2 py-3 text-left" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                    <span className="text-sm font-bold" style={{ color: '#10B981' }}>
                      {selectedContacts.length} Selected
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-right"
                    style={{
                      position: 'sticky',
                      right: 0,
                      backgroundColor: 'rgba(16,185,129,0.12)',
                    }}
                  >
                    <div className="flex items-center justify-end gap-3">
                      {selectedContacts.length >= 2 && (
                        <div className="relative group flex items-center justify-center">
                          <button
                            disabled={selectedContacts.length > 2}
                            onClick={() => {
                              if (selectedContacts.length === 2) {
                                setPrimaryMergeContactId(selectedContacts[0]);
                                setIsMergeModalOpen(true);
                              }
                            }}
                            aria-label="Merge selected"
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${selectedContacts.length > 2
                                ? 'text-slate-400 cursor-not-allowed opacity-60'
                                : 'text-[#10B981] hover:bg-[#10B981]/10'
                              }`}
                          >
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <path d="m8 6 4-4 4 4" />
                              <path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22" />
                              <path d="m20 22-5-5" />
                            </svg>
                          </button>

                          {/* Error tooltip for > 2 selection */}
                          {selectedContacts.length > 2 && (
                            <div className="absolute top-full mt-2 right-0 whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400 font-medium z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white dark:bg-[#1a2235] shadow-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg pointer-events-none">
                              Only two records can be merged
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        onClick={handleDeleteSelected}
                        aria-label="Delete selected"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-rose-500 hover:bg-rose-500/20 transition-all duration-200"
                      >
                        <DeleteIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                </tr>
              ) : (
                <tr className="bg-white dark:bg-[#151B25]">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={paginatedContacts.length > 0 && selectedContacts.length === paginatedContacts.length}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                    />
                  </th>
                  <TableHeader title1="First" title2="Name" />
                  {visibleCols.has('Last Name') && <TableHeader title1="Last" title2="Name" />}
                  {visibleCols.has('Contact Number') && <TableHeader title1="Contact" title2="Number" />}
                  {visibleCols.has('Email') && <TableHeader title1="Email" />}
                  {visibleCols.has('Account Name') && <TableHeader title1="Account" title2="Name" />}
                  {visibleCols.has('Assigned To') && <TableHeader title1="Assigned" title2="to" />}
                  {visibleCols.has('Created Date') && <TableHeader title1="Created" title2="Date" />}
                  {visibleCols.has('Updated Date') && <TableHeader title1="Updated" title2="Date" />}
                  {visibleCols.has('Actions') && <TableHeader title1="Actions" />}
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.size + 2} className="min-h-[calc(100vh-260px)]">
                    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-260px)] gap-5">
                      {/* Illustration */}
                      <div className="relative">
                        {/* Decorative dots — emerald/teal palette */}
                        <div className="absolute -top-4 -left-5 w-2.5 h-2.5 rounded-full bg-emerald-400/60 dark:bg-emerald-500/40" />
                        <div className="absolute -top-2 -right-6 w-2 h-2 rounded-full bg-teal-400/60 dark:bg-teal-500/40" />
                        <div className="absolute -bottom-3 -left-7 w-2 h-2 rounded-full bg-teal-300/70 dark:bg-teal-500/30" />
                        <div className="absolute bottom-1 -right-5 w-2.5 h-2.5 rounded-full bg-emerald-300/70 dark:bg-emerald-500/30" />
                        <div className="absolute top-1/2 -left-8 w-1.5 h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-700/50" />
                        <div className="absolute top-1/3 -right-7 w-1.5 h-1.5 rounded-full bg-teal-200 dark:bg-teal-700/50" />

                        {/* Browser/document card */}
                        <div className="w-24 h-20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-800/80 flex flex-col overflow-hidden shadow-lg shadow-emerald-100/60 dark:shadow-emerald-900/20">
                          {/* Gradient top bar */}
                          <div className="flex items-center gap-1 px-2.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                          </div>
                          {/* Content lines */}
                          <div className="flex-1 flex flex-col justify-center gap-1.5 px-2.5 py-2">
                            <div className="h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 w-full" />
                            <div className="h-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 w-4/5" />
                            <div className="h-1.5 rounded-full bg-emerald-50 dark:bg-slate-700 w-3/5" />
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
                        {search ? 'No Records Found!!!' : 'No contacts yet. Click "New Contact" to add one.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((contact) => {
                  const created = formatDate(contact.createdAt);
                  const updated = formatDate(contact.updatedAt);
                  const isSelected = selectedContacts.includes(contact.id);

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                      className={`transition-colors cursor-pointer ${isSelected ? 'bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectContact(contact.id, e as any)}
                          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(
                              contact.firstName || contact.lastName
                            )}`}
                          >
                            {getInitials(contact.firstName, contact.lastName)}
                          </div>
                          {contact.firstName}
                        </div>
                      </td>
                      {visibleCols.has('Last Name') && <td className="px-4 py-3">{contact.lastName}</td>}
                      {visibleCols.has('Contact Number') && <td className="px-4 py-3">{contact.contactNumber}</td>}
                      {visibleCols.has('Email') && <td className="px-4 py-3 text-slate-500 text-xs">{contact.email}</td>}
                      {visibleCols.has('Account Name') && <td className="px-4 py-3 text-slate-500 text-xs">{contact.accountName}</td>}
                      {visibleCols.has('Assigned To') && (
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-medium text-slate-500">
                            {contact.assignedTo === 'Unassigned' ? 'Unassigned' : getInitials(contact.assignedTo, '')}
                          </span>
                        </td>
                      )}
                      {visibleCols.has('Created Date') && (
                        <td className="px-4 py-3 text-slate-500 text-[11px] leading-tight text-center">
                          <div>{created.date}</div>
                          <div>{created.time}</div>
                        </td>
                      )}
                      {visibleCols.has('Updated Date') && (
                        <td className="px-4 py-3 text-slate-500 text-[11px] leading-tight text-center">
                          <div>{updated.date}</div>
                          <div>{updated.time}</div>
                        </td>
                      )}
                      {visibleCols.has('Actions') && (
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            {/* Edit button */}
                            <div className="relative group flex flex-col items-center">
                              <button
                                onClick={() => handleOpenModal(contact)}
                                aria-label={`Edit ${contact.firstName} ${contact.lastName}`}
                                className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 transition-all duration-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-400/40 group-hover:scale-110"
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                Edit
                              </span>
                            </div>
                            {/* Delete button */}
                            <div className="relative group flex flex-col items-center">
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                aria-label={`Delete ${contact.firstName} ${contact.lastName}`}
                                className="flex items-center justify-center w-8 h-8 rounded-full text-rose-500 hover:bg-rose-500/20 transition-all duration-200"
                              >
                                <DeleteIcon className="h-4 w-4" />
                              </button>
                              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                Delete
                              </span>
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card View for Mobile */}
        <div className="block md:hidden flex-1 overflow-y-auto pr-1 px-3 sm:px-4 py-3 hide-scrollbar">
          {/* Contacts count header */}
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 mb-3.5 select-none">
            {filteredContacts.length} / {contacts.length} Contacts
          </div>

          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-5 py-8">
              <div className="relative">
                <div className="absolute -top-4 -left-5 w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                <div className="absolute -top-2 -right-6 w-2 h-2 rounded-full bg-teal-400/60" />
                <div className="absolute -bottom-3 -left-7 w-2 h-2 rounded-full bg-teal-300/70" />
                <div className="absolute bottom-1 -right-5 w-2.5 h-2.5 rounded-full bg-emerald-300/70" />
                <div className="w-24 h-20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-800/80 flex flex-col overflow-hidden shadow-lg shadow-emerald-100/60">
                  <div className="flex items-center gap-1 px-2.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1.5 px-2.5 py-2">
                    <div className="h-1.5 rounded-full bg-emerald-100 w-full" />
                    <div className="h-1.5 rounded-full bg-teal-100 w-4/5" />
                  </div>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 tracking-wide text-center">
                {search ? 'No Records Found!!!' : 'No contacts yet. Click "New Contact" to add one.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredContacts.map((contact) => {
                const created = formatDate(contact.createdAt);
                const isSelected = selectedContacts.includes(contact.id);
                const fullName = `${contact.firstName} ${contact.lastName}`.trim() || 'No Name';
                return (
                  <div
                    key={contact.id}
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                    className={`p-4 rounded-3xl border shadow-sm backdrop-blur-2xl flex flex-col gap-3.5 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-150 ${isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white/85 dark:bg-slate-900/85 border-slate-200/80 dark:border-slate-800/80'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(
                            contact.firstName || contact.lastName
                          )}`}
                        >
                          {getInitials(contact.firstName, contact.lastName)}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {fullName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            Created {created.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenModal(contact)}
                          className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-emerald-500 hover:text-white transition-all"
                          title="Edit"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-full text-rose-500 hover:bg-rose-500/20 transition-all"
                          title="Delete"
                        >
                          <DeleteIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      {contact.contactNumber && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Phone</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{contact.contactNumber}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email</span>
                          <span className="text-slate-700 dark:text-slate-350 truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.accountName && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Account</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{contact.accountName}</span>
                        </div>
                      )}
                      {contact.assignedTo && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Assigned To</span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-medium text-slate-650 dark:text-slate-350 w-fit truncate max-w-full">
                            {contact.assignedTo}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredContacts.length > 0 && (
          <div className="hidden md:flex px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/80 items-center justify-end gap-4 text-sm text-slate-500 dark:text-slate-400">
            {/* Row Per page */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium whitespace-nowrap">Row Per page</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="appearance-none pl-2 pr-6 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2235] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0056D2] cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Range */}
            <span className="text-xs font-medium tabular-nums whitespace-nowrap">
              {(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, filteredContacts.length)} of {filteredContacts.length}
            </span>

            {/* Arrow buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center justify-center w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Previous page"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center justify-center w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Next page"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingContact ? 'Edit Contact' : 'Create Contact'}
        variant="drawer"
      >
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onClose={handleCloseModal}
          currentUserName={currentUserName}
        />
      </Modal>

      <Modal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        title="Merge Contacts"
        variant="drawer"
      >
        <div className="flex flex-col h-[calc(100vh-130px)]">
          <div className="flex-1 space-y-6">
            <p className="text-[15px] text-slate-700 dark:text-slate-300">
              Select the primary contact. The other contacts will be merged into this one.
            </p>

            <div className="space-y-4">
              {selectedContacts.map(id => {
                const contact = contacts.find(c => c.id === id);
                if (!contact) return null;

                const isPrimary = primaryMergeContactId === id;

                return (
                  <div
                    key={id}
                    onClick={() => setPrimaryMergeContactId(id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all ${isPrimary ? 'border-[#10B981] bg-[#10B981]/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-[#1a2235]'}`}
                  >
                    {/* Radio button */}
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isPrimary ? 'border-[#10B981]' : 'border-slate-300 dark:border-slate-600'}`}>
                      {isPrimary && <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-slate-900 dark:text-white">
                        {contact.firstName} {contact.lastName}
                      </span>
                      {contact.contactNumber && (
                        <span className="text-[13px] font-medium text-slate-500 mt-0.5">
                          {contact.contactNumber}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              onClick={() => setIsMergeModalOpen(false)}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const secondaryId = selectedContacts.find(id => id !== primaryMergeContactId);
                if (secondaryId) {
                  setContacts(contacts.filter(c => c.id !== secondaryId));
                  setSelectedContacts([]);
                  setIsMergeModalOpen(false);
                  setSuccessMessage('Contacts Merged Successfully');
                }
              }}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] transition-colors shadow-sm"
            >
              Merge
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Contacts Modal */}
      {isImportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { setIsImportOpen(false); setImportFile(null); }}
        >
          <div
            className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 dark:border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import Contacts</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Import Contacts through a CSV file.{' '}
                <a
                  href="#"
                  className="hover:underline font-medium"
                  style={{ color: '#10B981' }}
                  onClick={e => { e.preventDefault(); downloadSampleCsv(); }}
                >
                  Download a sample csv.
                </a>
              </p>

              {/* File picker */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-20 shrink-0">
                  CSV file:
                </span>
                <label className="flex items-center gap-2 cursor-pointer group">
                  {/* File icon */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <svg className="h-4 w-4" style={{ color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span
                    className="text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.color = '#10B981')}
                    onMouseLeave={e => (e.currentTarget.style.color = '')}
                  >
                    {importFile ? importFile.name : 'Choose file'}
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={e => setImportFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => { setIsImportOpen(false); setImportFile(null); }}
                className="px-5 py-2 rounded-full text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!importFile}
                onClick={() => {
                  if (!importFile) return;

                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const text = e.target?.result as string;
                    if (!text) return;

                    // ── CSV parser (handles quoted fields) ──
                    const parseRow = (line: string): string[] => {
                      const result: string[] = [];
                      let cur = '';
                      let inQuotes = false;
                      for (let i = 0; i < line.length; i++) {
                        const ch = line[i];
                        if (ch === '"') {
                          if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
                          else { inQuotes = !inQuotes; }
                        } else if (ch === ',' && !inQuotes) {
                          result.push(cur.trim()); cur = '';
                        } else {
                          cur += ch;
                        }
                      }
                      result.push(cur.trim());
                      return result;
                    };

                    const lines = text.split(/\r?\n/).filter(l => l.trim());
                    if (lines.length < 2) return;

                    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, ''));
                    const idx = (names: string[]) => {
                      for (const n of names) {
                        const i = headers.indexOf(n.toLowerCase().replace(/\s+/g, ''));
                        if (i !== -1) return i;
                      }
                      return -1;
                    };

                    const col = {
                      firstName: idx(['firstname', 'first name']),
                      lastName: idx(['lastname', 'last name']),
                      contactNumber: idx(['contactnumber', 'contact number', 'phone']),
                      email: idx(['email']),
                      nationalId: idx(['nationalid', 'national id']),
                      address: idx(['address']),
                      city: idx(['city']),
                      country: idx(['country']),
                      accountName: idx(['accountname', 'account name']),
                      assignedTo: idx(['assignedto', 'assigned to']),
                    };

                    const now = new Date().toISOString();
                    const imported: Contact[] = lines.slice(1).map((line, i) => {
                      const cells = parseRow(line);
                      const get = (c: number) => (c !== -1 ? cells[c] ?? '' : '');
                      return {
                        id: `imp_con_${Date.now()}_${i}`,
                        firstName: get(col.firstName),
                        lastName: get(col.lastName),
                        email: get(col.email),
                        contactNumber: get(col.contactNumber),
                        nationalId: get(col.nationalId),
                        address: get(col.address),
                        city: get(col.city),
                        country: get(col.country),
                        accountName: get(col.accountName),
                        assignedTo: get(col.assignedTo) || currentUserName,
                        lifecycle: 'NA',
                        labels: '',
                        createdAt: now,
                        updatedAt: now,
                      };
                    }).filter(c => c.firstName || c.lastName); // skip empty rows

                    const existingEmails = new Set(
                      contacts.filter(c => c.email).map(c => c.email.toLowerCase())
                    );

                    const duplicateContacts = imported.filter(
                      c => c.email && existingEmails.has(c.email.toLowerCase())
                    );

                    const newContacts = imported.filter(
                      c => !c.email || !existingEmails.has(c.email.toLowerCase())
                    );

                    if (duplicateContacts.length > 0) {
                      setErrorMessage('Records already exist');
                    }

                    if (newContacts.length > 0) {
                      setContacts(prev => [...newContacts, ...prev]);
                      setSuccessMessage(`${newContacts.length} Contact${newContacts.length !== 1 ? 's' : ''} Imported Successfully`);
                    }

                    setIsImportOpen(false);
                    setImportFile(null);
                  };
                  reader.readAsText(importFile);
                }}
                className="px-5 py-2 rounded-full text-sm font-bold text-white shadow-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#10B981' }}
                onMouseEnter={e => !importFile || (e.currentTarget.style.backgroundColor = '#059669')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#10B981')}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.5rem',
            zIndex: 9999,
            animation: 'slideDownFade 0.35s ease',
          }}
        >
          <style>{`
            @keyframes slideDownFade {
              from { opacity: 0; transform: translateY(-16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/30 bg-emerald-600 text-white text-sm font-bold relative overflow-hidden"
            style={{ minWidth: 260 }}
          >
            {/* Check icon */}
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 shrink-0">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {successMessage}
            {/* Auto-close progress bar */}
            <div
              className="absolute bottom-0 left-0 h-1 rounded-b-2xl bg-white/30"
              style={{ animation: 'shrink 3s linear forwards' }}
            />
            <style>{`
              @keyframes shrink {
                from { width: 100%; }
                to   { width: 0%; }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div
          style={{
            position: 'fixed',
            top: successMessage ? '5rem' : '1.25rem',
            right: '1.5rem',
            zIndex: 9999,
            animation: 'slideDownFade 0.35s ease',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border border-rose-400/30 bg-rose-600 text-white text-sm font-bold relative overflow-hidden"
            style={{ minWidth: 260 }}
          >
            {/* Warning icon */}
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 shrink-0">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            {errorMessage}
            {/* Auto-close progress bar */}
            <div
              className="absolute bottom-0 left-0 h-1 rounded-b-2xl bg-white/30"
              style={{ animation: 'shrink 3s linear forwards' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
