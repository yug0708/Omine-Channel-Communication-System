
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './hooks/useData';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Contacts from './pages/Contacts';
import Tickets from './pages/Tickets';
import Channels from './pages/Channels';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';
import ContactDetails from './pages/ContactDetails';
import AccountDetails from './pages/AccountDetails'; // Account details view page

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:id" element={<AccountDetails />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/contacts/:id" element={<ContactDetails />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const GlobalTooltip: React.FC = () => {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({ text: '', x: 0, y: 0, visible: false });

  useEffect(() => {
    let activeElement: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el || typeof el.closest !== 'function') return;

      const target = el.closest('[title]') as HTMLElement;
      if (!target) return;

      const text = target.getAttribute('title');
      if (!text || !text.trim()) return;

      // Save title and remove it temporarily to prevent default browser tooltip
      target.setAttribute('data-tooltip-title', text);
      target.removeAttribute('title');

      activeElement = target;
      updatePosition(target, text);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el || typeof el.closest !== 'function') return;

      const target = el.closest('[data-tooltip-title]') as HTMLElement;
      if (!target) return;

      // Check if mouse moved to a child of the current active element
      const related = e.relatedTarget as HTMLElement;
      if (related && target.contains(related)) {
        return; // Still inside the target, do not hide
      }

      const text = target.getAttribute('data-tooltip-title');
      if (text) {
        target.setAttribute('title', text);
        target.removeAttribute('data-tooltip-title');
      }

      activeElement = null;
      hideTooltip();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (activeElement) {
        if (!document.body.contains(activeElement) || activeElement.offsetParent === null) {
          const text = activeElement.getAttribute('data-tooltip-title');
          if (text) {
            activeElement.setAttribute('title', text);
            activeElement.removeAttribute('data-tooltip-title');
          }
          activeElement = null;
          hideTooltip();
        }
      }
    };

    const updatePosition = (el: HTMLElement, text: string) => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      setTooltip({ text, x, y, visible: true });
    };

    const hideTooltip = () => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    };

    const forceCleanup = () => {
      if (activeElement) {
        const text = activeElement.getAttribute('data-tooltip-title');
        if (text) {
          activeElement.setAttribute('title', text);
          activeElement.removeAttribute('data-tooltip-title');
        }
        activeElement = null;
      }
      hideTooltip();
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', forceCleanup, true);
    document.addEventListener('scroll', forceCleanup, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', forceCleanup, true);
      document.removeEventListener('scroll', forceCleanup, true);
    };
  }, []);

  if (!tooltip.visible) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: `${tooltip.x}px`,
        top: `${tooltip.y - 8}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-white shadow-lg select-none relative animate-fade-in-up"
    >
      {tooltip.text}
      {/* Downward pointing arrow */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B]" />
    </div>,
    document.body
  );
};

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <ToastProvider>
            <HashRouter>
              <AppRoutes />
              <GlobalTooltip />
            </HashRouter>
          </ToastProvider>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;