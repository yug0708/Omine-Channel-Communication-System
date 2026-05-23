
import React from 'react';
import { NavLink } from 'react-router-dom';
<<<<<<< HEAD
import { DashboardIcon, AccountsIcon, ContactsIcon, InboxIcon, CampaignIcon, ChannelIcon, ReportIcon, SettingIcon, UCLogo } from '../icons/Icons';

const navLinks = [
  { to: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { to: '/accounts', icon: AccountsIcon, label: 'Accounts' },
  { to: '/contacts', icon: ContactsIcon, label: 'Contacts' },
  { to: '/tickets', icon: InboxIcon, label: 'Inbox' }, // Mapping Tickets to Inbox
  { to: '/campaign', icon: CampaignIcon, label: 'Campaign' },
  { to: '/channels', icon: ChannelIcon, label: 'Channel' },
  { to: '/report', icon: ReportIcon, label: 'Report' },
  { to: '/settings', icon: SettingIcon, label: 'Setting' },
];


const Sidebar: React.FC = () => {
  return (
    <div className="w-20 bg-white dark:bg-dark-card flex flex-col items-center py-4 space-y-6 border-r border-slate-200 dark:border-slate-700">
      <div className="p-2">
        <UCLogo className="h-10 w-10" />
      </div>
      <nav className="flex-1 w-full">
        <ul className="flex flex-col items-center space-y-3">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <li key={to} className="w-full flex justify-center">
=======
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

// Calendar icon (inline since not in Icons.tsx)
const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-6 w-6'} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13z" />
    <path d="M7 10h5v5H7z" />
  </svg>
);

const AutomationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-6 w-6'} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TenantsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-6 w-6'} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

const navLinks = [
  { to: '/dashboard', icon: DashboardIcon,   label: 'Dashboard'  },
  { to: '/accounts',  icon: AccountsIcon,    label: 'Accounts'   },
  { to: '/contacts',  icon: ContactsIcon,    label: 'Contacts'   },
  { to: '/tickets',   icon: InboxIcon,       label: 'Inbox'      },
  { to: '/campaign',  icon: CampaignIcon,    label: 'Campaign'   },
  { to: '/channels',  icon: ChannelIcon,     label: 'Channel'    },
  { to: '/report',    icon: ReportIcon,      label: 'Report'     },
  { to: '/calendar',  icon: CalendarIcon,    label: 'Calendar'   },
  { to: '/settings',  icon: SettingIcon,     label: 'Setting'    },
  { to: '/automation',icon: AutomationIcon,  label: 'Automation' },
  { to: '/tenants',   icon: TenantsIcon,     label: 'Tenants'    },
];

const Sidebar: React.FC = () => {
  return (
    <div className="relative z-20 w-[72px] bg-white dark:bg-slate-900/95 flex flex-col items-center py-3 border-r border-slate-200 dark:border-white/[0.08] flex-shrink-0 overflow-y-auto overflow-x-hidden backdrop-blur-sm">
      {/* Logo */}
      <div className="mb-4 flex-shrink-0 p-1.5">
        <UCLogo className="h-9 w-9" />
      </div>

      {/* Nav */}
      <nav className="flex-1 w-full">
        <ul className="flex flex-col items-center gap-1 px-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <li key={to} className="w-full">
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
              <NavLink
                to={to}
                title={label}
                className={({ isActive }) =>
<<<<<<< HEAD
                  `flex items-center justify-center p-3 rounded-xl transition-colors duration-200 w-14 h-14 ${
                    isActive
                      ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-6 w-6" />
=======
                  `flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl w-full transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-500 dark:hover:text-emerald-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                    <span className={`text-[9px] font-bold tracking-wide leading-none text-center truncate w-full px-0.5 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'
                    }`}>
                      {label}
                    </span>
                  </>
                )}
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
