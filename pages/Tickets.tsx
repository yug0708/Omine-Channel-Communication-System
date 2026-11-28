import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useToast } from '../context/ToastContext';
import { Ticket, TicketPriority, TicketStatus } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';

const PAGE_SIZE = 10;

const statusClass: Record<TicketStatus, string> = {
  [TicketStatus.Open]: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-300',
  [TicketStatus.InProgress]: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300',
  [TicketStatus.OnHold]: 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-white/10 dark:text-slate-300',
  [TicketStatus.Closed]: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300',
};

const priorityClass: Record<TicketPriority, string> = {
  [TicketPriority.Low]: 'text-teal-700 bg-teal-50',
  [TicketPriority.Normal]: 'text-emerald-700 bg-emerald-50',
  [TicketPriority.High]: 'text-orange-700 bg-orange-50',
  [TicketPriority.Urgent]: 'text-red-700 bg-red-50',
};

function contactLabel(ticket: Ticket, contacts: { id: string; firstName: string; lastName: string }[]) {
  if (ticket.contactName) return ticket.contactName;
  const contact = contacts.find((c) => c.id === ticket.contactId);
  return contact ? `${contact.firstName} ${contact.lastName}`.trim() : '—';
}

const Tickets: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tickets, contacts, accounts, saveTicket, deleteTicketsBatch } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<TicketStatus>(TicketStatus.Open);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);

  const assignees = useMemo(() => {
    const names = new Set<string>();
    if (currentUser) names.add(`${currentUser.firstName} ${currentUser.lastName}`.trim());
    contacts.forEach((c) => c.assignedTo && names.add(c.assignedTo));
    tickets.forEach((t) => t.assignedTo && names.add(t.assignedTo));
    return Array.from(names).filter((n) => n && n !== 'Unassigned');
  }, [contacts, tickets, currentUser]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...tickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((ticket) => {
        const haystack = [
          ticket.ticketNo,
          ticket.subject,
          contactLabel(ticket, contacts),
          ticket.accountName,
          ticket.status,
          ticket.priority,
          ticket.assignedTo,
        ].join(' ').toLowerCase();
        if (q && !haystack.includes(q)) return false;
        if (statusFilter !== 'All' && ticket.status !== statusFilter) return false;
        if (priorityFilter !== 'All' && (ticket.priority || TicketPriority.Normal) !== priorityFilter) return false;
        if (assigneeFilter === 'Unassigned' && ticket.assignedTo) return false;
        if (assigneeFilter !== 'All' && assigneeFilter !== 'Unassigned' && ticket.assignedTo !== assigneeFilter) return false;
        return true;
      });
  }, [tickets, search, statusFilter, priorityFilter, assigneeFilter, contacts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const allPageSelected = pageRows.length > 0 && pageRows.every((t) => selected.includes(t.id));

  const persistTicket = async (data: Partial<Ticket>) => {
    const now = new Date().toISOString();
    if (editing) {
      await saveTicket({ ...editing, ...data, updatedAt: now, lastActivity: now });
    } else {
      const contact = contacts.find((c) => c.id === data.contactId);
      const account = accounts.find((a) => a.name === contact?.accountName);
      await saveTicket({
        id: `tkt${Date.now()}`,
        ticketNo: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: data.subject || '',
        description: data.description || '',
        contactId: data.contactId || '',
        contactName: contact ? `${contact.firstName} ${contact.lastName}`.trim() : '',
        accountId: account?.id || '',
        accountName: contact?.accountName || '',
        status: data.status || TicketStatus.Open,
        priority: data.priority || TicketPriority.Normal,
        assignedTo: data.assignedTo || '',
        createdAt: now,
        updatedAt: now,
        lastActivity: now,
        comments: [],
      });
    }
    setModalOpen(false);
    setEditing(null);
  };

  const deleteIds = async (ids: string[]) => {
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} ticket${ids.length > 1 ? 's' : ''}?`)) return;
    await deleteTicketsBatch(ids);
    setSelected((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const applyBulkStatus = async () => {
    if (!selected.length) return;
    const now = new Date().toISOString();
    await Promise.all(selected.map((id) => {
      const ticket = tickets.find((item) => item.id === id);
      if (!ticket) return Promise.resolve();
      return saveTicket({ ...ticket, status: bulkStatus, updatedAt: now, lastActivity: now });
    }));
    showToast(`Updated ${selected.length} ticket${selected.length > 1 ? 's' : ''}`, 'success');
  };

  const exportCsv = () => {
    if (!filtered.length) {
      showToast('No tickets available to export.', 'error');
      return;
    }
    const headers = ['Ticket No', 'Title', 'Status', 'Priority', 'Contact Name', 'Account Name', 'Assigned To', 'Created Date', 'Updated Date'];
    const rows = filtered.map((t) => [
      t.ticketNo || '',
      t.subject,
      t.status,
      t.priority || TicketPriority.Normal,
      contactLabel(t, contacts),
      t.accountName || '',
      t.assignedTo || 'Unassigned',
      t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
      t.updatedAt ? new Date(t.updatedAt).toLocaleString() : '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Tickets</h1>
          <p className="text-sm text-slate-500">{filtered.length} ticket{filtered.length === 1 ? '' : 's'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCsv}>Export</Button>
          <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Create ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search tickets"
          className="rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-dark-card px-3 py-2 text-sm"
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-dark-card px-3 py-2 text-sm">
          <option value="All">All statuses</option>
          {Object.values(TicketStatus).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-dark-card px-3 py-2 text-sm">
          <option value="All">All priorities</option>
          {Object.values(TicketPriority).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={assigneeFilter} onChange={(e) => { setAssigneeFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-dark-card px-3 py-2 text-sm">
          <option value="All">All assignees</option>
          <option value="Unassigned">Unassigned</option>
          {assignees.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card px-3 py-2">
          <span className="text-sm font-semibold">{selected.length} selected</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as TicketStatus)} className="rounded-md border border-slate-300 dark:border-white/10 bg-transparent px-2 py-1 text-sm">
            {Object.values(TicketStatus).map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button type="button" onClick={applyBulkStatus}>Update status</Button>
          <Button type="button" variant="danger" onClick={() => deleteIds(selected)}>Delete</Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={() => {
                    const ids = pageRows.map((t) => t.id);
                    setSelected((prev) => allPageSelected ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids])));
                  }}
                />
              </th>
              <th className="px-3 py-3">Ticket no</th>
              <th className="px-3 py-3">Title</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Contact</th>
              <th className="px-3 py-3">Account</th>
              <th className="px-3 py-3">Assigned to</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3">Updated</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-16 text-center font-display text-2xl">No tickets found</td>
              </tr>
            ) : pageRows.map((ticket) => (
              <tr key={ticket.id} className="border-t border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(ticket.id)}
                    onChange={() => setSelected((prev) => prev.includes(ticket.id) ? prev.filter((id) => id !== ticket.id) : [...prev, ticket.id])}
                  />
                </td>
                <td className="px-3 py-3 font-mono text-xs">{ticket.ticketNo || '—'}</td>
                <td className="px-3 py-3">
                  <button type="button" className="font-semibold text-left hover:text-[#00A76F]" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                    {ticket.subject}
                  </button>
                </td>
                <td className="px-3 py-3"><span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClass[ticket.status]}`}>{ticket.status}</span></td>
                <td className="px-3 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityClass[ticket.priority || TicketPriority.Normal]}`}>{ticket.priority || TicketPriority.Normal}</span></td>
                <td className="px-3 py-3">{contactLabel(ticket, contacts)}</td>
                <td className="px-3 py-3">{ticket.accountName || '—'}</td>
                <td className="px-3 py-3">{ticket.assignedTo || 'Unassigned'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-3 whitespace-nowrap">{ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <button type="button" className="p-1 text-primary-700" onClick={() => { setEditing(ticket); setModalOpen(true); }}><EditIcon className="h-4 w-4" /></button>
                  <button type="button" className="p-1 text-red-600" onClick={() => deleteIds([ticket.id])}><DeleteIcon className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Page {safePage} of {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Previous</Button>
          <Button variant="secondary" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Next</Button>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit ticket' : 'Create ticket'}>
        <TicketForm
          ticket={editing}
          contacts={contacts}
          assignees={assignees}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSave={persistTicket}
        />
      </Modal>
    </div>
  );
};

const TicketForm: React.FC<{
  ticket: Ticket | null;
  contacts: { id: string; firstName: string; lastName: string; accountName: string }[];
  assignees: string[];
  onSave: (data: Partial<Ticket>) => void;
  onClose: () => void;
}> = ({ ticket, contacts, assignees, onSave, onClose }) => {
  const [form, setForm] = useState({
    subject: ticket?.subject || '',
    description: ticket?.description || '',
    contactId: ticket?.contactId || contacts[0]?.id || '',
    assignedTo: ticket?.assignedTo || assignees[0] || '',
    status: ticket?.status || TicketStatus.Open,
    priority: ticket?.priority || TicketPriority.Normal,
  });

  const contact = contacts.find((c) => c.id === form.contactId);
  const field = 'mt-1 w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-dark-card px-3 py-2 text-sm';

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <label className="block text-sm font-medium">Title
        <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={field} placeholder="Enter title" />
      </label>
      <label className="block text-sm font-medium">Contact
        <select required value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} className={field}>
          {contacts.map((c) => <option key={c.id} value={c.id}>{`${c.firstName} ${c.lastName}`.trim()}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">Account
        <input disabled value={contact?.accountName || '—'} className={`${field} opacity-70`} />
      </label>
      <label className="block text-sm font-medium">Assigned to
        <select required value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className={field}>
          {assignees.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">Priority
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })} className={field}>
            {Object.values(TicketPriority).map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Status
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TicketStatus })} className={field}>
            {Object.values(TicketStatus).map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium">Description
        <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={field} placeholder="Enter description" />
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save ticket</Button>
      </div>
    </form>
  );
};

export default Tickets;
