import React, { useState, useRef, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { useData } from '../hooks/useData';

import { Ticket, TicketStatus, TicketPriority, Contact } from '../types';

import { useToast } from '../context/ToastContext';

import Modal from '../components/ui/Modal';



import {

  EditIcon,

  SearchIcon,

  MoreVertIcon,

  FilterFunnelIcon,

  UserIcon,

  PhoneIcon,

  EmailIcon,

  ChevronDownIcon,

  PlusIcon,

  PencilIcon,

  ChevronLeftIcon,

  ChevronRightIcon

} from '../components/icons/Icons';



// Helper to generate initials

const getInitials = (firstName: string, lastName: string) => {

  return (

    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() ||

    '?'

  );

};



// Avatar background colors

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



const formatDate = (dateString?: string): string => {

  if (!dateString) return '—';

  const d = new Date(dateString);

  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

};



// Sub-component: DetailField

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



interface AboutFieldProps {
  icon?: React.ReactNode;
  value?: string;
  placeholder: string;
  indent?: boolean;
}

const AboutField: React.FC<AboutFieldProps> = ({ icon, value, placeholder, indent = false }) => {
  const hasValue = !!value?.trim();
  return (
    <div className={`flex items-center gap-3.5 ${indent ? 'pl-[34px]' : ''}`}>
      {icon && (
        <div className="text-slate-400 dark:text-slate-500 shrink-0 w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
      )}
      <span className={`text-xs ${hasValue ? 'text-slate-850 dark:text-slate-200 font-semibold' : 'text-slate-400 dark:text-slate-500 italic'}`}>
        {hasValue ? value : placeholder}
      </span>
    </div>
  );
};



// Sub-component: ContactForm modal editor

const ContactForm: React.FC<{

  contact: Contact;

  onSave: (data: Partial<Contact>) => void;

  onClose: () => void;

}> = ({ contact, onSave, onClose }) => {

  const [formData, setFormData] = useState({

    firstName: contact.firstName || '',

    lastName: contact.lastName || '',

    email: contact.email || '',

    contactNumber: contact.contactNumber || '',

    address: contact.address || '',

    city: contact.city || '',

    nationalId: contact.nationalId || '',

    country: contact.country || '',

    assignedTo: contact.assignedTo || '',

    lifecycle: contact.lifecycle || 'NA',

    labels: contact.labels || '',

  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

  };



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    onSave(formData);

  };



  const inputClass =

    'mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition';



  const labelClass = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider';



  return (

    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className={labelClass}>First Name *</label>

          <input

            type="text"

            name="firstName"

            required

            value={formData.firstName}

            onChange={handleChange}

            className={inputClass}

          />

        </div>

        <div>

          <label className={labelClass}>Last Name *</label>

          <input

            type="text"

            name="lastName"

            required

            value={formData.lastName}

            onChange={handleChange}

            className={inputClass}

          />

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className={labelClass}>Email *</label>

          <input

            type="email"

            name="email"

            required

            value={formData.email}

            onChange={handleChange}

            className={inputClass}

          />

        </div>

        <div>

          <label className={labelClass}>Contact Number *</label>

          <input

            type="text"

            name="contactNumber"

            required

            value={formData.contactNumber}

            onChange={handleChange}

            className={inputClass}

          />

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className={labelClass}>Address</label>

          <input

            type="text"

            name="address"

            value={formData.address}

            onChange={handleChange}

            className={inputClass}

          />

        </div>

        <div>

          <label className={labelClass}>City</label>

          <input

            type="text"

            name="city"

            value={formData.city}

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

            value={formData.country}

            onChange={handleChange}

            className={inputClass}

          />

        </div>

        <div>

          <label className={labelClass}>National ID</label>

          <input

            type="text"

            name="nationalId"

            value={formData.nationalId}

            onChange={handleChange}

            className={inputClass}

          />

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className={labelClass}>Assigned To</label>

          <input

            type="text"

            name="assignedTo"

            value={formData.assignedTo}

            onChange={handleChange}

            className={inputClass}

          />

        </div>

        <div>

          <label className={labelClass}>Lifecycle</label>

          <select

            name="lifecycle"

            value={formData.lifecycle}

            onChange={handleChange}

            className={inputClass}

          >

            <option value="NA">NA</option>

            <option value="Lead">Lead</option>

            <option value="Contact">Contact</option>

            <option value="Customer">Customer</option>

          </select>

        </div>

      </div>

      <div>

        <label className={labelClass}>Labels (comma separated)</label>

        <input

          type="text"

          name="labels"

          value={formData.labels}

          onChange={handleChange}

          className={inputClass}

          placeholder="e.g. Order Return, VIP"

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



// Sub-component: TicketForm modal

const TicketForm: React.FC<{

  ticket?: Ticket | null;

  onSave: (data: Partial<Ticket>) => void;

  onClose: () => void;

  contactId: string;

  contactName: string;

  accountName: string;

}> = ({ ticket, onSave, onClose, contactId, contactName, accountName }) => {

  const [formData, setFormData] = useState({

    subject: ticket?.subject || '',

    description: ticket?.description || '',

    status: ticket?.status || TicketStatus.Open,

    priority: ticket?.priority || TicketPriority.Normal,

    assignedTo: ticket?.assignedTo || '',

  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

  };



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    onSave({

      ...formData,

      contactId,

      contactName,

      accountName,

    });

  };



  const inputClass =

    'mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition';



  const labelClass = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider';



  return (

    <form onSubmit={handleSubmit} className="space-y-4">

      <div>

        <label className={labelClass}>Subject *</label>

        <input

          type="text"

          name="subject"

          required

          value={formData.subject}

          onChange={handleChange}

          className={inputClass}

          placeholder="Ticket Subject"

        />

      </div>

      <div>

        <label className={labelClass}>Description</label>

        <textarea

          name="description"

          rows={3}

          value={formData.description}

          onChange={handleChange}

          className={inputClass}

          placeholder="Ticket Description"

        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <label className={labelClass}>Status</label>

          <select

            name="status"

            value={formData.status}

            onChange={handleChange}

            className={inputClass}

          >

            <option value={TicketStatus.Open}>Open</option>

            <option value={TicketStatus.InProgress}>In Progress</option>

            <option value={TicketStatus.Closed}>Closed</option>

          </select>

        </div>

        <div>

          <label className={labelClass}>Priority</label>

          <select

            name="priority"

            value={formData.priority}

            onChange={handleChange}

            className={inputClass}

          >

            <option value={TicketPriority.Low}>Low</option>

            <option value={TicketPriority.Normal}>Normal</option>

            <option value={TicketPriority.High}>High</option>

            <option value={TicketPriority.Urgent}>Urgent</option>

          </select>

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

          placeholder="Assignee Name"

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

          Save

        </button>

      </div>

    </form>

  );

};



const TicketTableHeader = ({ title, hasFilter }: { title: string; hasFilter?: boolean }) => (

  <th className="px-4 py-3 font-semibold text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">

    <div className="flex items-center gap-2">

      <span className="text-[11px] font-bold tracking-wider">{title}</span>

      {hasFilter && (

        <svg

          xmlns="http://www.w3.org/2000/svg"

          fill="none"

          viewBox="0 0 24 24"

          strokeWidth={2}

          stroke="currentColor"

          className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-350 shrink-0"

        >

          <path

            strokeLinecap="round"

            strokeLinejoin="round"

            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"

          />

        </svg>

      )}

    </div>

  </th>

);



const ContactDetails: React.FC = () => {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const { contacts, setContacts, tickets, setTickets } = useData();

  const { showToast } = useToast();



  const contact = contacts.find((c) => c.id === id);

  const contactTickets = tickets.filter((t) => t.contactId === id);



  const [activeTab, setActiveTab] = useState<'tickets' | 'conversation' | 'mergeHistory'>('tickets');

  const [copiedEmail, setCopiedEmail] = useState(false);

  const [copiedPhone, setCopiedPhone] = useState(false);



  // Accordion state

  const [accordions, setAccordions] = useState({

    contact: true,

    address: false,

    assignment: false,

    custom: false,

  });



  // Ticket table search and pagination

  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);

  const itemsPerPage = 10;

  const [importExportOpen, setImportExportOpen] = useState(false);

  const ticketImportExportRef = useRef<HTMLDivElement>(null);



  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [tempStatusFilter, setTempStatusFilter] = useState<string>('All');

  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const statusFilterRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    const handleClickOutside = (e: MouseEvent) => {

      if (ticketImportExportRef.current && !ticketImportExportRef.current.contains(e.target as Node)) {

        setImportExportOpen(false);

      }

      if (statusFilterRef.current && !statusFilterRef.current.contains(e.target as Node)) {

        setIsStatusFilterOpen(false);

      }

    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, []);



  const exportTicketsCsv = () => {

    if (contactTickets.length === 0) {

      showToast('No tickets available to export.', 'error');

      return;

    }

    const headers = ['Ticket No', 'Title', 'Status', 'Priority', 'Contact Name', 'Account Name', 'Assigned To', 'Created Date', 'Updated Date'];

    const rows = contactTickets.map(t => [

      t.ticketNo || '',

      t.subject || '',

      t.status || '',

      t.priority || '',

      t.contactName || fullName,

      t.accountName || contact.accountName || '',

      t.assignedTo || 'Unassigned',

      t.createdAt ? new Date(t.createdAt).toLocaleString() : '',

      t.updatedAt ? new Date(t.updatedAt).toLocaleString() : '',

    ]);



    const csvContent = [headers, ...rows]

      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))

      .join('\r\n');



    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download = `tickets_export_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

  };



  // Modals state

  const [isContactEditModalOpen, setIsContactEditModalOpen] = useState(false);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);



  if (!contact) {

    return (

      <div className="p-8 text-center text-slate-500">

        Contact not found.

        <button

          onClick={() => navigate('/contacts')}

          className="ml-2 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"

        >

          Back to Contacts

        </button>

      </div>

    );

  }



  const isNameBlank = !contact.firstName?.trim() && !contact.lastName?.trim();

  const fullName = isNameBlank ? 'Unknown Contact' : `${contact.firstName} ${contact.lastName}`;

  const avatarColor = getAvatarColor(contact.firstName || contact.lastName || '');



  const handleCopy = (text: string, type: 'email' | 'phone') => {

    navigator.clipboard.writeText(text);

    if (type === 'email') {

      setCopiedEmail(true);

      setTimeout(() => setCopiedEmail(false), 2000);

    } else {

      setCopiedPhone(true);

      setTimeout(() => setCopiedPhone(false), 2000);

    }

  };



  const toggleAccordion = (sec: 'contact' | 'address' | 'assignment' | 'custom') => {

    setAccordions((prev) => ({ ...prev, [sec]: !prev[sec] }));

  };



  const handleSaveContact = (contactData: Partial<Contact>) => {

    const now = new Date().toISOString();

    setContacts((prev) =>

      prev.map((c) =>

        c.id === contact.id

          ? { ...c, ...contactData, updatedAt: now }

          : c

      )

    );

    setIsContactEditModalOpen(false);

  };



  const handleSaveTicket = (ticketData: Partial<Ticket>) => {

    const now = new Date().toISOString();

    if (editingTicket) {

      // Edit

      setTickets((prev) =>

        prev.map((t) =>

          t.id === editingTicket.id

            ? { ...t, ...ticketData, updatedAt: now }

            : t

        )

      );

    } else {

      // Create

      const newTicketNo = `TKT-${Math.floor(Math.random() * 9000 + 1000)}`;

      const newTicket: Ticket = {

        id: `tkt${Date.now()}`,

        ticketNo: newTicketNo,

        subject: ticketData.subject || '',

        description: ticketData.description || '',

        contactId: contact.id,

        contactName: fullName,

        accountId: '',

        accountName: contact.accountName || '',

        status: ticketData.status || TicketStatus.Open,

        priority: ticketData.priority || TicketPriority.Normal,

        assignedTo: ticketData.assignedTo || 'Unassigned',

        createdAt: now,

        updatedAt: now,

      };

      setTickets((prev) => [...prev, newTicket]);

    }

    setIsTicketModalOpen(false);

    setEditingTicket(null);

  };



  const handleDeleteTicket = (ticketId: string) => {

    if (window.confirm('Are you sure you want to delete this ticket?')) {

      setTickets((prev) => prev.filter((t) => t.id !== ticketId));

    }

  };



  const handleDeleteContact = () => {

    setContacts((prev) => prev.filter((c) => c.id !== contact.id));

    setDeleteConfirmOpen(false);

    navigate('/contacts');

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



  // Filtered and Paginated tickets

  const filteredTickets = contactTickets.filter((ticket) => {

    const matchesSearch = [ticket.ticketNo, ticket.subject, ticket.status, ticket.priority, ticket.assignedTo, ticket.accountName]

      .some((val) => String(val || '').toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;

  });



  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));

  const safePage = Math.min(page, totalPages);

  const paginatedTickets = filteredTickets.slice(

    (safePage - 1) * itemsPerPage,

    safePage * itemsPerPage

  );



  return (

    <div className="flex flex-col h-full gap-4 w-full">

      {/* ─── MOBILE VIEW ─── */}
      <div className="block lg:hidden w-full pb-28">
        {/* Header backdrop */}
        <div className="relative -mx-3 -mt-3 w-[calc(100%+24px)] bg-gradient-to-br from-emerald-600 to-teal-600 text-white pt-6 pb-16 px-6 rounded-b-[40px] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/contacts')} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
              <ChevronLeftIcon className="h-5 w-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
                <MoreVertIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-extrabold border-4 border-white/20 shadow-xl mb-3 ${avatarColor}`}>
              {getInitials(contact.firstName, contact.lastName)}
            </div>
            <h1 className="text-xl font-black tracking-tight">{fullName}</h1>
          </div>
        </div>

        {/* Floating actions */}
        <div className="mx-4 -mt-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4 shadow-md flex items-center justify-around z-10 relative">
          <a href={`tel:${contact.contactNumber}`} className="flex flex-col items-center gap-1">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PhoneIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-500">Call</span>
          </a>
          <a href={`sms:${contact.contactNumber}`} className="flex flex-col items-center gap-1">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-slate-500">Message</span>
          </a>
          <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-1">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <EmailIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-500">Email</span>
          </a>
          <button onClick={() => setIsContactEditModalOpen(true)} className="flex flex-col items-center gap-1">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <EditIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-500">Edit</span>
          </button>
        </div>

        <div className="mx-4 mt-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">About</h3>
            <div className="space-y-4">
              {/* First Name */}
              <AboutField
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                value={contact.firstName}
                placeholder="Enter first name"
              />

              {/* Last Name */}
              <AboutField
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                value={contact.lastName}
                placeholder="Enter last name"
              />

              {/* Email */}
              <AboutField
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                value={contact.email}
                placeholder="Enter email address"
              />

              {/* Contact Number */}
              <AboutField
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
                value={contact.contactNumber}
                placeholder="Enter phone number"
              />

              {/* Address */}
              <div className="space-y-2.5">
                <AboutField
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  value={contact.address}
                  placeholder="Enter address"
                />

                {/* City */}
                <AboutField
                  value={contact.city}
                  placeholder="Enter city"
                  indent
                />

                {/* Country */}
                <AboutField
                  value={contact.country}
                  placeholder="Enter country"
                  indent
                />
              </div>

              {/* National ID */}
              <AboutField
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8h1.01M19 13h-4m4 4h-4" />
                  </svg>
                }
                value={contact.nationalId}
                placeholder="Enter national ID"
              />

              {/* Assigned To */}
              <AboutField
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                }
                value={contact.assignedTo}
                placeholder="Enter assigned owner"
              />

              {/* Account Name */}
              <AboutField
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                value={contact.accountName}
                placeholder="Search account"
              />
            </div>
          </div>
        </div>

        {/* Tab section */}
        <div className="mx-4 mt-6">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-4">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === 'tickets'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
                }`}
            >
              <span>Tickets</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === 'tickets' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-650'}`}>
                {contactTickets.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('conversation')}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === 'conversation'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
                }`}
            >
              <span>Conversation</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-650`}>
                0
              </span>
            </button>
            <button
              onClick={() => setActiveTab('mergeHistory')}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === 'mergeHistory'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500'
                }`}
            >
              <span>History</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm">
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setEditingTicket(null);
                    setIsTicketModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl border border-emerald-500/20 hover:bg-emerald-100/50 transition flex items-center justify-center gap-1"
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Create ticket
                </button>

                {contactTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-400">No tickets</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contactTickets.map((ticket) => (
                      <div key={ticket.id} className="p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {ticket.ticketNo}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingTicket(ticket); setIsTicketModalOpen(true); }} className="text-slate-400 hover:text-emerald-500">
                              <EditIcon className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteTicket(ticket.id)} className="text-slate-400 hover:text-rose-500 text-xs font-bold">
                              ✕
                            </button>
                          </div>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{ticket.subject}</h4>
                        <div className="flex gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority || 'Normal'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'conversation' && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-400">No conversations</span>
              </div>
            )}

            {activeTab === 'mergeHistory' && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-400">No merge history</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom actions bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 p-4 flex gap-3 z-30 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setIsContactEditModalOpen(true)}
          className="flex-1 py-3 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all text-center"
        >
          Edit contact
        </button>
        <button
          onClick={() => setDeleteConfirmOpen(true)}
          className="flex-1 py-3 text-xs font-extrabold text-white bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 rounded-2xl hover:shadow-lg transition-all text-center"
        >
          Delete
        </button>
      </div>

      {/* ─── DESKTOP VIEW ─── */}
      <div className="hidden lg:flex flex-col gap-4 w-full">

        {/* Breadcrumb */}

        <div className="flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">

          <span

            className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"

            onClick={() => navigate('/contacts')}

          >

            Contacts

          </span>

          <span className="mx-2 text-slate-400 select-none">·</span>

          <span className="text-slate-900 dark:text-slate-300 font-bold">

            {fullName}

          </span>

        </div>



        <div className="flex flex-col lg:flex-row gap-6 items-stretch h-full">

          {/* LEFT COLUMN */}

          <div className="w-full lg:w-[380px] flex flex-col gap-4">

            {/* Profile Card */}

            <div className="bg-white dark:bg-[#151B25] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col items-center">



              {/* Avatar */}

              <div className="relative mb-4">

                <div

                  className={`h-24 w-24 rounded-full flex items-center justify-center text-2xl font-bold border border-slate-200 dark:border-slate-800 select-none ${isNameBlank

                    ? 'bg-slate-300 dark:bg-slate-500 text-slate-900'

                    : `text-white ${avatarColor}`

                    }`}

                >

                  {isNameBlank ? (

                    <UserIcon className="h-12 w-12" />

                  ) : contact.avatarUrl ? (

                    <img

                      src={contact.avatarUrl}

                      alt="Contact"

                      className="h-full w-full rounded-full object-cover"

                    />

                  ) : (

                    getInitials(contact.firstName, contact.lastName)

                  )}

                </div>



                <button

                  onClick={() => setIsContactEditModalOpen(true)}

                  className="absolute bottom-0 right-0 h-8 w-8 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-[#151B25] shadow-md transition-colors"

                >

                  <PencilIcon className="h-4 w-4" />

                </button>

              </div>



              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[280px]">

                {fullName}

              </h2>



              <div className="flex items-center gap-2.5 mt-2">

                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white tracking-wide uppercase">

                  Contact

                </span>

                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">

                  Created {formatDate(contact.createdAt)}

                </span>

              </div>





              {/* Direct Details with Copy Buttons */}

              <div className="w-full flex flex-col gap-2 mt-6 text-xs font-semibold">

                {contact.email && (

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">

                    <div className="flex items-center gap-2 truncate">

                      <EmailIcon className="h-4 w-4 text-slate-400 shrink-0" />

                      <span className="text-slate-800 dark:text-slate-200 truncate">{contact.email}</span>

                    </div>

                    <button

                      onClick={() => handleCopy(contact.email, 'email')}

                      className="text-slate-400 hover:text-emerald-500 transition-colors ml-2"

                    >

                      {copiedEmail ? (

                        <span className="text-[10px] text-emerald-500 font-bold">Copied!</span>

                      ) : (

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">

                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.25 11.25l3.375-3.375M16.5 16.5V6a2.25 2.25 0 0 0-2.25-2.25H7.5A2.25 2.25 0 0 0 5.25 6v10.5a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25z" />

                        </svg>

                      )}

                    </button>

                  </div>

                )}

                {contact.contactNumber && (

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">

                    <div className="flex items-center gap-2 truncate">

                      <PhoneIcon className="h-4 w-4 text-slate-400 shrink-0" />

                      <span className="text-slate-800 dark:text-slate-200 truncate">{contact.contactNumber}</span>

                    </div>

                    <button

                      onClick={() => handleCopy(contact.contactNumber, 'phone')}

                      className="text-slate-400 hover:text-emerald-500 transition-colors ml-2"

                    >

                      {copiedPhone ? (

                        <span className="text-[10px] text-emerald-500 font-bold">Copied!</span>

                      ) : (

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">

                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.25 11.25l3.375-3.375M16.5 16.5V6a2.25 2.25 0 0 0-2.25-2.25H7.5A2.25 2.25 0 0 0 5.25 6v10.5a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25z" />

                        </svg>

                      )}

                    </button>

                  </div>

                )}

              </div>





            </div>



            {/* Accordion Lists */}

            <div className="flex flex-col gap-3">

              {/* CONTACT INFORMATION */}

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

                    <DetailField icon={<UserIcon className="h-4 w-4" />} label="First Name" value={contact.firstName} />

                    <DetailField icon={<UserIcon className="h-4 w-4" />} label="Last Name" value={contact.lastName} />

                    <DetailField icon={<EmailIcon className="h-4 w-4 text-white" />} label="Email" value={contact.email} />

                    <DetailField icon={<PhoneIcon className="h-4 w-4 text-white" />} label="Contact Number" value={contact.contactNumber} />

                  </div>

                )}

              </div>



              {/* ADDRESS INFORMATION */}

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

                    <DetailField icon={<span className="text-xs font-bold font-mono">A</span>} label="Address" value={contact.address || ''} placeholder="No Address specified" />

                    <DetailField icon={<span className="text-xs font-bold font-mono">C</span>} label="City" value={contact.city || ''} placeholder="No City specified" />

                    <DetailField icon={<span className="text-xs font-bold font-mono">K</span>} label="Country" value={contact.country || ''} placeholder="No Country specified" />

                  </div>

                )}

              </div>



              {/* ASSIGNMENT DETAILS */}

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

                    <DetailField icon={<UserIcon className="h-4 w-4" />} label="Assigned To" value={contact.assignedTo} placeholder="Unassigned" />

                  </div>

                )}

              </div>



            </div>

          </div>



          {/* RIGHT COLUMN */}

          <div className="flex-1 w-full bg-white dark:bg-[#151B25] rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col overflow-hidden">

            {/* Tab Navigation Headers */}

            <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800/80">

              <button

                className={`px-6 py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeTab === 'tickets'

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



              <button

                className={`px-6 py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeTab === 'conversation'

                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'

                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'

                  }`}

                onClick={() => setActiveTab('conversation')}

              >

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">

                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.073.322.073.657 0 .979L19 13.25h-5.25L12 17.5h-.75V13.25H6l-1.25-3.76c-.073-.322-.073-.657 0-.979L6 5h12l2.25 3.511z" />

                </svg>

                Conversation

              </button>



              <button

                className={`px-6 py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeTab === 'mergeHistory'

                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'

                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'

                  }`}

                onClick={() => setActiveTab('mergeHistory')}

              >

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">

                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />

                </svg>

                Merge History

              </button>

            </div>



            {/* Tab Contents: Tickets */}

            {activeTab === 'tickets' && (

              <div className="flex-1 flex flex-col overflow-hidden">

                {/* Tab Toolbar */}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/10">

                  <button

                    onClick={() => {

                      setEditingTicket(null);

                      setIsTicketModalOpen(true);

                    }}

                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-sm"

                  >

                    <PlusIcon className="h-4 w-4" />

                    Create Ticket

                  </button>



                  <div className="flex items-center gap-3 w-full sm:w-auto">

                    <div className="relative flex-1 sm:w-64">

                      <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                      <input

                        type="text"

                        placeholder="Search..."

                        value={search}

                        onChange={(e) => {

                          setSearch(e.target.value);

                          setPage(1);

                        }}

                        className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl placeholder-slate-400 text-slate-850 dark:text-slate-150 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"

                      />

                    </div>





                    <div className="relative flex-shrink-0" ref={ticketImportExportRef}>

                      <button

                        onClick={() => setImportExportOpen((o) => !o)}

                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors shrink-0"

                        aria-label="Export Menu"

                      >

                        <MoreVertIcon className="h-5 w-5" />

                      </button>



                      {importExportOpen && (

                        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-40 bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

                          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

                          <button

                            onClick={() => {

                              setImportExportOpen(false);

                              exportTicketsCsv();

                            }}

                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"

                          >

                            <svg className="h-4 w-4 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>

                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 8l5-5 5 5M12 3v12" />

                            </svg>

                            Export

                          </button>

                        </div>

                      )}

                    </div>

                  </div>

                </div>



                {/* Table section */}

                <div className="flex-1 overflow-auto p-6">

                  <table className="w-full text-left text-xs bg-white dark:bg-[#1C232E] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">

                    <thead className="bg-slate-50 dark:bg-[#242C38] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 tracking-wide">

                      <tr>

                        <th className="px-4 py-3.5 w-6">

                          <input

                            type="checkbox"

                            disabled

                            className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-not-allowed"

                          />

                        </th>

                        <TicketTableHeader title="Ticket No" />

                        <TicketTableHeader title="Title" />

                        <th className="px-4 py-3 font-semibold text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap relative">

                          <div className="flex items-center gap-2">

                            <span className="text-[11px] font-bold uppercase tracking-wider">Status</span>

                            <button

                              onClick={() => setIsStatusFilterOpen(prev => !prev)}

                              className="focus:outline-none"

                            >

                              <svg

                                xmlns="http://www.w3.org/2000/svg"

                                fill="none"

                                viewBox="0 0 24 24"

                                strokeWidth={2}

                                stroke="currentColor"

                                className={`w-3.5 h-3.5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-350 shrink-0 ${statusFilter !== 'All' ? 'text-[#10B981]' : 'text-slate-400 dark:text-slate-500'}`}

                              >

                                <path

                                  strokeLinecap="round"

                                  strokeLinejoin="round"

                                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"

                                />

                              </svg>

                            </button>

                          </div>



                          {isStatusFilterOpen && (

                            <div ref={statusFilterRef} className="absolute left-0 top-[calc(100%+6px)] z-50 p-4 w-60 bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl">

                              <div className="relative mt-2">

                                <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-[#1a2235] text-[10px] text-slate-400 font-semibold select-none">

                                  Select Status

                                </label>

                                <select

                                  value={tempStatusFilter}

                                  onChange={(e) => setTempStatusFilter(e.target.value)}

                                  className="w-full px-3 py-2 text-sm bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] text-slate-850 dark:text-slate-100"

                                  style={{ colorScheme: 'dark light' }}

                                >

                                  <option value="All" className="bg-white dark:bg-[#1a2235]">All</option>

                                  <option value={TicketStatus.Open} className="bg-white dark:bg-[#1a2235]">Open</option>

                                  <option value={TicketStatus.InProgress} className="bg-white dark:bg-[#1a2235]">In Progress</option>

                                  <option value={TicketStatus.Closed} className="bg-white dark:bg-[#1a2235]">Closed</option>

                                </select>

                              </div>



                              <div className="flex items-center gap-2 mt-4 justify-between">

                                <button

                                  onClick={() => {

                                    setTempStatusFilter('All');

                                    setStatusFilter('All');

                                    setIsStatusFilterOpen(false);

                                  }}

                                  className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-full text-xs font-bold transition-colors"

                                >

                                  Reset

                                </button>

                                <button

                                  onClick={() => {

                                    setTempStatusFilter(statusFilter);

                                    setIsStatusFilterOpen(false);

                                  }}

                                  className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-full text-xs font-bold transition-colors"

                                >

                                  Cancel

                                </button>

                                <button

                                  onClick={() => {

                                    setStatusFilter(tempStatusFilter);

                                    setIsStatusFilterOpen(false);

                                  }}

                                  className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-full text-xs font-bold transition-colors"

                                >

                                  Apply

                                </button>

                              </div>

                            </div>

                          )}

                        </th>

                        <TicketTableHeader title="Priority" hasFilter />

                        <TicketTableHeader title="Contact Name" />

                        <TicketTableHeader title="Account Name" />

                        <TicketTableHeader title="Assigned to" />

                        <TicketTableHeader title="Created Date" />

                        <TicketTableHeader title="Updated Date" />

                        <th className="px-4 py-3 text-right font-bold text-[11px] tracking-wider text-slate-500 dark:text-slate-400">Actions</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">

                      {paginatedTickets.length === 0 ? (

                        <tr>

                          <td colSpan={11} className="py-12 bg-transparent">

                            <div className="flex flex-col items-center justify-center gap-5">

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

                                No Records Found!!!

                              </p>

                            </div>

                          </td>

                        </tr>

                      ) : (

                        paginatedTickets.map((ticket) => (

                          <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors bg-white dark:bg-[#1C232E]">

                            <td className="px-4 py-2.5">

                              <input

                                type="checkbox"

                                disabled

                                className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-not-allowed"

                              />

                            </td>

                            <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{ticket.ticketNo || '—'}</td>

                            <td className="px-4 py-3 text-slate-900 dark:text-white font-semibold">{ticket.subject}</td>

                            <td className="px-4 py-3">

                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(ticket.status)}`}>

                                {ticket.status}

                              </span>

                            </td>

                            <td className="px-4 py-3">

                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityColor(ticket.priority)}`}>

                                {ticket.priority || 'Normal'}

                              </span>

                            </td>

                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{ticket.contactName || fullName}</td>

                            <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{ticket.accountName || contact.accountName || '—'}</td>

                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{ticket.assignedTo || 'Unassigned'}</td>

                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-normal">

                              {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '—'}

                            </td>

                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-normal">

                              {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : '—'}

                            </td>

                            <td className="px-4 py-3 text-right">

                              <div className="flex items-center justify-end gap-2.5">

                                <button

                                  onClick={() => {

                                    setEditingTicket(ticket);

                                    setIsTicketModalOpen(true);

                                  }}

                                  className="text-slate-400 hover:text-emerald-500 transition-colors"

                                >

                                  <EditIcon className="h-3.5 w-3.5" />

                                </button>

                                <button

                                  onClick={() => handleDeleteTicket(ticket.id)}

                                  className="text-slate-400 hover:text-red-500 transition-colors font-bold text-sm"

                                >

                                  ✕

                                </button>

                              </div>

                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>



                {/* Pagination controls */}

                {totalPages > 1 && (

                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/5 select-none">

                    <span className="text-xs text-slate-500 font-semibold">

                      Page {safePage} of {totalPages}

                    </span>

                    <div className="flex items-center gap-2">

                      <button

                        disabled={safePage === 1}

                        onClick={() => setPage((p) => Math.max(1, p - 1))}

                        className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-500 transition-all"

                      >

                        <ChevronLeftIcon className="h-4 w-4" />

                      </button>

                      <button

                        disabled={safePage === totalPages}

                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}

                        className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-500 transition-all"

                      >

                        <ChevronRightIcon className="h-4 w-4" />

                      </button>

                    </div>

                  </div>

                )}

              </div>

            )}



            {/* Tab Contents: Conversation */}

            {activeTab === 'conversation' && (

              <div className="flex-1 flex items-center justify-center text-slate-500 py-12">

                Conversation history would appear here...

              </div>

            )}



            {/* Tab Contents: Merge History */}

            {activeTab === 'mergeHistory' && (

              <div className="flex-1 flex items-center justify-center text-slate-500 py-12">

                Merge history would appear here...

              </div>

            )}

          </div>

        </div>

      </div>

      {/* Edit Contact Modal */}

      <Modal

        isOpen={isContactEditModalOpen}

        onClose={() => setIsContactEditModalOpen(false)}

        title="Edit Contact"

      >

        <ContactForm

          contact={contact}

          onSave={handleSaveContact}

          onClose={() => setIsContactEditModalOpen(false)}

        />

      </Modal>



      {/* Ticket Modal */}

      <Modal

        isOpen={isTicketModalOpen}

        onClose={() => {

          setIsTicketModalOpen(false);

          setEditingTicket(null);

        }}

        title={editingTicket ? 'Edit Ticket' : 'Create Ticket'}

      >

        <TicketForm

          ticket={editingTicket}

          onSave={handleSaveTicket}

          onClose={() => {

            setIsTicketModalOpen(false);

            setEditingTicket(null);

          }}

          contactId={contact.id}

          contactName={fullName}

          accountName={contact.accountName}

        />

      </Modal>



      {/* Delete Contact Confirmation Modal (mobile only) */}

      {deleteConfirmOpen && (

        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center">

          <div className="bg-white dark:bg-[#151B25] w-full max-w-sm rounded-t-3xl lg:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/80 p-6 flex flex-col gap-5">

            {/* Icon */}

            <div className="flex flex-col items-center gap-3 text-center">

              <div className="h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center">

                <svg className="h-7 w-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>

                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />

                </svg>

              </div>

              <div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Contact?</h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">

                  This will permanently delete <span className="font-bold text-slate-700 dark:text-slate-300">{contact.firstName} {contact.lastName}</span> and cannot be undone.

                </p>

              </div>

            </div>

            {/* Actions */}

            <div className="flex gap-3">

              <button

                onClick={() => setDeleteConfirmOpen(false)}

                className="flex-1 py-3 text-xs font-extrabold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all"

              >

                Cancel

              </button>

              <button

                onClick={handleDeleteContact}

                className="flex-1 py-3 text-xs font-extrabold text-white bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 rounded-2xl hover:shadow-lg transition-all"

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



export default ContactDetails;