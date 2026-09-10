
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useLocalStorage } from './useLocalStorage';
import { Account, Contact, Ticket, Notification } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CONTACTS, INITIAL_TICKETS, INITIAL_NOTIFICATIONS } from '../constants';

interface DataContextType {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Scope storage keys per tenant
  const tenantId = currentUser?.id || currentUser?.email || 'guest';
  const tenantKey = `tenant_${tenantId.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;

  // Default admin retains initial demo datasets; any newly created tenant starts with 0 records
  const isDefaultAdmin = currentUser?.email?.toLowerCase() === 'yugshah82@gmail.com' || currentUser?.id === 'default_tenant';

  const defaultAccounts = isDefaultAdmin ? INITIAL_ACCOUNTS : [];
  const defaultContacts = isDefaultAdmin ? INITIAL_CONTACTS : [];
  const defaultTickets = isDefaultAdmin ? INITIAL_TICKETS : [];
  const defaultNotifications = isDefaultAdmin ? INITIAL_NOTIFICATIONS : [];

  const [accounts, setAccounts] = useLocalStorage<Account[]>(`${tenantKey}_accounts`, defaultAccounts);
  const [contacts, setContacts] = useLocalStorage<Contact[]>(`${tenantKey}_contacts`, defaultContacts);
  const [tickets, setTickets] = useLocalStorage<Ticket[]>(`${tenantKey}_tickets`, defaultTickets);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>(`${tenantKey}_notifications`, defaultNotifications);

  const value = { accounts, setAccounts, contacts, setContacts, tickets, setTickets, notifications, setNotifications };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};