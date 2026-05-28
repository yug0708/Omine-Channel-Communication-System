import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
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

const inputClass =
  'mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition';

const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

const AccountForm: React.FC<{
  account?: Account | null;
  onSave: (data: AccountFormData & Partial<Pick<Account, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  onClose: () => void;
}> = ({ account, onSave, onClose }) => {
  const [form, setForm] = useState<AccountFormData>({
    name:       account?.name       ?? '',
    website:    account?.website    ?? '',
    email:      account?.email      ?? '',
    phone:      account?.phone      ?? '',
    address:    account?.address    ?? '',
    crNumber:   account?.crNumber   ?? '',
    assignedTo: account?.assignedTo ?? '',
    country:    account?.country    ?? '',
    city:       account?.city       ?? '',
    pincode:    account?.pincode    ?? '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, ...(account ? { id: account.id, createdAt: account.createdAt } : {}) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Account Name *</label>
          <input
            required
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Acme Corp"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Website</label>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="contact@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 234 567 8901"
            className={inputClass}
          />
        </div>
      </div>

      {/* Row 3 */}
      <div>
        <label className={labelClass}>Address</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="123 Main St, City, Country"
          className={inputClass}
        />
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Country</label>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Pincode</label>
          <input
            type="text"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="12345"
            className={inputClass}
          />
        </div>
      </div>

      {/* Row 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>CR Number</label>
          <input
            type="text"
            name="crNumber"
            value={form.crNumber}
            onChange={handleChange}
            placeholder="CR-12345"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Assigned To</label>
          <input
            type="text"
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            placeholder="Agent name"
            className={inputClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {account ? 'Update Account' : 'Add Account'}
        </Button>
      </div>
    </form>
  );
};

// ─── Checkbox style ───────────────────────────────────────────────────────────

const checkboxClasses =
  'h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600';

// ─── Main Page ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const Accounts: React.FC = () => {
  const { accounts, setAccounts } = useData();

  // Modal state
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Selection state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Search & pagination
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);

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

  const totalPages       = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage         = Math.min(page, totalPages);
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
    } else {
      // Create new
      const newAccount: Account = {
        ...data,
        id:        `acc${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setAccounts([newAccount, ...accounts]);
    }
    handleCloseModal();
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      setAccounts(accounts.filter((a) => a.id !== id));
      setSelectedAccounts((prev) => prev.filter((s) => s !== id));
    }
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
    if (window.confirm(`Delete ${selectedAccounts.length} selected account(s)?`)) {
      setAccounts(accounts.filter((a) => !selectedAccounts.includes(a.id)));
      setSelectedAccounts([]);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-300 ml-1">Accounts</h1>

      <div className="bg-white dark:bg-[#151B25] shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col flex-1 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              New Account
            </button>

            {selectedAccounts.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <DeleteIcon className="h-4 w-4" />
                Delete ({selectedAccounts.length})
              </button>
            )}
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search accounts…"
              className="pl-9 pr-4 py-1.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 w-64 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-transparent border-b border-slate-200 dark:border-slate-800/80 sticky top-0 bg-white dark:bg-[#151B25] z-10">
              <tr>
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
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 text-sm"
                  >
                    {search ? 'No accounts match your search.' : 'No accounts yet. Click "New Account" to add one.'}
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
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-violet-500/10'
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
                          <span className="font-medium text-slate-900 dark:text-white">
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
                            className="hover:text-violet-500 transition-colors"
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
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenModal(account)}
                            className="text-slate-400 hover:text-violet-500 transition-colors p-1 rounded"
                            aria-label={`Edit ${account.name}`}
                            title="Edit"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
                            aria-label={`Delete ${account.name}`}
                            title="Delete"
                          >
                            <DeleteIcon className="h-4 w-4" />
                          </button>
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
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>
              Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1 font-medium text-slate-700 dark:text-slate-200">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        title={editingAccount ? 'Edit Account' : 'Add New Account'}
      >
        <AccountForm
          account={editingAccount}
          onSave={handleSaveAccount}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default Accounts;
