import React from 'react';
import { NavLink } from 'react-router-dom';

import {
  DashboardIcon,
  AccountsIcon,
  ContactsIcon,
  InboxIcon,
  CampaignIcon,
  ChannelIcon,
  ReportIcon,
  SettingIcon,
  UCLogo,
} from '../icons/Icons';

// Calendar Icon
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? 'h-6 w-6'}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13z" />
    <path d="M7 10h5v5H7z" />
  </svg>
);

// Automation Icon
const AutomationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? 'h-6 w-6'}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Tenants Icon
const TenantsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? 'h-6 w-6'}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const navLinks = [
  { to: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { to: '/accounts', icon: AccountsIcon, label: 'Accounts' },
  { to: '/contacts', icon: ContactsIcon, label: 'Contacts' },
  { to: '/tickets', icon: InboxIcon, label: 'Inbox' },
  { to: '/campaign', icon: CampaignIcon, label: 'Campaign' },
  { to: '/channels', icon: ChannelIcon, label: 'Channel' },
  { to: '/report', icon: ReportIcon, label: 'Report' },
  { to: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  { to: '/settings', icon: SettingIcon, label: 'Setting' },
  { to: '/automation', icon: AutomationIcon, label: 'Automation' },
  { to: '/tenants', icon: TenantsIcon, label: 'Tenants' },
];

const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = false, onClose }) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-white dark:bg-slate-900/95 flex flex-col items-stretch py-3 border-r border-slate-200 dark:border-white/[0.08] flex-shrink-0 overflow-y-auto overflow-x-hidden backdrop-blur-sm transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:w-[72px] md:flex md:items-center ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Mobile Header */}
      <div className="w-full flex items-center justify-between px-4 mb-5 md:hidden flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <UCLogo className="h-8 w-8" />
          <span className="font-extrabold text-sm tracking-wide text-slate-800 dark:text-white">CommuniDesk</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title="Close Menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Logo for Desktop */}
      <div className="hidden md:block mb-4 flex-shrink-0 p-1.5">
        <UCLogo className="h-9 w-9" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full">
        <ul className="flex flex-col items-stretch md:items-center gap-1.5 px-3 md:px-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <li key={to} className="w-full">
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex flex-row md:flex-col items-center justify-start md:justify-center gap-3 md:gap-1 py-3 md:py-2 px-4 md:px-1 rounded-xl w-full transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-500 dark:hover:text-emerald-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                        isActive ? '' : 'group-hover:scale-110'
                      }`}
                    />

                    <span
                      className={`text-sm md:text-[9px] font-bold tracking-wide leading-none text-left md:text-center truncate w-full px-0.5 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'
                      }`}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
