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

    </div>

  );

};



export default ContactDetails;