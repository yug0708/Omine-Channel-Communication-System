
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Ticket, TicketStatus } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon, SparklesIcon } from '../components/icons/Icons';
import { summarizeTicket } from '../services/geminiService';

const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const colorClasses = {
    [TicketStatus.Open]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    [TicketStatus.InProgress]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    [TicketStatus.Closed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[status]}`}>
      {status}
    </span>
  );
};

const TicketForm: React.FC<{
  ticket?: Ticket | null;
  onSave: (ticket: Omit<Ticket, 'id' | 'createdAt'> | Ticket) => void;
  onClose: () => void;
}> = ({ ticket, onSave, onClose }) => {
  const { contacts, accounts } = useData();
  const [formData, setFormData] = useState({
    subject: ticket?.subject || '',
    description: ticket?.description || '',
    contactId: ticket?.contactId || (contacts.length > 0 ? contacts[0].id : ''),
    accountId: ticket?.accountId || (accounts.length > 0 ? accounts[0].id : ''),
    status: ticket?.status || TicketStatus.Open,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticket) {
      onSave({ ...ticket, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
        <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={4} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="contactId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact</label>
          <select name="contactId" id="contactId" value={formData.contactId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600">
            {contacts.map(c => <option key={c.id} value={c.id}>{`${c.firstName} ${c.lastName}`.trim()}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account</label>
          <select name="accountId" id="accountId" value={formData.accountId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600">
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
        <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600">
          {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Ticket</Button>
      </div>
    </form>
  );
};

const TicketRow: React.FC<{ ticket: Ticket; onEdit: () => void; onDelete: () => void }> = ({ ticket, onEdit, onDelete }) => {
  const { contacts } = useData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const contact = contacts.find(c => c.id === ticket.contactId);

  const handleSummarize = async () => {
    setIsLoadingSummary(true);
    const result = await summarizeTicket(ticket.description);
    setSummary(result);
    setIsLoadingSummary(false);
  }

  return (
    <>
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{ticket.subject}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{contact ? `${contact.firstName} ${contact.lastName}`.trim() : 'N/A'}</td>
        <td className="px-6 py-4 whitespace-nowrap"><TicketStatusBadge status={ticket.status} /></td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={e => e.stopPropagation()}>
          <button onClick={onEdit} className="text-primary-600 hover:text-primary-900 p-1"><EditIcon className="h-5 w-5" /></button>
          <button onClick={onDelete} className="text-red-600 hover:text-red-900 p-1"><DeleteIcon className="h-5 w-5" /></button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="p-0">
            <div className="p-6 bg-slate-100 dark:bg-slate-900/50">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Full Description</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{ticket.description}</p>
              <div className="mt-4">
                <Button onClick={handleSummarize} disabled={isLoadingSummary}>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  {isLoadingSummary ? 'Summarizing...' : 'Summarize with Gemini'}
                </Button>
              </div>
              {summary && (
                <div className="mt-4 p-4 rounded-md bg-primary-50 dark:bg-slate-700">
                  <h5 className="font-semibold flex items-center"><SparklesIcon className="h-5 w-5 mr-2 text-primary-500" /> AI Summary</h5>
                  <p className="mt-2 text-sm text-primary-800 dark:text-primary-200 whitespace-pre-wrap">{summary}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const Tickets: React.FC = () => {
  const { tickets, setTickets } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const handleOpenModal = (ticket: Ticket | null = null) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTicket(null);
    setIsModalOpen(false);
  };

  const handleSaveTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt'> | Ticket) => {
    if ('id' in ticketData) {
      setTickets(tickets.map(t => t.id === ticketData.id ? ticketData : t));
    } else {
      const newTicket: Ticket = { ...ticketData, id: `tkt${Date.now()}`, createdAt: new Date().toISOString() };
      setTickets([newTicket, ...tickets]);
    }
    handleCloseModal();
  };

  const handleDeleteTicket = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      setTickets(tickets.filter(t => t.id !== id));
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg">
      <div className="p-4 sm:p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Tickets</h2>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Ticket
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Subject</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Created At</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {tickets.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                onEdit={() => handleOpenModal(ticket)}
                onDelete={() => handleDeleteTicket(ticket.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTicket ? 'Edit Ticket' : 'Add New Ticket'}>
        <TicketForm ticket={editingTicket} onSave={handleSaveTicket} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Tickets;
