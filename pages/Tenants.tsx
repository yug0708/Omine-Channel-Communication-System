import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Tenants: React.FC = () => {
  const { currentUser } = useAuth();

  const rows = [
    { label: 'Organization', value: currentUser?.organizationName || '—' },
    { label: 'Owner', value: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '—' },
    { label: 'Email', value: currentUser?.email || '—' },
    { label: 'Phone', value: currentUser?.phone || '—' },
    { label: 'Industry', value: currentUser?.industry || '—' },
    { label: 'Company size', value: currentUser?.companySize || '—' },
    { label: 'Website', value: currentUser?.website || '—' },
    { label: 'CR number', value: currentUser?.crNumber || '—' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Tenants</h1>
        <p className="text-sm text-slate-500">The organization signed in on this workspace.</p>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Field</th>
              <th className="px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-slate-200 dark:border-white/10">
                <td className="px-4 py-3 font-semibold">{row.label}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tenants;
