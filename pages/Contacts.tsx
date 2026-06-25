import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { Contact } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import {
  PlusIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  MoreVertIcon,
  FilterFunnelIcon,
  UserIcon,
  UKFlagIcon,
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

const ContactForm: React.FC<{
  contact?: Contact | null;
  onSave: (
    contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> | Contact
  ) => void;
  onClose: () => void;
  currentUserName?: string;
}> = ({ contact, onSave, onClose, currentUserName = '' }) => {
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

  const validate = (currentFormData = formData) => {
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
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    
    if (isSubmitted) {
      setErrors(validate(updated));
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
          <FloatingInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" error={errors.email} />
          
          <FloatingInput label="Contact Number">
             <div className="flex items-center w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus-within:border-[#0056D2] overflow-hidden">
               <div className="flex items-center pl-4 pr-3 border-r border-slate-200 dark:border-slate-700">
                 <UKFlagIcon className="w-5 h-3.5 mr-1.5 rounded-sm object-cover" />
                 <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </div>
               <input
                 type="tel"
                 name="contactNumber"
                 value={formData.contactNumber}
                 onChange={handleChange}
                 placeholder="Enter phone number"
                 className="w-full px-4 py-3 bg-transparent focus:outline-none placeholder-slate-400"
               />
             </div>
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
              <div className="flex-1 flex items-center w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm text-slate-800 dark:text-white focus-within:border-[#0056D2] overflow-hidden">
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="Search Account..."
                  className="w-full px-4 py-3 bg-transparent focus:outline-none placeholder-slate-400"
                />
              </div>
              <button type="button" className="bg-[#10B981] text-white p-3 rounded-full hover:bg-[#059669] flex-shrink-0 transition-colors shadow-sm">
                <SearchIcon className="w-5 h-5" />
              </button>
              <button type="button" className="bg-[#10B981] text-white p-3 rounded-full hover:bg-[#059669] flex-shrink-0 transition-colors shadow-sm">
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

const Contacts: React.FC = () => {
  const { contacts, setContacts } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const currentUserName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : 'User';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

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
        <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80">
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            New Contact
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] w-64"
              />
            </div>

            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <MoreVertIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto hide-scrollbar">
          <table className="min-w-full w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-transparent border-b border-slate-200 dark:border-slate-800/80">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedContacts.length > 0 && selectedContacts.length === paginatedContacts.length}
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-[#0056D2] focus:ring-[#0056D2]"
                  />
                </th>
                <TableHeader title1="First" title2="Name" />
                <TableHeader title1="Last" title2="Name" />
                <TableHeader title1="Contact" title2="Number" />
                <TableHeader title1="Email" />
                <TableHeader title1="Account" title2="Name" />
                <TableHeader title1="Assigned" title2="to" />
                <TableHeader title1="Created" title2="Date" />
                <TableHeader title1="Updated" title2="Date" />
                <TableHeader title1="Actions" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No Contacts Found
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
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${isSelected ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectContact(contact.id, e as any)}
                          className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-700 text-[#0056D2] focus:ring-[#0056D2]"
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
                      <td className="px-4 py-3">{contact.lastName}</td>
                      <td className="px-4 py-3">{contact.contactNumber}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{contact.email}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{contact.accountName}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-medium text-slate-500">
                          {contact.assignedTo === 'Unassigned' ? 'Unassigned' : getInitials(contact.assignedTo, '')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] leading-tight text-center">
                        <div>{created.date}</div>
                        <div>{created.time}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] leading-tight text-center">
                        <div>{updated.date}</div>
                        <div>{updated.time}</div>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(contact)}
                            className="text-slate-400 hover:text-emerald-500 transition-colors p-1"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
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

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Row Per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-md py-1 px-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0056D2]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {(safePage - 1) * rowsPerPage + (filteredContacts.length > 0 ? 1 : 0)}-
              {Math.min(safePage * rowsPerPage, filteredContacts.length)} of {filteredContacts.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default Contacts;
