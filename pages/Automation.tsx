import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Button from '../components/ui/Button';

type Trigger = 'New message' | 'Ticket created' | 'Contact created';

interface Workflow {
  id: string;
  name: string;
  trigger: Trigger;
  status: 'Active' | 'Paused';
  steps: string;
}

const TRIGGERS: Trigger[] = ['New message', 'Ticket created', 'Contact created'];

const Automation: React.FC = () => {
  const { currentUser } = useAuth();
  const [workflows, setWorkflows] = useLocalStorage<Workflow[]>(`workflows_${currentUser?.email || 'guest'}`, []);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<Trigger>('New message');
  const [steps, setSteps] = useState('');

  const addWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setWorkflows((prev) => [
      { id: `wf-${Date.now()}`, name: name.trim(), trigger, status: 'Active', steps: steps.trim() },
      ...prev,
    ]);
    setName('');
    setSteps('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Automation</h1>
        <p className="text-sm text-slate-500">Workflows that run when a message, ticket, or contact arrives.</p>
      </div>

      <form onSubmit={addWorkflow} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-[10px] p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name" className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm" />
        <select value={trigger} onChange={(e) => setTrigger(e.target.value as Trigger)} className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm">
          {TRIGGERS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="What should happen" className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm" />
        <Button type="submit">Add workflow</Button>
      </form>

      <div className="grid gap-3">
        {workflows.length === 0 && (
          <div className="rounded-[10px] border border-dashed border-slate-300 dark:border-white/10 px-6 py-14 text-center">
            <p className="font-display text-2xl">No workflows yet</p>
            <p className="mt-1 text-sm text-slate-500">Add a trigger and the step the agent should take.</p>
          </div>
        )}
        {workflows.map((wf) => (
          <div key={wf.id} className="flex items-center justify-between gap-4 rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card px-4 py-3">
            <div>
              <p className="font-semibold">{wf.name}</p>
              <p className="text-sm text-slate-500">{wf.trigger}{wf.steps ? ` · ${wf.steps}` : ''}</p>
            </div>
            <button
              type="button"
              onClick={() => setWorkflows((prev) => prev.map((item) => item.id === wf.id ? { ...item, status: item.status === 'Active' ? 'Paused' : 'Active' } : item))}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${wf.status === 'Active' ? 'bg-primary-100 text-primary-800' : 'bg-amber-100 text-amber-800'}`}
            >
              {wf.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Automation;
