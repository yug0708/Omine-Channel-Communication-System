import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Account, Contact, Ticket, TicketStatus, TicketPriority } from '../types';
import Modal from '../components/ui/Modal';
import { COUNTRIES } from '../data/countries';
import {
  EditIcon,
  SearchIcon,
  MoreVertIcon,
  FilterFunnelIcon,
  UserIcon,
  PhoneIcon,
  EmailIcon,
  PlusIcon,
  DeleteIcon,
  PencilIcon,
  ChevronDownIcon
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

const getInitials = (firstName: string, lastName: string): string =>
  `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';

const getInitialsSingle = (name: string): string =>
  name
    .split(' ')
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

const formatDate = (dateString: string): string => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
};

const formatFullDate = (dateString: string): { date: string; time: string } => {
  if (!dateString) return { date: '—', time: '—' };
  const d = new Date(dateString);
  return {
    date: d.toLocaleDateString('en-GB'),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DetailFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder?: string;
}

const DetailField: React.FC<DetailFieldProps> = ({ icon, label, value, placeholder = '—' }) => {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20">
      <div className="text-slate-400 dark:text-slate-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
          {label}
        </div>
        <div className={`text-sm font-medium ${value ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
          {value || placeholder}
        </div>
      </div>
    </div>
  );
};

const NoDataIllustration: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="relative mb-4">
      {/* Floating green dots around the box */}
      <div className="absolute -top-5 -left-8 w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-500/40 select-none animate-pulse" />
      <div className="absolute top-5 -left-12 w-1.5 h-1.5 rounded-full bg-emerald-300/80 dark:bg-emerald-500/20 select-none" />
      <div className="absolute -bottom-2 -left-6 w-2.5 h-2.5 rounded-full bg-emerald-300 dark:bg-emerald-500/30 select-none" />
      <div className="absolute -top-2 right-4 w-1.5 h-1.5 rounded-full bg-emerald-300/80 dark:bg-emerald-500/20 select-none" />
      <div className="absolute top-6 -right-10 w-2.5 h-2.5 rounded-full bg-emerald-300 dark:bg-emerald-500/30 select-none" />
      <div className="absolute bottom-2 -right-4 w-3 h-3 rounded-full bg-emerald-300 dark:bg-emerald-500/40 select-none animate-pulse" />

      {/* Card/browser mockup */}
      <div className="w-28 h-24 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#151b26] flex flex-col overflow-hidden shadow-lg shadow-emerald-500/5 dark:shadow-emerald-950/10">
        {/* Top bar with emerald green background and three dots */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 border-b border-emerald-600/10">
          <div className="w-1 h-1 rounded-full bg-white/80" />
          <div className="w-1 h-1 rounded-full bg-white/80" />
          <div className="w-1 h-1 rounded-full bg-white/80" />
        </div>
        {/* Placeholder lines in browser mockup body */}
        <div className="flex-1 flex flex-col justify-center gap-2.5 px-4">
          <div className="h-1.5 rounded-full bg-emerald-500/10 dark:bg-slate-800/80 w-3/4" />
          <div className="h-1.5 rounded-full bg-emerald-500/10 dark:bg-slate-800/80 w-5/6" />
          <div className="h-1.5 rounded-full bg-emerald-500/10 dark:bg-slate-800/80 w-1/2" />
        </div>
      </div>
    </div>
    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-3 tracking-wide">
      No Records Found!!!
    </span>
  </div>
);


// ─── Contact Form (inside details page) ───────────────────────────────────────

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  assignedTo: string;
  lifecycle: string;
  labels: string;
}

const ContactForm: React.FC<{
  contact?: Contact | null;
  onSave: (data: ContactFormData & { id?: string }) => void;
  onClose: () => void;
  accountName: string;
  currentUserName?: string;
}> = ({ contact, onSave, onClose, accountName, currentUserName = 'Unassigned' }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    contactNumber: contact?.contactNumber || '',
    assignedTo: contact?.assignedTo || currentUserName,
    lifecycle: contact?.lifecycle || 'NA',
    labels: contact?.labels || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: contact?.id });
  };

  const inputClass =
    'mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition';

  const labelClass = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name</label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className={inputClass}
            placeholder="First name"
          />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input
            type="text"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className={inputClass}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. +966 50 123 4567"
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Lifecycle Status</label>
          <select
            name="lifecycle"
            value={formData.lifecycle}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="NA">NA</option>
            <option value="Lead">Lead</option>
            <option value="Subscriber">Subscriber</option>
            <option value="Customer">Customer</option>
            <option value="Evangelist">Evangelist</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Labels</label>
          <input
            type="text"
            name="labels"
            value={formData.labels}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. Partner, VIP (comma separated)"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Assigned To</label>
        <input
          type="text"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          className={inputClass}
          placeholder="Owner name"
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
        >
          Save Contact
        </button>
      </div>
    </form>
  );
};

// ─── Account Edit Form (drawer/modal) ────────────────────────────────────────

interface AccountFormData {
  name: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  crNumber: string;
  assignedTo: string;
  country: string;
  city: string;
  pincode: string;
}

const AccountEditForm: React.FC<{
  account: Account;
  onSave: (data: AccountFormData) => void;
  onClose: () => void;
}> = ({ account, onSave, onClose }) => {
  const [form, setForm] = useState<AccountFormData>({
    name: account.name,
    website: account.website || '',
    email: account.email || '',
    phone: account.phone || '',
    address: account.address || '',
    crNumber: account.crNumber || '',
    assignedTo: account.assignedTo || '',
    country: account.country || '',
    city: account.city || '',
    pincode: account.pincode || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const inputClass =
    'mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition';

  const labelClass = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Account Name *</label>
        <input
          type="text"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Website URL</label>
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>CR Number</label>
          <input
            type="text"
            name="crNumber"
            value={form.crNumber}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Country</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Pincode</label>
          <input
            type="text"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
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
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accounts, setAccounts, contacts, setContacts, tickets, setTickets } = useData();
  const { currentUser } = useAuth();

  const currentUserName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : 'Unassigned';

  const account = accounts.find((a) => a.id === id);

  // Accordion open/close states
  const [accordions, setAccordions] = useState({
    contact: true,
    address: false,
    assignment: false,
    custom: false,
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<'contacts' | 'tickets'>('contacts');

  // Search and Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Contact Modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Account Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter lists based on account
  const accountContacts = useMemo(() => {
    if (!account) return [];
    return contacts.filter((c) => c.accountName === account.name);
  }, [contacts, account]);

  const accountTickets = useMemo(() => {
    if (!account) return [];
    return tickets.filter((t) => t.accountId === account.id || t.accountName === account.name);
  }, [tickets, account]);

  // Derived lists for Search and Pagination
  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return accountContacts;
    return accountContacts.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.contactNumber.toLowerCase().includes(q) ||
        c.assignedTo.toLowerCase().includes(q) ||
        c.lifecycle.toLowerCase().includes(q)
    );
  }, [accountContacts, search]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const paginatedContacts = filteredContacts.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  if (!account) {
    return (
      <div className="p-8 text-center text-slate-500">
        Account not found.
        <button
          onClick={() => navigate('/accounts')}
          className="ml-2 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
        >
          Back to Accounts
        </button>
      </div>
    );
  }

  const toggleAccordion = (sec: 'contact' | 'address' | 'assignment' | 'custom') => {
    setAccordions((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleOpenContactModal = (contact: Contact | null = null) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setEditingContact(null);
    setIsContactModalOpen(false);
  };

  const handleSaveContact = (contactData: ContactFormData & { id?: string }) => {
    const now = new Date().toISOString();
    if (contactData.id) {
      // Edit mode
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactData.id
            ? { ...c, ...contactData, accountName: account.name, updatedAt: now }
            : c
        )
      );
    } else {
      // Create mode
      const newContact: Contact = {
        ...contactData,
        id: `con${Date.now()}`,
        accountName: account.name,
        createdAt: now,
        updatedAt: now,
      };
      setContacts((prev) => [...prev, newContact]);
    }
    handleCloseContactModal();
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    }
  };

  const handleSaveAccount = (updatedData: AccountFormData) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === account.id
          ? { ...a, ...updatedData, updatedAt: new Date().toISOString() }
          : a
      )
    );
    setIsEditModalOpen(false);
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    }
  };

  const getPriorityColor = (priority?: TicketPriority) => {
    switch (priority) {
      case TicketPriority.High:
      case TicketPriority.Urgent:
        return 'text-red-500 border-red-500 bg-red-50 dark:bg-red-950/20';
      case TicketPriority.Low:
        return 'text-teal-500 border-teal-500 bg-teal-50 dark:bg-teal-950/20';
      default:
        return 'text-green-500 border-green-500 bg-green-50 dark:bg-green-950/20';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.Open:
        return 'text-red-500 border-red-500 bg-red-50 dark:bg-red-950/20';
      case TicketStatus.InProgress:
        return 'text-yellow-500 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case TicketStatus.Closed:
        return 'text-green-500 border-green-500 bg-green-50 dark:bg-green-950/20';
      default:
        return 'text-slate-500 border-slate-500 bg-slate-50 dark:bg-slate-950/20';
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">
        <span
          className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
          onClick={() => navigate('/accounts')}
        >
          Accounts
        </span>
        <span className="mx-2 text-slate-400 select-none">·</span>
        <span className="text-slate-900 dark:text-slate-300 font-bold">
          {account.name}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start h-full">
        {/* LEFT COLUMN (Details card and accordions) */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4">
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#151B25] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col items-center">
            
            {/* Avatar with pencil overlay */}
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold text-2xl select-none">
                {getInitialsSingle(account.name)}
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 h-8 w-8 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-[#151B25] shadow-md transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Title / Name */}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
              {account.name}
            </h2>

            {/* Account badge & Created Date */}
            <div className="flex items-center gap-2.5 mt-2">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white tracking-wide uppercase">
                Account
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Created {formatDate(account.createdAt)}
              </span>
            </div>

            {/* Circular buttons */}
            <div className="flex items-center justify-center gap-3.5 mt-6 w-full">
              {/* Button 1: Note */}
              <button className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </button>

              {/* Button 2: Campaign/Link */}
              <button className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
              </button>

              {/* Button 3: Schedule */}
              <button className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                </svg>
              </button>

              {/* Button 4: More */}
              <button className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Accordion List */}
          <div className="flex flex-col gap-3">
            
            {/* Accordion 1: Contact Information */}
            <div className="bg-white dark:bg-[#151B25] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('contact')}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Contact Information
                  </span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${accordions.contact ? 'rotate-180' : ''}`} />
              </button>

              {accordions.contact && (
                <div className="px-5 pb-5 pt-1 flex flex-col gap-3 border-t border-slate-50 dark:border-slate-900/40">
                  <DetailField icon={<UserIcon className="h-4 w-4" />} label="Account Name" value={account.name} placeholder="Account Name" />
                  <DetailField icon={<EmailIcon className="h-4 w-4" />} label="Email" value={account.email} placeholder="Email" />
                  <DetailField icon={<PhoneIcon className="h-4 w-4" />} label="Phone Number" value={account.phone} placeholder="Phone Number" />
                  <DetailField
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918" />
                      </svg>
                    }
                    label="Website"
                    value={account.website}
                    placeholder="Website"
                  />
                </div>
              )}
            </div>

            {/* Accordion 2: Address Information */}
            <div className="bg-white dark:bg-[#151B25] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('address')}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Address Information
                  </span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${accordions.address ? 'rotate-180' : ''}`} />
              </button>

              {accordions.address && (
                <div className="px-5 pb-5 pt-1 flex flex-col gap-3 border-t border-slate-50 dark:border-slate-900/40">
                  <DetailField icon={<span className="text-xs font-bold font-mono">C</span>} label="Country" value={account.country} placeholder="Country" />
                  <DetailField icon={<span className="text-xs font-bold font-mono">T</span>} label="City" value={account.city} placeholder="City" />
                  <DetailField icon={<span className="text-xs font-bold font-mono">A</span>} label="Address" value={account.address} placeholder="Address" />
                  <DetailField icon={<span className="text-xs font-bold font-mono">P</span>} label="Pincode" value={account.pincode} placeholder="Pincode" />
                </div>
              )}
            </div>

            {/* Accordion 3: Assignment Details */}
            <div className="bg-white dark:bg-[#151B25] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('assignment')}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Assignment Details
                  </span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${accordions.assignment ? 'rotate-180' : ''}`} />
              </button>

              {accordions.assignment && (
                <div className="px-5 pb-5 pt-1 flex flex-col gap-3 border-t border-slate-50 dark:border-slate-900/40">
                  <DetailField icon={<UserIcon className="h-4 w-4" />} label="Assigned To" value={account.assignedTo} placeholder="Assigned to" />
                </div>
              )}
            </div>

            {/* Accordion 4: Custom Fields */}
            <div className="bg-white dark:bg-[#151B25] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleAccordion('custom')}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Custom Fields
                  </span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${accordions.custom ? 'rotate-180' : ''}`} />
              </button>

              {accordions.custom && (
                <div className="px-5 pb-5 pt-1 flex flex-col gap-3 border-t border-slate-50 dark:border-slate-900/40">
                  <DetailField
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
                      </svg>
                    }
                    label="CR Number"
                    value={account.crNumber}
                    placeholder="CR Number"
                  />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN (Tabs list) */}
        <div className="flex-1 w-full bg-white dark:bg-[#151B25] rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col overflow-hidden">
          
          {/* Tab Navigation Headers */}
          <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800/80">
            <button
              className={`px-6 py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'contacts'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              onClick={() => {
                setActiveTab('contacts');
                setSearch('');
                setPage(1);
              }}
            >
              <UserIcon className="h-4 w-4" />
              Contacts
            </button>

            <button
              className={`px-6 py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'tickets'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
              onClick={() => {
                setActiveTab('tickets');
                setSearch('');
                setPage(1);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
              </svg>
              Tickets
            </button>
          </div>

          {/* Tab Contents: Contacts */}
          {activeTab === 'contacts' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Tab Toolbar */}
              <div className="p-4 flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenContactModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-all"
                >
                  <PlusIcon className="h-4 w-4" />
                  New Contact
                </button>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search..."
                      className="pl-9 pr-4 py-1.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-56 transition"
                    />
                  </div>
                  {/* Settings columns and options icons */}
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                    </svg>
                  </button>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                    <MoreVertIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Table wrapper */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full w-full whitespace-nowrap text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 w-6">
                        <input
                          type="checkbox"
                          disabled
                          className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-not-allowed"
                        />
                      </th>
                      <th className="px-4 py-3.5 font-bold">First Name</th>
                      <th className="px-4 py-3.5 font-bold">Last Name</th>
                      <th className="px-4 py-3.5 font-bold">Contact Number</th>
                      <th className="px-4 py-3.5 font-bold">Email</th>
                      <th className="px-4 py-3.5 font-bold">Account Name</th>
                      <th className="px-4 py-3.5 font-bold">Assigned to</th>
                      <th className="px-4 py-3.5 font-bold">Lifecycle</th>
                      <th className="px-4 py-3.5 font-bold">Created Date</th>
                      <th className="px-4 py-3.5 font-bold">Updated Date</th>
                      <th className="px-4 py-3.5 font-bold">Labels</th>
                      <th className="px-4 py-3.5 font-bold text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    {paginatedContacts.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="p-0">
                          <NoDataIllustration />
                        </td>
                      </tr>
                    ) : (
                      paginatedContacts.map((c) => {
                        const avatarColor = getAvatarColor(c.firstName || c.lastName || 'C');
                        const { date: cDate, time: cTime } = formatFullDate(c.createdAt);
                        const { date: uDate, time: uTime } = formatFullDate(c.updatedAt);
                        
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-2.5">
                              <input
                                type="checkbox"
                                disabled
                                className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-not-allowed"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${avatarColor}`}>
                                  {getInitials(c.firstName, c.lastName)}
                                </div>
                                <span className="text-slate-900 dark:text-white font-semibold">
                                  {c.firstName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                              {c.lastName}
                            </td>
                            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                              {c.contactNumber || '—'}
                            </td>
                            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                              {c.email || '—'}
                            </td>
                            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                              {c.accountName || '—'}
                            </td>
                            <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                              {c.assignedTo || 'Unassigned'}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {c.lifecycle || 'NA'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-950 dark:text-white">
                              <div>{cDate}</div>
                              <div className="text-[10px] text-slate-400">{cTime}</div>
                            </td>
                            <td className="px-4 py-2.5 text-slate-950 dark:text-white">
                              <div>{uDate}</div>
                              <div className="text-[10px] text-slate-400">{uTime}</div>
                            </td>
                            <td className="px-4 py-2.5">
                              {c.labels ? (
                                <div className="flex flex-wrap gap-1">
                                  {c.labels.split(',').map((lbl, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                                      {lbl.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenContactModal(c)}
                                  className="text-slate-400 hover:text-emerald-500 p-1 transition-colors"
                                >
                                  <EditIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteContact(c.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
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

              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none">
                  <div className="flex items-center gap-1.5">
                    <span>Row Per page</span>
                    <select disabled className="bg-transparent border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 font-bold cursor-not-allowed text-slate-700 dark:text-slate-300">
                      <option>10</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <span>
                      {(safePage - 1) * itemsPerPage + 1}–
                      {Math.min(safePage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Contents: Tickets */}
          {activeTab === 'tickets' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto p-4">
                <table className="min-w-full w-full whitespace-nowrap text-left text-xs bg-[#1C232E] rounded-2xl overflow-hidden border border-slate-800/80">
                  <thead className="bg-[#242C38] text-slate-400 font-bold border-b border-slate-700 uppercase tracking-wide">
                    <tr>
                      <th className="px-5 py-3.5">Ticket No</th>
                      <th className="px-5 py-3.5">Title</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Priority</th>
                      <th className="px-5 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/60 text-white font-medium">
                    {accountTickets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="bg-slate-900/10">
                          <NoDataIllustration />
                        </td>
                      </tr>
                    ) : (
                      accountTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-400">
                            #{t.ticketNo || '—'}
                          </td>
                          <td className="px-5 py-3.5 font-semibold">
                            {t.subject}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${getStatusColor(t.status)}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${getPriorityColor(t.priority)}`}>
                              {t.priority || 'Normal'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => handleDeleteTicket(t.id)}
                              className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors font-bold"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Edit Account Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Account Details"
        variant="drawer"
      >
        <AccountEditForm
          account={account}
          onSave={handleSaveAccount}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Add / Edit Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={handleCloseContactModal}
        title={editingContact ? 'Edit Contact' : 'Create Contact'}
        variant="drawer"
      >
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onClose={handleCloseContactModal}
          accountName={account.name}
          currentUserName={currentUserName}
        />
      </Modal>
    </div>
  );
};

export default AccountDetails;
