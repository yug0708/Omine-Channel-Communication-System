import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

import ThemeToggleSwitch from '../ui/ThemeToggleSwitch';
import Button from '../ui/Button';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import NotificationsDropdown from './NotificationsDropdown';
import LanguageDropdown from './LanguageDropdown';

import {
  UKFlagIcon,
  BellIcon,
  RefreshIcon,
} from '../icons/Icons';

// ── Route → Breadcrumb map ────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/accounts':   'Accounts',
  '/contacts':   'Contacts',
  '/tickets':    'Inbox',
  '/campaign':   'Campaign',
  '/channels':   'Channels',
  '/report':     'Reports',
  '/calendar':   'Calendar',
  '/automation': 'Automation',
  '/tenants':    'Tenants',
  '/settings':   'Settings',
  '/profile':    'My Profile',
};

// ── Hamburger icon ────────────────────────────────────────────────────────────
const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'h-5 w-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// ── Collapse toggle icon ──────────────────────────────────────────────────────
const SidebarToggleIcon: React.FC<{ isExpanded: boolean; className?: string }> = ({ isExpanded, className }) => (
  <svg className={`${className ?? 'h-4 w-4'} transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
  </svg>
);


// ── Props ─────────────────────────────────────────────────────────────────────

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarExpanded?: boolean;
  onToggleSidebar?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const Header: React.FC<HeaderProps> = ({ onMenuClick, isSidebarExpanded = true, onToggleSidebar }) => {
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);


  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef    = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const { logout, currentUser } = useAuth();
  const { notifications, setNotifications } = useData();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Build breadcrumb
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentLabel = ROUTE_LABELS[`/${pathSegments[0]}`] || (pathSegments[0]
    ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1)
    : 'Dashboard'
  );
  const isDetail = pathSegments.length > 1;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node))
        setIsProfileDropdownOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node))
        setNotificationsOpen(false);
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node))
        setIsLanguageDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = currentUser?.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'U';
  const userName    = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User';
  const userEmail   = currentUser?.email || 'user@example.com';
  const profilePicture = currentUser?.profilePicture;

  return (
    <>
      <header className="relative z-20 flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.07] h-14 px-3 sm:px-4 gap-2 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">

        {/* ── Left: Hamburger (mobile) + Sidebar toggle (desktop) + Breadcrumb ── */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0"
            title="Open Menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all flex-shrink-0"
            title={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <SidebarToggleIcon isExpanded={isSidebarExpanded} className="h-4 w-4" />
          </button>

          {/* Divider */}
          <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-white/[0.08] flex-shrink-0" />

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 min-w-0 text-sm">
            {location.pathname === '/dashboard' || location.pathname === '/' ? (
              <span className="text-slate-800 dark:text-white text-xs font-semibold truncate">Dashboard</span>
            ) : (
              <>
                <Link to="/dashboard" className="text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors flex-shrink-0 text-xs font-medium">
                  Dashboard
                </Link>
                <svg className="h-3 w-3 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                {isDetail ? (
                  <>
                    <Link
                      to={`/${pathSegments[0]}`}
                      className="text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors flex-shrink-0 text-xs font-medium truncate max-w-[80px]"
                    >
                      {currentLabel}
                    </Link>
                    <svg className="h-3 w-3 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-slate-800 dark:text-slate-200 text-xs font-semibold truncate">Detail</span>
                  </>
                ) : (
                  <span className="text-slate-800 dark:text-white text-xs font-semibold truncate">{currentLabel}</span>
                )}
              </>
            )}
          </nav>
        </div>


        {/* ── Right: Actions ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <ThemeToggleSwitch />

          {/* Language */}
          <div className="relative" ref={languageDropdownRef}>
            <button
              onClick={() => setIsLanguageDropdownOpen(prev => !prev)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Language"
            >
              <UKFlagIcon className="h-5 w-5 rounded-sm" />
            </button>
            <LanguageDropdown isOpen={isLanguageDropdownOpen} />
          </div>

          {/* Notifications */}
          <div className="relative flex-shrink-0" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(prev => !prev)}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
              title="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationsDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>

          {/* Vertical divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-white/[0.08] mx-0.5" />

          {/* Profile */}
          <div className="relative flex-shrink-0" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-bold text-sm overflow-hidden shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-semibold text-slate-800 dark:text-white leading-tight">{currentUser?.firstName || 'User'}</span>
                <span className="text-[10px] text-slate-400 leading-tight">Admin</span>
              </div>
              <svg className="hidden sm:block h-3.5 w-3.5 text-slate-400 transition-transform duration-200" style={{ transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="animate-fade-in-up absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl z-30 overflow-hidden">
                {/* User info */}
                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-b border-slate-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white font-bold text-xl flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/20">
                      {profilePicture ? <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" /> : userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">Online</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-white/[0.04] rounded-lg px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Webphone: Disconnected
                    </span>
                    <button className="hover:text-slate-800 dark:hover:text-white transition-colors">
                      <RefreshIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-2 px-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    User Profile
                  </Link>
                  <button
                    onClick={() => { setChangePasswordModalOpen(true); setIsProfileDropdownOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                  </button>
                </div>

                <div className="px-3 pb-2">
                  <Button variant="primary" className="w-full !rounded-xl !text-sm !py-2">
                    Buy now
                  </Button>
                </div>

                <div className="px-2 pb-2 border-t border-slate-100 dark:border-white/[0.06] pt-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </>
  );
};

export default Header;
