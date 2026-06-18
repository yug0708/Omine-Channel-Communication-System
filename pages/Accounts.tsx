import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FilterFunnelIcon,
} from '../components/icons/Icons';

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
  hasFilter?: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children, hasFilter }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
    <div className="flex items-center gap-1">
      {children}
      {hasFilter && <FilterFunnelIcon className="h-3 w-3 opacity-50" />}
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
      className={`absolute -top-2.5 left-4 px-1.5 text-[11px] font-semibold z-10 bg-white dark:bg-[#151B25] ${
        errors[fieldName] ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
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

const AccountForm: React.FC<{
  account?: Account | null;
  onSave: (data: AccountFormData & Partial<Pick<Account, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  onClose: () => void;
  currentUserName?: string;
}> = ({ account, onSave, onClose, currentUserName = '' }) => {
  const [form, setForm] = useState<AccountFormData>({
    name: account?.name ?? '',
    website: account?.website ?? '',
    email: account?.email ?? '',
    phone: account?.phone ?? '',
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

  // Find current selected country prefix based on form.phone, or default to SA
  const initialCountry = React.useMemo(() => {
    const trimmedPhone = form.phone.trim();
    if (trimmedPhone) {
      const match = COUNTRIES_DIAL_CODES.find(c => trimmedPhone.startsWith(c.dialCode));
      if (match) return match;
    }
    return COUNTRIES_DIAL_CODES.find(c => c.code === 'SA') || COUNTRIES_DIAL_CODES[0];
  }, [form.phone]);

  const [selectedCountry, setSelectedCountry] = useState<CountryDialCode>(initialCountry);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const validate = (currentForm = form) => {
    const newErrors: Record<string, string> = {};
    if (!currentForm.name.trim()) {
      newErrors.name = 'Account Name must be at least 1 characters.';
    }
    if (!currentForm.email.trim()) {
      newErrors.email = 'Email is required!';
    }
    if (!currentForm.phone.trim()) {
      newErrors.phone = 'Contact Number is required!';
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
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (isSubmitted) {
      setErrors(validate(updatedForm));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({ ...form, ...(account ? { id: account.id, createdAt: account.createdAt } : {}) });
  };

  const getInputClass = (fieldName: string, extraClasses = '') => {
    const hasError = errors[fieldName];
    const base = 'block w-full rounded-full bg-white dark:bg-[#151B25] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition';
    if (hasError) {
      return `${base} border-2 border-rose-500 dark:border-rose-500 focus:ring-0 ${extraClasses}`;
    }
    return `${base} border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-0 ${extraClasses}`;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

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
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center z-20" ref={countryDropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 px-1.5 py-1 rounded-lg transition text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              <span>{selectedCountry.code}</span>
              <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1.5" />
            {isDropdownOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 w-64 bg-white dark:bg-[#151B25] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col p-2 max-h-64 overflow-hidden">
                <div className="relative mb-2 p-1">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/80 pr-1">
                  {COUNTRIES_DIAL_CODES.filter(
                    (c) =>
                      c.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
                      c.code.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
                      c.dialCode.includes(dropdownSearch)
                  ).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(c);
                        setIsDropdownOpen(false);
                        setDropdownSearch('');
                        const trimmedPhone = form.phone.trim();
                        if (!trimmedPhone || COUNTRIES_DIAL_CODES.some(x => trimmedPhone.startsWith(x.dialCode))) {
                          setForm(prev => ({ ...prev, phone: `${c.dialCode} ` }));
                        }
                      }}
                      className="w-full text-left px-2.5 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition text-xs"
                    >
                      <span className="text-base shrink-0">{c.flag}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-slate-900 dark:text-white truncate">{c.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{c.code} ({c.dialCode})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            onFocus={() => setIsDropdownOpen(false)}
            placeholder="Enter phone number"
            className={getInputClass('phone', 'pl-20')}
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
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
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

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200"
        >
          {account ? 'Update Account' : 'Save'}
        </button>
      </div>
    </form>
  );
};

// ─── Checkbox style ───────────────────────────────────────────────────────────

const checkboxClasses =
  'h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600';

// ─── Main Page ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const Accounts: React.FC = () => {
  const { accounts, setAccounts } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const currentUserName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : '';

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Selection state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Delete confirm modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ ids: string[]; count: number } | null>(null);

  // Import/Export dropdown state
  const [importExportOpen, setImportExportOpen] = useState(false);
  const importExportRef = React.useRef<HTMLDivElement>(null);

  // Import modal state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (importExportRef.current && !importExportRef.current.contains(e.target as Node)) {
        setImportExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Success toast state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Search & pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedAccounts = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenModal = (account: Account | null = null) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAccount(null);
    setIsModalOpen(false);
  };

  const handleSaveAccount = (
    data: AccountFormData & Partial<Pick<Account, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    const now = new Date().toISOString();
    if (data.id) {
      // Update existing
      setAccounts(accounts.map((a) =>
        a.id === data.id ? { ...a, ...data, updatedAt: now } : a
      ));
      setSuccessMessage('Account Updated Successfully');
    } else {
      // Create new
      const newAccount: Account = {
        ...data,
        id: `acc${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setAccounts([newAccount, ...accounts]);
      setSuccessMessage('Account Created Successfully');
    }
    handleCloseModal();
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

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const count = deleteConfirm.count;
    setAccounts(accounts.filter((a) => !deleteConfirm.ids.includes(a.id)));
    setSelectedAccounts((prev) => prev.filter((s) => !deleteConfirm.ids.includes(s)));
    setDeleteConfirm(null);
    setSuccessMessage(`Record${count > 1 ? 's' : ''} Deleted Successfully`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full gap-3 sm:gap-4">
      <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-300 ml-1">Accounts</h1>

      <div className="bg-white dark:bg-[#151B25] shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col flex-1 overflow-hidden">

        {/* Toolbar */}
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 sm:px-5 py-2 rounded-full text-sm font-bold shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4" />
              New Account
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search accounts…"
                className="pl-9 pr-4 py-1.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full sm:w-56 md:w-64 transition"
              />
            </div>

            {/* Import / Export dropdown */}
            <div className="relative flex-shrink-0" ref={importExportRef}>
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
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-40 bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
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
                    onClick={() => { setImportExportOpen(false); }}
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


        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-[900px] w-full whitespace-nowrap text-left text-sm">
            <thead className="sticky top-0 z-10">
              {/* Selection Banner Row — replaces headers when rows are selected */}
              {selectedAccounts.length > 0 ? (
                <tr style={{ backgroundColor: 'rgba(16,185,129,0.12)', borderBottom: '1px solid rgba(16,185,129,0.25)' }}>
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
                  <th colSpan={10} className="px-2 py-3">
                    <span className="text-sm font-bold" style={{ color: '#10B981' }}>
                      {selectedAccounts.length} Selected
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right">
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
                <tr className="bg-white dark:bg-[#151B25] border-b border-slate-200 dark:border-slate-800/80">
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
                <TableHeader hasFilter>Account Name</TableHeader>
                <TableHeader>Website</TableHeader>
                <TableHeader>Email</TableHeader>
                  <TableHeader hasFilter>Phone</TableHeader>
                  <TableHeader>Address</TableHeader>
                  <TableHeader>CR Number</TableHeader>
                  <TableHeader>Assigned To</TableHeader>
                  <TableHeader hasFilter>Country</TableHeader>
                  <TableHeader hasFilter>Created Date</TableHeader>
                  <TableHeader hasFilter>Updated Date</TableHeader>
                  <TableHeader>Actions</TableHeader>
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

                      {/* Email */}
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                        {account.email || '—'}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                        {account.phone || '—'}
                      </td>

                      {/* Address */}
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                        {account.address || '—'}
                      </td>

                      {/* CR Number */}
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                        {account.crNumber || '—'}
                      </td>

                      {/* Assigned To */}
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                        {account.assignedTo || '—'}
                      </td>

                      {/* Country */}
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                        {account.country || '—'}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-2 text-slate-900 dark:text-white">
                        <div>{createdDate}</div>
                        <div className="text-xs text-slate-400">{createdTime}</div>
                      </td>

                      {/* Updated */}
                      <td className="px-4 py-2 text-slate-900 dark:text-white">
                        <div>{updatedDate}</div>
                        <div className="text-xs text-slate-400">{updatedTime}</div>
                      </td>

                      {/* Actions */}
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-3 sm:px-4 py-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col xs:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span className="shrink-0">
              Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-2.5 sm:px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-2.5 sm:px-3 py-1 font-medium text-slate-700 dark:text-slate-200">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-2.5 sm:px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Next →
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
        />
      </Modal>

      {/* Import Accounts Modal */}
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
                  onClick={e => e.preventDefault()}
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
                  setIsImportOpen(false);
                  setImportFile(null);
                  setSuccessMessage('Accounts Imported Successfully');
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

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-slate-200 dark:border-slate-700 overflow-hidden"
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
    </div>
  );
};

export default Accounts;
