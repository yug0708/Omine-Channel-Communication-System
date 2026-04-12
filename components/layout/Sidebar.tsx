
import React from 'react';
import { NavLink } from 'react-router-dom';
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
              <NavLink
                to={to}
                title={label}
                className={({ isActive }) =>
                  `flex items-center justify-center p-3 rounded-xl transition-colors duration-200 w-14 h-14 ${
                    isActive
                      ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-6 w-6" />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
