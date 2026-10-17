import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Button from '../components/ui/Button';
import { ChannelName } from '../context/ChannelContext';

type CampaignStatus = 'Draft' | 'Scheduled' | 'Sent';

interface CampaignItem {
  id: string;
  name: string;
  channel: ChannelName;
  status: CampaignStatus;
  audience: number;
  createdAt: string;
}

const CHANNELS: ChannelName[] = ['WhatsApp', 'Email', 'SMS', 'Messenger', 'Instagram'];

const Campaign: React.FC = () => {
  const { currentUser } = useAuth();
  const storageKey = `campaigns_${currentUser?.email || 'guest'}`;
  const [campaigns, setCampaigns] = useLocalStorage<CampaignItem[]>(storageKey, []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<ChannelName>('WhatsApp');
  const [audience, setAudience] = useState(0);
  const [status, setStatus] = useState<CampaignStatus>('Draft');

  const createCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCampaigns((prev) => [
      {
        id: `cmp-${Date.now()}`,
        name: name.trim(),
        channel,
        status,
        audience: Number(audience) || 0,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setName('');
    setAudience(0);
    setStatus('Draft');
    setOpen(false);
  };

  const cycleStatus = (id: string) => {
    const order: CampaignStatus[] = ['Draft', 'Scheduled', 'Sent'];
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, status: order[(order.indexOf(c.status) + 1) % order.length] };
      })
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Campaign</h1>
          <p className="text-sm text-slate-500">Send a message to a contact audience on one channel.</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>{open ? 'Close' : 'New campaign'}</Button>
      </div>

      {open && (
        <form onSubmit={createCampaign} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-[10px] p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Campaign name"
            className="md:col-span-2 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
          />
          <select value={channel} onChange={(e) => setChannel(e.target.value as ChannelName)} className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm">
            {CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="number" min={0} value={audience} onChange={(e) => setAudience(Number(e.target.value))} placeholder="Audience" className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value as CampaignStatus)} className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm">
              <option>Draft</option>
              <option>Scheduled</option>
              <option>Sent</option>
            </select>
            <Button type="submit">Save</Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Channel</th>
              <th className="px-4 py-3 font-semibold">Audience</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <p className="font-display text-2xl text-slate-800 dark:text-white">No campaigns yet</p>
                  <p className="mt-1 text-sm text-slate-500">Create one to reach contacts on WhatsApp, email, or SMS.</p>
                </td>
              </tr>
            ) : campaigns.map((c) => (
              <tr key={c.id} className="border-t border-slate-200 dark:border-white/10">
                <td className="px-4 py-3 font-semibold">{c.name}</td>
                <td className="px-4 py-3">{c.channel}</td>
                <td className="px-4 py-3 tabular-nums">{c.audience}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => cycleStatus(c.id)} className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-800 dark:bg-primary-900 dark:text-primary-100">
                    {c.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Campaign;
