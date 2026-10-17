
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './hooks/useData';
import { ChannelProvider } from './context/ChannelContext';
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
import TicketDetails from './pages/TicketDetails';
import Inbox from './pages/Inbox';
import Channels from './pages/Channels';
import Settings from './pages/Settings';
import Campaign from './pages/Campaign';
import Reports from './pages/Reports';
import CalendarPage from './pages/Calendar';
import Automation from './pages/Automation';
import Tenants from './pages/Tenants';
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
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/campaign" element={<Campaign />} />
        <Route path="/report" element={<Reports />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ChannelProvider>
            <ToastProvider>
              <HashRouter>
                <AppRoutes />
              </HashRouter>
            </ToastProvider>
          </ChannelProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;