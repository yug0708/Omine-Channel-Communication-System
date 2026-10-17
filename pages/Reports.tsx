import React, { useMemo, useState } from 'react';
import { useData } from '../hooks/useData';
import { useChannel } from '../context/ChannelContext';

const TABS = ['Conversations', 'Messages', 'Support', 'Call logs'] as const;

const Reports: React.FC = () => {
  const { tickets } = useData();
  const { conversations } = useChannel();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Conversations');

  const messages = useMemo(
    () => conversations.flatMap((c) => c.messages.map((m) => ({ ...m, contactName: c.contactName, channel: c.channel }))),
    [conversations]
  );
  const calls = conversations.filter((c) => c.channel === 'Voice Call');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Report</h1>
        <p className="text-sm text-slate-500">Conversation, message, support, and call activity from this workspace.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === item ? 'bg-[#00A76F] text-white' : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card">
        {tab === 'Conversations' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Unread</th>
                <th className="px-4 py-3">Last message</th>
              </tr>
            </thead>
            <tbody>
              {conversations.length === 0 ? <Empty colSpan={5} label="No conversations yet" /> : conversations.map((c) => (
                <tr key={c.id} className="border-t border-slate-200 dark:border-white/10">
                  <td className="px-4 py-3 font-semibold">{c.contactName}</td>
                  <td className="px-4 py-3">{c.channel}</td>
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3 tabular-nums">{c.unreadCount}</td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[280px]">{c.lastMessage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'Messages' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? <Empty colSpan={5} label="No messages yet" /> : messages.map((m) => (
                <tr key={m.id} className="border-t border-slate-200 dark:border-white/10">
                  <td className="px-4 py-3 font-semibold">{m.contactName}</td>
                  <td className="px-4 py-3">{m.channel}</td>
                  <td className="px-4 py-3">{m.sender === 'me' ? 'Agent' : 'Contact'}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[320px] truncate">{m.text}</td>
                  <td className="px-4 py-3">{m.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'Support' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? <Empty colSpan={5} label="No tickets yet" /> : tickets.map((t) => (
                <tr key={t.id} className="border-t border-slate-200 dark:border-white/10">
                  <td className="px-4 py-3 font-mono text-xs">{t.ticketNo || t.id}</td>
                  <td className="px-4 py-3 font-semibold">{t.subject}</td>
                  <td className="px-4 py-3">{t.contactName || '—'}</td>
                  <td className="px-4 py-3">{t.status}</td>
                  <td className="px-4 py-3">{t.priority || 'Normal'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'Call logs' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last update</th>
              </tr>
            </thead>
            <tbody>
              {calls.length === 0 ? <Empty colSpan={4} label="No voice calls yet" /> : calls.map((c) => (
                <tr key={c.id} className="border-t border-slate-200 dark:border-white/10">
                  <td className="px-4 py-3 font-semibold">{c.contactName}</td>
                  <td className="px-4 py-3">{c.contactNumber || '—'}</td>
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3">{c.timeLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Empty: React.FC<{ colSpan: number; label: string }> = ({ colSpan, label }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-16 text-center font-display text-2xl text-slate-700 dark:text-slate-200">{label}</td>
  </tr>
);

export default Reports;
