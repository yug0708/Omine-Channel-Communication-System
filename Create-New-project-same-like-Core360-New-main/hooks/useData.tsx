
import React, { createContext, useContext, ReactNode } from 'react';
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
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', INITIAL_ACCOUNTS);
  const [contacts, setContacts] = useLocalStorage<Contact[]>('contacts', INITIAL_CONTACTS);
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', INITIAL_TICKETS);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS);

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