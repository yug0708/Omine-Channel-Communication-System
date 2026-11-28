import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Account } from '../types';
import { COUNTRIES } from '../data/countries';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import {
  PlusIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
} from '../components/icons/Icons';
import CountryCodePicker from '../components/ui/CountryCodePicker';
import FullScreenLoader from '../components/ui/FullScreenLoader';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-indigo-500',
];

const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

const formatDate = (dateString: string): { date: string; time: string } => {
  const d = new Date(dateString);
  return {
    date: d.toLocaleDateString('en-GB'),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const AccountAvatar: React.FC<{ name: string }> = ({ name }) => (
  <div
    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(name)}`}
  >
    {getInitials(name)}
  </div>
);

interface TableHeaderProps {
  children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide whitespace-nowrap">
    <div className="flex items-center gap-1">
      {children}
    </div>
  </th>
);

// ─── Form ─────────────────────────────────────────────────────────────────────

type AccountFormData = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY_FORM: AccountFormData = {
  name: '',
  website: '',
  email: '',
  phone: '',
  address: '',
  crNumber: '',
  assignedTo: '',
  country: '',
  city: '',
  pincode: '',
};

interface CountryDialCode {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES_DIAL_CODES: CountryDialCode[] = COUNTRIES.map((c) => ({
  name: c.name,
  code: c.code,
  flag: c.flag,
  dialCode: c.dial_code,
}));

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

const inputClass =
  'mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition';

const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

// Floating label field wrapper — defined at module scope to prevent
// React from recreating it as a new component type on every render,
// which would cause inputs inside it to lose focus after each keystroke.
const FloatField: React.FC<{
  label: string;
  fieldName: string;
  children: React.ReactNode;
  error?: string;
  errors?: Record<string, string>;
}> = ({ label, fieldName, children, error, errors = {} }) => (
  <div className="relative mt-5">
    <label
      className={`absolute -top-2.5 left-4 px-1.5 text-[11px] font-semibold z-10 bg-white dark:bg-[#111111] ${errors[fieldName] ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
        }`}
    >
      {label}
    </label>
    {children}
    {error && (
      <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold mt-1.5 pl-4">{error}</p>
    )}
  </div>
);

export const AccountForm: React.FC<{
  account?: Account | null;
  onSave: (data: AccountFormData & Partial<Pick<Account, 'id' | 'createdAt' | 'updatedAt'>>) => void | Promise<void>;
  onClose: () => void;
  currentUserName?: string;
  isSaving?: boolean;
}> = ({ account, onSave, onClose, currentUserName = '', isSaving: externalIsSaving = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoading = isSubmitting || externalIsSaving;
  // Helper to extract initial country code and clean local number from account.phone
  const parsedPhoneData = React.useMemo(() => {
    const raw = (account?.phone || '').trim();
    if (!raw) {
      return { code: 'IN', localNumber: '' };
    }
    // Sort COUNTRIES by dial_code length descending (e.g. +966 before +91 before +1)
    const sorted = [...COUNTRIES].sort((a, b) => b.dial_code.length - a.dial_code.length);
    for (const c of sorted) {
      if (raw.startsWith(c.dial_code)) {
        return {
          code: c.code,
          localNumber: raw.slice(c.dial_code.length).trim(),
        };
      }
      const rawDial = c.dial_code.replace('+', '');
      if (raw.startsWith(rawDial) && !raw.startsWith('+')) {
        return {
          code: c.code,
          localNumber: raw.slice(rawDial.length).trim(),
        };
      }
    }
    return { code: 'IN', localNumber: raw };
  }, [account?.phone]);

  const [phoneCountryCode, setPhoneCountryCode] = useState(parsedPhoneData.code);
  const [form, setForm] = useState<AccountFormData>({
    name: account?.name ?? '',
    website: account?.website ?? '',
    email: account?.email ?? '',
    phone: parsedPhoneData.localNumber,
    address: account?.address ?? '',
    crNumber: account?.crNumber ?? '',
    // Pre-fill with current user when creating; keep existing value when editing
    assignedTo: account?.assignedTo ?? currentUserName,
    country: account?.country ?? '',
    city: account?.city ?? '',
    pincode: account?.pincode ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Custom Country Dropdown States & Ref
  const countryDropdownRef = React.useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Assignee Dropdown
  const assigneeDropdownRef = React.useRef<HTMLDivElement>(null);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

  // Available users list (currently just the logged-in user)
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
    const updatedForm = { ...form, assignedTo: form.assignedTo === name ? '' : name };
    setForm(updatedForm);
    setIsAssigneeOpen(false);
    if (isSubmitted) setErrors(validate(updatedForm));
  };

  const handleRemoveAssignee = () => {
    const updatedForm = { ...form, assignedTo: '' };
    setForm(updatedForm);
    if (isSubmitted) setErrors(validate(updatedForm));
  };

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const validate = (currentForm = form, currentPhoneCode = phoneCountryCode) => {
    const newErrors: Record<string, string> = {};
    if (!currentForm.name.trim()) {
      newErrors.name = 'Account Name must be at least 1 characters.';
    }
    if (!currentForm.email.trim()) {
      newErrors.email = 'Email is required!';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!currentForm.phone.trim()) {
      newErrors.phone = 'Phone Number is required!';
    } else {
      const digits = currentForm.phone.replace(/\D/g, '');
      const rule = PHONE_RULES[currentPhoneCode];
      const country = COUNTRIES.find(c => c.code === currentPhoneCode);
      const countryName = country?.name || currentPhoneCode;
      const dialCode = country?.dial_code || '';
      if (rule) {
        const [min, max] = rule;
        if (digits.length < min || digits.length > max) {
          newErrors.phone = min === max
            ? `${countryName} (${dialCode}) phone numbers must be exactly ${min} digits.`
            : `${countryName} (${dialCode}) phone numbers must be ${min}–${max} digits.`;
        }
      }
    }
    if (!currentForm.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned To is required!';
    }
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const sanitized = value.replace(/[^\d\s-]/g, '');
      const updatedForm = { ...form, phone: sanitized };
      setForm(updatedForm);
      const allErrors = validate(updatedForm, phoneCountryCode);
      setErrors(prev => ({ ...prev, phone: allErrors.phone || '' }));
      if (isSubmitted) setErrors(validate(updatedForm, phoneCountryCode));
      return;
    }
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    if (name === 'email') {
      const allErrors = validate(updatedForm, phoneCountryCode);
      setErrors(prev => ({ ...prev, email: allErrors.email || '' }));
    } else if (isSubmitted) {
      setErrors(validate(updatedForm, phoneCountryCode));
    }
  };

  const handlePhoneCountryChange = (code: string) => {
    setPhoneCountryCode(code);
    const allErrors = validate(form, code);
    setErrors(prev => ({ ...prev, phone: allErrors.phone || '' }));
    if (isSubmitted) setErrors(validate(form, code));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsSubmitted(true);
    const validationErrors = validate(form, phoneCountryCode);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Combine selected country dial code with the entered phone number
    const selectedCountry = COUNTRIES.find((c) => c.code === phoneCountryCode);
    const dialCode = selectedCountry?.dial_code || '+91';
    const trimmedPhone = form.phone.trim();
    const cleanDial = dialCode.replace('+', '');

    let finalPhone = trimmedPhone;
    if (trimmedPhone) {
      if (!trimmedPhone.startsWith(dialCode) && !trimmedPhone.startsWith(`+${cleanDial}`)) {
        finalPhone = `${dialCode} ${trimmedPhone}`;
      } else if (trimmedPhone.startsWith(cleanDial) && !trimmedPhone.startsWith('+')) {
        finalPhone = `+${trimmedPhone}`;
      }
    }

    try {
      setIsSubmitting(true);
      await onSave({
        ...form,
        phone: finalPhone,
        ...(account ? { id: account.id, createdAt: account.createdAt } : {}),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName: string, extraClasses = '') => {
    const hasError = errors[fieldName];
    const base = 'block w-full rounded-full bg-white dark:bg-[#111111] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition';
    if (hasError) {
      return `${base} border-2 border-rose-500 dark:border-rose-500 focus:ring-0 ${extraClasses}`;
    }
    return `${base} border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-0 ${extraClasses}`;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <fieldset disabled={isLoading} className="border-0 p-0 m-0 min-w-0 space-y-4 disabled:opacity-80">

      {/* ── Basic Information Section ── */}
      <div className="flex items-center gap-3 pt-1 pb-2">
        <div className="w-1 h-5 rounded-full bg-emerald-500" />
        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Basic Information</span>
      </div>

      {/* 1. Account Name */}
      <FloatField label="Account Name *" fieldName="name" error={errors.name} errors={errors}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter account name"
          className={getInputClass('name')}
        />
      </FloatField>

      {/* 2. Email */}
      <FloatField label="Email *" fieldName="email" error={errors.email} errors={errors}>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email address"
          className={getInputClass('email')}
        />
      </FloatField>

      {/* 3. Phone Number */}
      <FloatField label="Phone Number *" fieldName="phone" error={errors.phone} errors={errors}>
        <div className={`flex items-center w-full rounded-full border bg-white dark:bg-[#111111] text-sm text-slate-900 dark:text-white ${errors.phone ? 'border-2 border-rose-500' : 'border border-slate-300 dark:border-slate-700 focus-within:border-emerald-500'
          }`}>
          <div className="flex-shrink-0 self-stretch flex items-center border-r border-slate-200 dark:border-slate-700">
            <CountryCodePicker value={phoneCountryCode} onChange={handlePhoneCountryChange} />
          </div>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            maxLength={PHONE_RULES[phoneCountryCode] ? PHONE_RULES[phoneCountryCode][1] : 15}
            className="w-full px-4 py-3 bg-transparent focus:outline-none placeholder-slate-400 text-sm"
          />
        </div>
      </FloatField>

      {/* ── Address Information Section ── */}
      <div className="flex items-center gap-3 pt-3 pb-2">
        <div className="w-1 h-5 rounded-full bg-emerald-500" />
        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Address Information</span>
      </div>

      {/* 4. City */}
      <FloatField label="City" fieldName="city" errors={errors}>
        <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Enter city" className={getInputClass('city')} />
      </FloatField>

      {/* 5. Country */}
      <FloatField label="Country" fieldName="country" errors={errors}>
        <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="Enter country" className={getInputClass('country')} />
      </FloatField>

      {/* 6. CR Number */}
      <FloatField label="CR Number" fieldName="crNumber" errors={errors}>
        <input type="text" name="crNumber" value={form.crNumber} onChange={handleChange} placeholder="Enter CR number" className={getInputClass('crNumber')} />
      </FloatField>

      {/* 7. Pincode */}
      <FloatField label="Pincode" fieldName="pincode" errors={errors}>
        <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="Enter pincode" className={getInputClass('pincode')} />
      </FloatField>

      {/* 8. Website */}
      <FloatField label="Website" fieldName="website" errors={errors}>
        <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="Enter website URL" className={getInputClass('website')} />
      </FloatField>

      {/* 9. Address */}
      <FloatField label="Address" fieldName="address" errors={errors}>
        <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Enter address" className={getInputClass('address')} />
      </FloatField>

      {/* ── Assignment Section ── */}
      <div className="flex items-center gap-3 pt-3 pb-2">
        <div className="w-1 h-5 rounded-full bg-emerald-500" />
        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Assignment</span>
      </div>

      {/* 10. Assigned to – chip selector */}
      <div ref={assigneeDropdownRef} className="relative">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          Assigned To *
        </label>

        {/* Chip input box */}
        <div
          onClick={() => setIsAssigneeOpen((o) => !o)}
          className={`min-h-[42px] flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${errors.assignedTo
            ? 'border-2 border-rose-500 dark:border-rose-500'
            : isAssigneeOpen
              ? 'border-2 border-emerald-500'
              : 'border border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-800`}
        >
          {form.assignedTo ? (
            <>
              {/* Selected chip */}
              <span className="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${getAvatarColor(form.assignedTo)}`}>
                  {getInitials(form.assignedTo)}
                </span>
                {form.assignedTo}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemoveAssignee(); }}
                  className="ml-0.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Add Recipients</span>
            </>
          ) : (
            <span className="text-sm text-slate-400 dark:text-slate-500">Add Recipients</span>
          )}

          {/* Clear all button */}
          {form.assignedTo && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemoveAssignee(); }}
              className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isAssigneeOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            {availableUsers.length === 0 ? (
              <p className="px-4 py-3 text-xs text-slate-400">No users available</p>
            ) : (
              availableUsers.map((u) => {
                const isSelected = form.assignedTo === u.name;
                return (
                  <button
                    key={u.name}
                    type="button"
                    onClick={() => handleSelectAssignee(u.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    {/* Checkmark */}
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {/* Avatar */}
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(u.name)}`}>
                      {getInitials(u.name)}
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
          <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold mt-1.5 pl-0.5">
            {errors.assignedTo}
          </p>
        )}
      </div>

      </fieldset>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-5 py-2 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[90px]"
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{account ? 'Updating…' : 'Saving…'}</span>
            </>
          ) : (
            account ? 'Update Account' : 'Save'
          )}
        </button>
      </div>

      {/* Full-Screen Loading Overlay */}
      <FullScreenLoader
        isLoading={isLoading}
        title={account ? 'Updating Account…' : 'Creating Account…'}
        message="Please wait while the record is being saved"
      />
    </form>
  );
};

// ─── Checkbox style ───────────────────────────────────────────────────────────

const checkboxClasses =
  'h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600';

// ─── Main Page ────────────────────────────────────────────────────────────────

const ROW_OPTIONS = [5, 10, 25];

// ─── Sample CSV Download ──────────────────────────────────────────────────────

const downloadSampleCsv = () => {
  const headers = ['Name', 'Address', 'CrNumber', 'Phone Number', 'Email', 'Website', 'Pincode', 'City', 'Country'];
  const rows = [
    ['BrightWave Technologies', '123 Main St', '1000012345', '12025550001', 'info@brightwave.com', 'www.brightwave.com', '10001', 'New York', 'United States'],
    ['Skyline Solutions', '456 Market St', '1000067890', '13105550002', 'contact@skylinesolutions.com', 'www.skylinesolutions.com', '94105', 'San Francisco', 'United States'],
    ['BluePeak LLC', '789 Sunset Blvd', '1000011223', '12135550003', 'support@bluepeakllc.com', 'www.bluepeakllc.com', '90028', 'Los Angeles', 'United States'],
    ['RiverStone Inc', '321 Oak Ave', '1000044556', '17135550004', 'hello@riverstoneinc.com', 'www.riverstoneinc.com', '60601', 'Chicago', 'United States'],
    ['NextGen Group', '654 Pine St', '1000077889', '18325550005', 'team@nextgengroup.com', 'www.nextgengroup.com', '77002', 'Houston', 'United States'],
    ['NovaTech Systems', '987 Broadway', '1000099001', '12065550006', 'sales@novatechsystems.com', 'www.novatechsystems.com', '98101', 'Seattle', 'United States'],
    ['Liberty Co', '101 Washington Ave', '1000022334', '13035550007', 'admin@libertyco.com', 'www.libertyco.com', '33131', 'Miami', 'United States'],
    ['Evergreen Enterprises', '202 Elm St', '1000055667', '16175550008', 'info@evergreenent.com', 'www.evergreenent.com', '85004', 'Phoenix', 'United States'],
    ['Summit Partners', '303 Lake Shore Dr', '1000088990', '16125550009', 'partners@summitpartners.com', 'www.summitpartners.com', '80202', 'Denver', 'United States'],
    ['Pioneer Systems', '404 Central Ave', '1000033445', '16195550010', 'service@pioneersystems.com', 'www.pioneersystems.com', '30303', 'Atlanta', 'United States']
  ];

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample_accounts.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Accounts: React.FC = () => {
  const { accounts, setAccounts, saveAccount, deleteAccount, deleteAccountsBatch } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : '';

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Selection state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Delete confirm modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ ids: string[]; count: number } | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletingAccountCount, setDeletingAccountCount] = useState(1);

  // Import/Export dropdown state
  const [importExportOpen, setImportExportOpen] = useState(false);
  const importExportRef = React.useRef<HTMLDivElement>(null);

  // Import modal state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Column visibility
  const ALL_COLS = ['Website', 'Email', 'Phone', 'Address', 'CR Number', 'Assigned To', 'Country', 'Created Date', 'Updated Date', 'Actions'] as const;
  type ColKey = typeof ALL_COLS[number];
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(new Set(ALL_COLS));
  const [colToggleOpen, setColToggleOpen] = useState(false);
  const [colSearch, setColSearch] = useState('');
  const colToggleRef = React.useRef<HTMLDivElement>(null);

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

  // Search & pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROW_OPTIONS[1]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.assignedTo.toLowerCase().includes(q)
    );
  }, [accounts, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const paginatedAccounts = filtered.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenModal = (account: Account | null = null) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSavingAccount) return;
    setEditingAccount(null);
    setIsModalOpen(false);
  };

  const handleSaveAccount = async (
    data: AccountFormData & Partial<Pick<Account, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    setIsSavingAccount(true);
    try {
      await saveAccount(data);
      setSuccessMessage(data.id ? 'Account Updated Successfully' : 'Account Created Successfully');
      setEditingAccount(null);
      setIsModalOpen(false);
    } catch (err) {
      setErrorMessage('Failed to save account');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleDeleteAccount = (id: string) => {
    setDeleteConfirm({ ids: [id], count: 1 });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAccounts(paginatedAccounts.map((a) => a.id));
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedAccounts.length) return;
    setDeleteConfirm({ ids: [...selectedAccounts], count: selectedAccounts.length });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const count = deleteConfirm.count;
    const ids = deleteConfirm.ids;
    setDeletingAccountCount(count);
    setIsDeletingAccount(true);
    try {
      if (ids.length === 1) {
        await deleteAccount(ids[0]);
      } else {
        await deleteAccountsBatch(ids);
      }
      setSelectedAccounts((prev) => prev.filter((s) => !ids.includes(s)));
      setSuccessMessage(`Record${count > 1 ? 's' : ''} Deleted Successfully`);
    } catch (err) {
      setErrorMessage('Failed to delete records');
    } finally {
      setIsDeletingAccount(false);
      setDeleteConfirm(null);
    }
  };

  const exportAccountsCsv = () => {
    const headers = ['Name', 'Website', 'Email', 'Phone Number', 'Address', 'CR Number', 'Assigned To', 'Country', 'Pincode', 'City', 'Created Date', 'Updated Date'];
    const rows = accounts.map(a => [
      a.name || '',
      a.website || '',
      a.email || '',
      a.phone || '',
      a.address || '',
      a.crNumber || '',
      a.assignedTo || '',
      a.country || '',
      a.pincode || '',
      a.city || '',
      a.createdAt ? new Date(a.createdAt).toLocaleString() : '',
      a.updatedAt ? new Date(a.updatedAt).toLocaleString() : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `accounts_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccessMessage(`${accounts.length} Account${accounts.length !== 1 ? 's' : ''} Exported Successfully`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full gap-3 sm:gap-4">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">Accounts</h1>
        <p className="text-sm text-slate-500">Companies you work with.</p>
      </div>

      <div className="bg-white dark:bg-[#111111] shadow-sm rounded-[10px] border border-slate-200 dark:border-white/10 flex flex-col flex-1 overflow-hidden">

        {/* Toolbar */}
        <div className="p-3 sm:p-4 flex items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800/80">
          {/* New Account Button */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-2 sm:px-4 sm:py-2 rounded-full text-sm font-bold shadow-md shadow-emerald-500/10 flex items-center justify-center transition-all duration-200 flex-shrink-0"
            title="New Account"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">New Account</span>
          </button>

          {/* Search bar and Action controls on the right */}
          <div className="flex items-center gap-2.5 flex-1 justify-end">
            {/* Search bar expanding to fill space */}
            <div className="relative flex-1 md:max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search accounts…"
                className="pl-9 pr-4 py-1.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full transition"
              />
            </div>

            {/* Action controls grouped on the right */}
            <div className="flex items-center gap-2 flex-shrink-0">
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
                  <div
                    className="absolute right-0 top-[calc(100%+6px)] z-50 bg-white dark:bg-[#1e2a3a] rounded-xl overflow-hidden"
                    style={{ width: 220, boxShadow: '0 4px 24px rgba(0,0,0,0.13)', border: '1px solid #e5e7eb' }}
                  >
                    {/* Search */}
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
                          className="w-full pl-7 pr-3 py-1.5 text-sm rounded-md focus:outline-none focus:border-emerald-500"
                          style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151' }}
                        />
                      </div>
                    </div>

                    {/* Account Name — always locked */}
                    <div className="flex items-center gap-2.5 px-3 py-[7px]" style={{ opacity: 0.55 }}>
                      <span className="flex items-center justify-center h-5 w-5 rounded" style={{ background: '#10B981', flexShrink: 0 }}>
                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">Account Name</span>
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
                              className="sr-only"
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
                        className="text-sm font-semibold transition-colors"
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
                  className="flex items-center justify-center w-8 h-8 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  aria-label="Import / Export"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {importExportOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-40 bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                    {/* Import */}
                    <button
                      onClick={() => { setImportExportOpen(false); setIsImportOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      Import
                    </button>
                    {/* Export */}
                    <button
                      onClick={() => { setImportExportOpen(false); exportAccountsCsv(); }}
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
        </div>


        {/* Table for Desktop */}
        <div className="hidden md:block flex-1 overflow-auto hide-scrollbar">
          <table className="min-w-[900px] w-full whitespace-nowrap text-left text-sm">
            <thead className="sticky top-0 z-10">
              {/* Selection Banner Row — replaces headers when rows are selected */}
              {selectedAccounts.length > 0 ? (
                <tr className="bg-white dark:bg-[#111111]" style={{ borderBottom: '1px solid rgba(16,185,129,0.25)' }}>
                  <th className="px-4 py-3" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                    <input
                      type="checkbox"
                      className={checkboxClasses}
                      onChange={handleSelectAll}
                      checked={
                        paginatedAccounts.length > 0 &&
                        selectedAccounts.length === paginatedAccounts.length
                      }
                      readOnly={paginatedAccounts.length === 0}
                    />
                  </th>
                  <th colSpan={10} className="px-2 py-3" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                    <span className="text-sm font-bold" style={{ color: '#10B981' }}>
                      {selectedAccounts.length} Selected
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
                    <button
                      onClick={handleDeleteSelected}
                      aria-label="Delete selected"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-rose-500 hover:bg-rose-500/20 transition-all duration-200"
                    >
                      <DeleteIcon className="h-4 w-4" />
                    </button>
                  </th>
                </tr>
              ) : (
                <tr className="bg-white dark:bg-[#111111] border-b border-slate-200 dark:border-slate-800/80">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      className={checkboxClasses}
                      onChange={handleSelectAll}
                      checked={
                        paginatedAccounts.length > 0 &&
                        selectedAccounts.length === paginatedAccounts.length
                      }
                      readOnly={paginatedAccounts.length === 0}
                    />
                  </th>
                  <TableHeader>Account Name</TableHeader>
                  {visibleCols.has('Website') && <TableHeader>Website</TableHeader>}
                  {visibleCols.has('Email') && <TableHeader>Email</TableHeader>}
                  {visibleCols.has('Phone') && <TableHeader>Phone</TableHeader>}
                  {visibleCols.has('Address') && <TableHeader>Address</TableHeader>}
                  {visibleCols.has('CR Number') && <TableHeader>CR Number</TableHeader>}
                  {visibleCols.has('Assigned To') && <TableHeader>Assigned To</TableHeader>}
                  {visibleCols.has('Country') && <TableHeader>Country</TableHeader>}
                  {visibleCols.has('Created Date') && <TableHeader>Created Date</TableHeader>}
                  {visibleCols.has('Updated Date') && <TableHeader>Updated Date</TableHeader>}
                  {visibleCols.has('Actions') && <TableHeader>Actions</TableHeader>}
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="min-h-[calc(100vh-260px)]">
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
                        {search ? 'No Records Found!!!' : 'No accounts yet. Click "New Account" to add one.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account) => {
                  const { date: createdDate, time: createdTime } = formatDate(account.createdAt);
                  const { date: updatedDate, time: updatedTime } = formatDate(account.updatedAt);
                  const isSelected = selectedAccounts.includes(account.id);

                  return (
                    <tr
                      key={account.id}
                      className={`transition-colors ${isSelected
                        ? 'bg-emerald-500/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                        }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          className={checkboxClasses}
                          checked={isSelected}
                          onChange={() => handleSelectOne(account.id)}
                        />
                      </td>

                      {/* Name */}
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <AccountAvatar name={account.name} />
                          <span
                            onClick={() => navigate(`/accounts/${account.id}`)}
                            onMouseEnter={e => (e.currentTarget.style.color = '#10B981')}
                            onMouseLeave={e => (e.currentTarget.style.color = '')}
                            className="font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer transition-colors duration-150"
                          >
                            {account.name}
                          </span>
                        </div>
                      </td>

                      {/* Website */}
                      {visibleCols.has('Website') && (
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                          {account.website ? (
                            <a
                              href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-emerald-500 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {account.website}
                            </a>
                          ) : '—'}
                        </td>
                      )}

                      {/* Email */}
                      {visibleCols.has('Email') && (
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{account.email || '—'}</td>
                      )}

                      {/* Phone */}
                      {visibleCols.has('Phone') && (
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{account.phone || '—'}</td>
                      )}

                      {/* Address */}
                      {visibleCols.has('Address') && (
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400 max-w-[180px] truncate">{account.address || '—'}</td>
                      )}

                      {/* CR Number */}
                      {visibleCols.has('CR Number') && (
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{account.crNumber || '—'}</td>
                      )}

                      {/* Assigned To */}
                      {visibleCols.has('Assigned To') && (
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{account.assignedTo || '—'}</td>
                      )}

                      {/* Country */}
                      {visibleCols.has('Country') && (
                        <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{account.country || '—'}</td>
                      )}

                      {/* Created */}
                      {visibleCols.has('Created Date') && (
                        <td className="px-4 py-2 text-slate-900 dark:text-white">
                          <div>{createdDate}</div>
                          <div className="text-xs text-slate-400">{createdTime}</div>
                        </td>
                      )}

                      {/* Updated */}
                      {visibleCols.has('Updated Date') && (
                        <td className="px-4 py-2 text-slate-900 dark:text-white">
                          <div>{updatedDate}</div>
                          <div className="text-xs text-slate-400">{updatedTime}</div>
                        </td>
                      )}

                      {/* Actions */}
                      {visibleCols.has('Actions') && (
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Edit button */}
                            <div className="relative group flex flex-col items-center">
                              <button
                                onClick={() => handleOpenModal(account)}
                                aria-label={`Edit ${account.name}`}
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
                                onClick={() => handleDeleteAccount(account.id)}
                                aria-label={`Delete ${account.name}`}
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
          {paginatedAccounts.length === 0 ? (
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
                {search ? 'No Records Found!!!' : 'No accounts yet. Click "New Account" to add one.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedAccounts.map((account) => {
                const { date } = formatDate(account.createdAt);
                return (
                  <div
                    key={account.id}
                    onClick={() => navigate(`/accounts/${account.id}`)}
                    className="p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 shadow-sm backdrop-blur-2xl flex flex-col gap-3.5 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AccountAvatar name={account.name} />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {account.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            Created {date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenModal(account)}
                          className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-emerald-500 hover:text-white transition-all"
                          title="Edit"
                        >
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-full text-rose-500 hover:bg-rose-500/20 transition-all"
                          title="Delete"
                        >
                          <DeleteIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      {account.email && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{account.email}</span>
                        </div>
                      )}
                      {account.phone && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Phone</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{account.phone}</span>
                        </div>
                      )}
                      {account.website && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Website</span>
                          <a
                            href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline truncate"
                            onClick={e => e.stopPropagation()}
                          >
                            {account.website}
                          </a>
                        </div>
                      )}
                      {account.country && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Country</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{account.country}</span>
                        </div>
                      )}
                      {account.assignedTo && (
                        <div className="flex flex-col col-span-2 min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Assigned To</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate">{account.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end gap-4 text-sm text-slate-500 dark:text-slate-400">
            {/* Row Per page */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium whitespace-nowrap">Row Per page</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                  className="appearance-none pl-2 pr-6 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111111] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {ROW_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Range */}
            <span className="text-xs font-medium tabular-nums whitespace-nowrap">
              {(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, filtered.length)} of {filtered.length}
            </span>

            {/* Arrow buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center justify-center w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Previous page"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAccount ? 'Edit Account' : 'Create Account'}
        variant="drawer"
      >
        <AccountForm
          account={editingAccount}
          onSave={handleSaveAccount}
          onClose={handleCloseModal}
          currentUserName={currentUserName}
          isSaving={isSavingAccount}
        />
      </Modal>

      {/* Import Accounts Modal */}
      {isImportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { setIsImportOpen(false); setImportFile(null); }}
        >
          <div
            className="bg-white dark:bg-[#111111] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 dark:border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import Accounts</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Import Accounts through a CSV file.{' '}
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

                    // Build a header→index map (case-insensitive)
                    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, ''));
                    const idx = (names: string[]) => {
                      for (const n of names) {
                        const i = headers.indexOf(n.toLowerCase().replace(/\s+/g, ''));
                        if (i !== -1) return i;
                      }
                      return -1;
                    };

                    const col = {
                      name: idx(['name']),
                      address: idx(['address']),
                      crNumber: idx(['crnumber', 'cr number', 'crnumber']),
                      phone: idx(['phonenumber', 'phone number', 'phone']),
                      email: idx(['email']),
                      website: idx(['website']),
                      pincode: idx(['pincode', 'zip', 'postal']),
                      city: idx(['city']),
                      country: idx(['country']),
                      assignedTo: idx(['assignedto', 'assigned to']),
                    };

                    const now = new Date().toISOString();
                    const imported: Account[] = lines.slice(1).map((line, i) => {
                      const cells = parseRow(line);
                      const get = (c: number) => (c !== -1 ? cells[c] ?? '' : '');
                      return {
                        id: `imp_${Date.now()}_${i}`,
                        name: get(col.name),
                        website: get(col.website),
                        email: get(col.email),
                        phone: get(col.phone),
                        address: get(col.address),
                        crNumber: get(col.crNumber),
                        assignedTo: get(col.assignedTo) || currentUserName,
                        country: get(col.country),
                        city: get(col.city),
                        pincode: get(col.pincode),
                        createdAt: now,
                        updatedAt: now,
                      };
                    }).filter(a => a.name);   // skip empty rows

                    const existingEmails = new Set(
                      accounts.filter(a => a.email).map(a => a.email.toLowerCase())
                    );

                    const duplicateAccounts = imported.filter(
                      a => a.email && existingEmails.has(a.email.toLowerCase())
                    );

                    const newAccounts = imported.filter(
                      a => !a.email || !existingEmails.has(a.email.toLowerCase())
                    );

                    if (duplicateAccounts.length > 0) {
                      setErrorMessage('Records already exist');
                    }

                    if (newAccounts.length > 0) {
                      setAccounts(prev => [...newAccounts, ...prev]);
                      setSuccessMessage(`${newAccounts.length} Account${newAccounts.length !== 1 ? 's' : ''} Imported Successfully`);
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

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white dark:bg-[#111111] rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete</h2>
            </div>
            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure want to delete{' '}
                <span className="font-bold text-slate-900 dark:text-white">{deleteConfirm.count}</span>{' '}
                Account Record{deleteConfirm.count > 1 ? 's' : ''} ?
              </p>
            </div>
            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2 rounded-full text-sm font-bold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-full text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Deleting Overlay */}
      <FullScreenLoader
        isLoading={isDeletingAccount}
        title={deletingAccountCount > 1 ? 'Deleting Accounts…' : 'Deleting Account…'}
        message="Please wait while the record is being deleted"
      />
    </div>
  );
};

export default Accounts;
