
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Contact, Channel } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, WhatsAppIcon, LiveChatIcon, GoogleIcon } from '../components/icons/Icons';

const ChannelIcon: React.FC<{ channel: Channel, className?: string }> = ({ channel, className }) => {
    switch(channel) {
        case Channel.WhatsApp: return <WhatsAppIcon className={className} />;
        case Channel.LiveChat: return <LiveChatIcon className={className} />;
        case Channel.Google: return <GoogleIcon className={className} />;
        default: return null;
    }
}

const ContactForm: React.FC<{
  contact?: Contact | null;
  onSave: (contact: Omit<Contact, 'id'> | Contact) => void;
  onClose: () => void;
}> = ({ contact, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    channel: contact?.channel || Channel.LiveChat,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contact) {
      onSave({ ...contact, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" />
      </div>
      <div>
        <label htmlFor="channel" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Channel</label>
        <select name="channel" id="channel" value={formData.channel} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600">
            {Object.values(Channel).map(channel => <option key={channel} value={channel}>{channel}</option>)}
        </select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Contact</Button>
      </div>
    </form>
  );
};

const Contacts: React.FC = () => {
  const { contacts, setContacts } = useData();
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

  const handleSaveContact = (contactData: Omit<Contact, 'id'> | Contact) => {
    if ('id' in contactData) {
      setContacts(contacts.map(c => c.id === contactData.id ? contactData : c));
    } else {
      const newContact = { ...contactData, id: `con${Date.now()}` };
      setContacts([...contacts, newContact]);
    }
    handleCloseModal();
  };
  
  const handleDeleteContact = (id: string) => {
    if(window.confirm('Are you sure you want to delete this contact?')){
      setContacts(contacts.filter(c => c.id !== id));
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg">
      <div className="p-4 sm:p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Contacts</h2>
        <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Contact
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Phone</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Channel</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{contact.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{contact.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{contact.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                        <ChannelIcon channel={contact.channel} className="h-5 w-5 mr-2" />
                        {contact.channel}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleOpenModal(contact)} className="text-primary-600 hover:text-primary-900 p-1"><EditIcon className="h-5 w-5"/></button>
                  <button onClick={() => handleDeleteContact(contact.id)} className="text-red-600 hover:text-red-900 p-1"><DeleteIcon className="h-5 w-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingContact ? 'Edit Contact' : 'Add New Contact'}>
          <ContactForm contact={editingContact} onSave={handleSaveContact} onClose={handleCloseModal} />
       </Modal>
    </div>
  );
};

export default Contacts;
