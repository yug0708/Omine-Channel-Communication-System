import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Ticket, TicketComment, TicketPriority, TicketStatus } from '../types';
import Button from '../components/ui/Button';
import { summarizeTicket } from '../services/geminiService';

const fieldClass = 'w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-dark-card px-3 py-2 text-sm';

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tickets, contacts, accounts, saveTicket } = useData();
  const ticket = tickets.find((t) => t.id === id);
  const [comment, setComment] = useState('');
  const [assignee, setAssignee] = useState(ticket?.assignedTo || '');
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    setAssignee(ticket?.assignedTo || '');
  }, [ticket?.id, ticket?.assignedTo]);

  if (!ticket) {
    return (
      <div className="p-8 text-center text-slate-500">
        Ticket not found.
        <button type="button" className="ml-2 font-semibold text-[#00A76F]" onClick={() => navigate('/tickets')}>Back to tickets</button>
      </div>
    );
  }

  const contact = contacts.find((c) => c.id === ticket.contactId);
  const account = accounts.find((a) => a.id === ticket.accountId) || accounts.find((a) => a.name === (ticket.accountName || contact?.accountName));
  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'Agent';

  const patch = (partial: Partial<Ticket>) => {
    if (!ticket) return;
    const now = new Date().toISOString();
    void saveTicket({ ...ticket, ...partial, updatedAt: now, lastActivity: now });
  };

  const changeContact = (contactId: string) => {
    const next = contacts.find((c) => c.id === contactId);
    const nextAccount = accounts.find((a) => a.name === next?.accountName);
    patch({
      contactId,
      contactName: next ? `${next.firstName} ${next.lastName}`.trim() : '',
      accountId: nextAccount?.id || '',
      accountName: next?.accountName || '',
    });
  };

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = comment.trim();
    if (!text) return;
    const next: TicketComment = {
      id: `cmt-${Date.now()}`,
      userName,
      content: text,
      createdAt: new Date().toISOString(),
    };
    patch({ comments: [...(ticket.comments || []), next] });
    setComment('');
  };

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => navigate('/tickets')} className="text-sm font-semibold text-[#00A76F]">← Tickets</button>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <div className="space-y-3">
          <div className="rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card p-4">
            <p className="font-mono text-xs text-slate-500">{ticket.ticketNo || ticket.id}</p>
            <h1 className="mt-1 text-xl font-semibold leading-snug">{ticket.subject}</h1>
          </div>
          <div className="rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card p-4 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Status
              <select className={`${fieldClass} mt-1`} value={ticket.status} onChange={(e) => patch({ status: e.target.value as TicketStatus })}>
                {Object.values(TicketStatus).map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Priority
              <select className={`${fieldClass} mt-1`} value={ticket.priority || TicketPriority.Normal} onChange={(e) => patch({ priority: e.target.value as TicketPriority })}>
                {Object.values(TicketPriority).map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Created on
              <input disabled className={`${fieldClass} mt-1 opacity-70`} value={new Date(ticket.createdAt).toLocaleString()} />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned to
              <input
                className={`${fieldClass} mt-1`}
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                onBlur={() => {
                  if (assignee !== (ticket.assignedTo || '')) patch({ assignedTo: assignee });
                }}
                placeholder="Select assignee"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Contact
              <select className={`${fieldClass} mt-1`} value={ticket.contactId} onChange={(e) => changeContact(e.target.value)}>
                {contacts.map((c) => <option key={c.id} value={c.id}>{`${c.firstName} ${c.lastName}`.trim()}</option>)}
              </select>
            </label>
            {contact && <Link to={`/contacts/${contact.id}`} className="text-sm font-semibold text-[#00A76F]">Open contact</Link>}
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Account
              <input disabled className={`${fieldClass} mt-1 opacity-70`} value={ticket.accountName || contact?.accountName || '—'} />
            </label>
            {account && <Link to={`/accounts/${account.id}`} className="text-sm font-semibold text-[#00A76F]">Open account</Link>}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Description</p>
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
              <button
                type="button"
                disabled={summarizing}
                onClick={async () => {
                  setSummarizing(true);
                  setSummary(await summarizeTicket(ticket.description));
                  setSummarizing(false);
                }}
                className="mt-3 text-xs font-semibold text-[#00A76F]"
              >
                {summarizing ? 'Summarizing...' : 'Summarize'}
              </button>
              {summary && <p className="mt-2 rounded-md bg-primary-50 dark:bg-white/5 p-3 text-sm whitespace-pre-wrap">{summary}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card flex flex-col min-h-[480px]">
          <div className="border-b border-slate-200 dark:border-white/10 px-4 py-3 font-semibold">Comments</div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {(ticket.comments || []).length === 0 && (
              <p className="font-display text-2xl text-slate-600 dark:text-slate-300">No comments yet</p>
            )}
            {(ticket.comments || []).map((item) => (
              <div key={item.id} className="rounded-lg bg-slate-100 dark:bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{item.userName}</span>
                  <span className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-wrap">{item.content}</p>
              </div>
            ))}
          </div>
          <form onSubmit={addComment} className="border-t border-slate-200 dark:border-white/10 p-4 flex gap-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Write a comment"
              className="flex-1 rounded-md border border-slate-300 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            />
            <Button type="submit" disabled={!comment.trim()}>Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
