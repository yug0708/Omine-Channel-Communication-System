import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import {
  DashboardIcon,
  AccountsIcon,
  ContactsIcon,
  InboxIcon,
  CampaignIcon,
  ChannelIcon,
  TicketsIcon,
  ReportIcon,
  CalendarIcon,
  AutomationIcon,
  TenantsIcon,
  SettingIcon,
  UCLogo,
} from '../icons/Icons';

// ── Extra Icons ───────────────────────────────────────────────────────────────

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-4 w-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

// ── Nav groups ────────────────────────────────────────────────────────────────

const mainNavLinks = [
  { to: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { to: '/accounts', icon: AccountsIcon, label: 'Accounts' },
  { to: '/contacts', icon: ContactsIcon, label: 'Contacts' },
  { to: '/inbox', icon: InboxIcon, label: 'Inbox' },
  { to: '/campaign', icon: CampaignIcon, label: 'Campaign' },
  { to: '/channels', icon: ChannelIcon, label: 'Channel' },
  { to: '/tickets', icon: TicketsIcon, label: 'Tickets' },
];

const toolsNavLinks = [
  { to: '/report', icon: ReportIcon, label: 'Report' },
  { to: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  { to: '/automation', icon: AutomationIcon, label: 'Automation' },
];

const adminNavLinks = [
  { to: '/tenants', icon: TenantsIcon, label: 'Tenants' },
  { to: '/settings', icon: SettingIcon, label: 'Settings' },
];

// ── NavItem ───────────────────────────────────────────────────────────────────

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isExpanded: boolean;
  onClose?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isExpanded, onClose }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <li className={`relative group/item ${isExpanded ? 'w-full' : 'w-full flex justify-center'}`}>
      <NavLink
        to={to}
        onClick={onClose}
        className={`
          transition-all duration-200 group
          ${isExpanded
            ? 'flex items-center rounded-lg w-full px-3 py-2.5 gap-3'
            : 'flex flex-col items-center justify-center py-2.5 px-1 rounded-lg w-full gap-1'
          }
          ${isActive
            ? 'bg-white/[0.08] text-white'
            : 'text-[#A8A29E] hover:bg-white/[0.05] hover:text-white'
          }
        `}
      >
        <Icon
          className={`
            h-6 w-6 flex-shrink-0 transition-transform duration-200
            ${isActive
              ? 'text-white'
              : 'text-[#A8A29E] group-hover/item:text-white'
            }
          `}
        />

        {/* Label */}
        <span
          className={`
            font-semibold tracking-normal transition-all duration-200
            ${isExpanded
              ? 'text-sm text-left truncate max-w-[160px]'
              : 'text-[10px] leading-tight text-center truncate w-full px-0.5'
            }
            ${isActive
              ? 'text-white'
              : 'text-[#A8A29E] group-hover/item:text-white'
            }
          `}
        >
          {label}
        </span>
      </NavLink>

      {/* Tooltip when collapsed */}
      {!isExpanded && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="whitespace-nowrap rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold px-2.5 py-1.5 shadow-xl">
              {label}
            </span>
          </div>
        </div>
      )}
    </li>
  );
};

// ── Divider label ─────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ label: string; isExpanded: boolean }> = ({ label, isExpanded }) => (
  <div className={`flex items-center gap-2 px-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 mt-3 mb-1' : 'opacity-0 h-0 mt-0 mb-0'}`}>
    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#A8A29E] whitespace-nowrap">
      {label}
    </span>
    <div className="flex-1 h-px bg-white/[0.08]" />
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose, isExpanded = true, onToggleExpand }) => {
  const { currentUser } = useAuth();

  const userInitial = currentUser?.firstName
    ? currentUser.firstName.charAt(0).toUpperCase()
    : 'U';
  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User';
  const orgName = currentUser?.organizationName || 'My Organization';

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0 h-screen
          bg-[#1C1917] text-white
          border-r border-white/[0.06]
          transition-all duration-300 ease-in-out overflow-hidden relative
          ${isExpanded ? 'w-60' : 'w-16'}
        `}
      >
        {/* Top: Logo + Toggle */}
        <div className={`flex items-center flex-shrink-0 px-3 ${isExpanded ? 'pt-5 pb-4 justify-between' : 'pt-4 pb-3 justify-center'}`}>
          <div className={`flex items-center overflow-hidden ${isExpanded ? 'gap-2.5' : 'gap-0'}`}>
            <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 pulse-glow">
              <UCLogo className="h-5 w-5 text-white" />
            </div>
            <span className={`font-bold text-sm text-white whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0'}`}>
              CommuniDesk
            </span>
          </div>
        </div>



        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar ${isExpanded ? 'px-2' : 'px-1.5'}`}>
          {/* Main */}
          <SectionLabel label="Main" isExpanded={isExpanded} />
          <ul className={`flex flex-col ${isExpanded ? 'gap-0.5' : 'gap-1.5 items-center py-1'}`}>
            {mainNavLinks.map(link => (
              <NavItem key={link.to} {...link} isExpanded={isExpanded} />
            ))}
          </ul>

          {/* Tools */}
          {isExpanded && <div className="mt-2 mb-1 h-px bg-white/[0.06]" />}
          <SectionLabel label="Tools" isExpanded={isExpanded} />
          <ul className={`flex flex-col ${isExpanded ? 'gap-0.5' : 'gap-1.5 items-center py-1'}`}>
            {toolsNavLinks.map(link => (
              <NavItem key={link.to} {...link} isExpanded={isExpanded} />
            ))}
          </ul>

          {/* Admin */}
          {isExpanded && <div className="mt-2 mb-1 h-px bg-white/[0.06]" />}
          <SectionLabel label="Admin" isExpanded={isExpanded} />
          <ul className={`flex flex-col ${isExpanded ? 'gap-0.5' : 'gap-1.5 items-center py-1'}`}>
            {adminNavLinks.map(link => (
              <NavItem key={link.to} {...link} isExpanded={isExpanded} />
            ))}
          </ul>
        </nav>

        {/* Bottom: User info */}
        <div className="flex-shrink-0 border-t border-white/[0.06] p-3 transition-all duration-300">
          <div className={`flex items-center overflow-hidden rounded-lg transition-all duration-300 cursor-pointer group ${isExpanded ? 'gap-2.5 p-2 hover:bg-white/[0.05]' : 'gap-0 p-0 justify-center h-10 w-10 hover:bg-white/[0.05] mx-auto'}`}>
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {userInitial}
            </div>
            <div className={`flex flex-col min-w-0 transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-[160px]' : 'opacity-0 max-w-0'}`}>
              <span className="text-xs font-semibold text-white truncate leading-tight">{userName}</span>
              <span className="text-[10px] text-[#A8A29E] truncate leading-tight">{orgName}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Drawer ────────────────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#1C1917] flex flex-col border-r border-white/[0.06] overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#00A76F] flex items-center justify-center">
              <UCLogo className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-sm text-white">CommuniDesk</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#A8A29E] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        <nav className="flex-1 overflow-y-auto hide-scrollbar px-3 pt-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#A8A29E] mb-2 px-1">Main</p>
          <ul className="flex flex-col gap-0.5 mb-4">
            {mainNavLinks.map(link => (
              <NavItem key={link.to} {...link} isExpanded={true} onClose={onClose} />
            ))}
          </ul>
          <div className="h-px bg-white/[0.06] mb-3" />
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#A8A29E] mb-2 px-1">Tools</p>
          <ul className="flex flex-col gap-0.5 mb-4">
            {toolsNavLinks.map(link => (
              <NavItem key={link.to} {...link} isExpanded={true} onClose={onClose} />
            ))}
          </ul>
          <div className="h-px bg-white/[0.06] mb-3" />
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#A8A29E] mb-2 px-1">Admin</p>
          <ul className="flex flex-col gap-0.5">
            {adminNavLinks.map(link => (
              <NavItem key={link.to} {...link} isExpanded={true} onClose={onClose} />
            ))}
          </ul>
        </nav>

        {/* Mobile user */}
        <div className="flex-shrink-0 border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-2.5 rounded-lg p-2 bg-white/[0.04]">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">{userName}</span>
              <span className="text-[10px] text-[#A8A29E] truncate">{orgName}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
