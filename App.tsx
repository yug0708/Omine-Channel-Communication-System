
import React from 'react';
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
import ContactDetails from './pages/ContactDetails';
import Tickets from './pages/Tickets';
import Channels from './pages/Channels';
import Settings from './pages/Settings';
import UserProfile from './pages/UserProfile';

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

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <ToastProvider>
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </ToastProvider>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;