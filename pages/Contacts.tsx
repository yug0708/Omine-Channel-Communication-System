import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { Contact } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon, MoreVertIcon, FilterFunnelIcon, UserIcon } from '../components/icons/Icons';

// Helper to generate initials
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || '?';
};

// Helper for random background colors for avatars
const colors = ['bg-purple-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500'];
const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const ContactForm: React.FC<{
  contact?: Contact | null;
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> | Contact) => void;
  onClose: () => void;
}> = ({ contact, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    contactNumber: contact?.contactNumber || '',
    accountName: contact?.accountName || '',
    assignedTo: contact?.assignedTo || 'Unassigned',
    lifecycle: contact?.lifecycle || 'NA',
    labels: contact?.labels || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...contact, ...formData } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-[#0056D2] focus:ring-[#0056D2] dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-[#0056D2] focus:ring-[#0056D2] dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Number</label>
          <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-[#0056D2] focus:ring-[#0056D2] dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-[#0056D2] focus:ring-[#0056D2] dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

const Contacts: React.FC = () => {
  const { contacts, setContacts } = useData();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

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
      setContacts(contacts.map(c => c.id === contactData.id ? { ...contactData, updatedAt: now } : c));
    } else {
      const newContact = { ...contactData, id: `con${Date.now()}`, createdAt: now, updatedAt: now };
      setContacts([...contacts, newContact]);
    }
    handleCloseModal();
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-300 ml-1">Contacts</h1>

      <div className="bg-white dark:bg-[#151B25] shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col flex-1 overflow-hidden">
        {/* Action Bar */}
        <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80">
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#0056D2] hover:bg-[#00449E] text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            New Contact
          </button>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
            </button>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] w-64"
              />
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <MoreVertIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-transparent text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800/80 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th scope="col" className="px-4 py-3 w-12 text-center pb-4"><input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 bg-transparent" /></th>
                <th scope="col" className="px-4 py-3"><div className="flex items-center gap-2">First Name <FilterFunnelIcon className="h-4 w-4" /></div></th>
                <th scope="col" className="px-4 py-3"><div className="flex items-center gap-2">Last Name <FilterFunnelIcon className="h-4 w-4" /></div></th>
                <th scope="col" className="px-4 py-3"><div className="flex items-center gap-2">Contact <br /> Number <FilterFunnelIcon className="h-4 w-4" /></div></th>
                <th scope="col" className="px-4 py-3">Email</th>
                <th scope="col" className="px-4 py-3">Account Name</th>
                <th scope="col" className="px-4 py-3">Assigned <br /> to</th>
                <th scope="col" className="px-4 py-3"><div className="flex items-center gap-2">Lifecycle <FilterFunnelIcon className="h-4 w-4" /></div></th>
                <th scope="col" className="px-4 py-3"><div className="flex items-center gap-2">Labels <FilterFunnelIcon className="h-4 w-4" /></div></th>
                <th scope="col" className="px-4 py-3"><div className="flex items-center gap-2">Created <br /> Date <FilterFunnelIcon className="h-4 w-4" /></div></th>
                <th scope="col" className="px-4 py-3"><div className="flex items-center gap-2">Updated <br /> Date <FilterFunnelIcon className="h-4 w-4" /></div></th>
                <th scope="col" className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
              {contacts.map((contact) => {
                const created = formatDate(contact.createdAt);
                const updated = formatDate(contact.updatedAt);
                const isNameBlank = !contact.firstName?.trim() && !contact.lastName?.trim();
                return (
                  <tr
                    key={contact.id}
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 bg-transparent" /></td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${isNameBlank ? 'bg-slate-300 dark:bg-slate-500 text-slate-600 dark:text-slate-900 pt-1.5' : `text-white ${getAvatarColor(contact.firstName || contact.lastName)}`}`}>
                          {contact.avatarUrl ? (
                            <img src={contact.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : isNameBlank ? (
                            <UserIcon className="h-6 w-6 relative top-[1px]" />
                          ) : (
                            getInitials(contact.firstName, contact.lastName)
                          )}
                        </div>
                        {contact.firstName}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{contact.lastName}</td>
                    <td className="px-4 py-3">{contact.contactNumber}</td>
                    <td className="px-4 py-3">{contact.email}</td>
                    <td className="px-4 py-3">{contact.accountName}</td>
                    <td className="px-4 py-3">{contact.assignedTo}</td>
                    <td className="px-4 py-3 font-medium">{contact.lifecycle}</td>
                    <td className="px-4 py-3">{contact.labels}</td>
                    <td className="px-4 py-3 text-xs leading-tight">
                      <div>{created.date}</div>
                      <div className="text-slate-500 dark:text-slate-400">{created.time}</div>
                    </td>
                    <td className="px-4 py-3 text-xs leading-tight">
                      <div>{updated.date}</div>
                      <div className="text-slate-500 dark:text-slate-400">{updated.time}</div>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(contact)} className="text-slate-400 hover:text-purple-500 transition-colors p-1" title="Edit">
                          <EditIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteContact(contact.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete">
                          <DeleteIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end text-xs font-semibold text-slate-500 dark:text-slate-100 gap-6 bg-slate-50 dark:bg-[#151B25]">
          <div className="flex items-center gap-2">
            Row Per page
            <select className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700 dark:text-white">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <div className="text-white font-bold text-xs">1-10 of 17</div>
          <div className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-white">
            <button className="p-1 hover:text-purple-500 transition-colors">&lt;</button>
            <button className="p-1 hover:text-purple-500 transition-colors">&gt;</button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingContact ? 'Edit Contact' : 'Add New Contact'}>
        <ContactForm contact={editingContact} onSave={handleSaveContact} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Contacts;
