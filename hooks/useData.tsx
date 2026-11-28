import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useLocalStorage } from './useLocalStorage';
import { Account, Contact, Ticket, Notification } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CONTACTS, INITIAL_TICKETS, INITIAL_NOTIFICATIONS } from '../constants';

const API_URL = import.meta.env.VITE_API_URL || '';

interface DataContextType {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  // Asynchronous Database CRUD Operations
  saveContact: (contactData: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  deleteContactsBatch: (ids: string[]) => Promise<void>;
  saveAccount: (accountData: Partial<Account>) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  deleteAccountsBatch: (ids: string[]) => Promise<void>;
  saveTicket: (ticketData: Partial<Ticket>) => Promise<Ticket>;
  deleteTicket: (id: string) => Promise<void>;
  deleteTicketsBatch: (ids: string[]) => Promise<void>;
  fetchContacts: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
  fetchTickets: () => Promise<void>;
  isLoadingData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(false);

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

  // Helper to build authenticated headers
  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (currentUser?.id) {
      headers['x-tenant-id'] = currentUser.id;
    }
    return headers;
  }, [currentUser]);

  // Fetch contacts from backend
  const fetchContacts = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/api/contacts`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data: Contact[] = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.warn('Failed to fetch contacts from backend database:', err);
    }
  }, [currentUser, getAuthHeaders, setContacts]);

  // Fetch accounts from backend
  const fetchAccounts = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/api/accounts`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data: Account[] = await res.json();
        setAccounts(data);
      }
    } catch (err) {
      console.warn('Failed to fetch accounts from backend database:', err);
    }
  }, [currentUser, getAuthHeaders, setAccounts]);

  const fetchTickets = useCallback(async () => {
    if (!currentUser) return;
    const storageKey = `${tenantKey}_tickets`;
    try {
      const res = await fetch(`${API_URL}/api/tickets`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data: Ticket[] = await res.json();
      if (data.length > 0) {
        setTickets(data);
        return;
      }
      let local: Ticket[] = [];
      try {
        const raw = localStorage.getItem(storageKey);
        local = raw ? JSON.parse(raw) : [];
      } catch {
        local = [];
      }
      if (!Array.isArray(local) || local.length === 0) return;
      for (const ticket of local) {
        await fetch(`${API_URL}/api/tickets`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(ticket),
        });
      }
      const again = await fetch(`${API_URL}/api/tickets`, { headers: getAuthHeaders() });
      if (again.ok) setTickets(await again.json());
    } catch (err) {
      console.warn('Failed to fetch tickets from backend database:', err);
    }
  }, [currentUser, getAuthHeaders, setTickets, tenantKey]);

  // Initial fetch whenever user/tenant changes
  useEffect(() => {
    if (currentUser) {
      setIsLoadingData(true);
      Promise.all([fetchContacts(), fetchAccounts(), fetchTickets()]).finally(() => {
        setIsLoadingData(false);
      });
    }
  }, [currentUser?.id, currentUser?.email, fetchContacts, fetchAccounts, fetchTickets]);

  // Save (Create or Update) Contact via Backend API
  const saveContact = async (contactData: Partial<Contact>): Promise<Contact> => {
    const isEdit = Boolean(contactData.id);
    const url = isEdit
      ? `${API_URL}/api/contacts/${contactData.id}`
      : `${API_URL}/api/contacts`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(contactData),
      });
      if (res.ok) {
        const saved: Contact = await res.json();
        if (isEdit) {
          setContacts((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
        } else {
          setContacts((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
        }
        return saved;
      }
    } catch (err) {
      console.warn('Backend save contact failed, applying optimistic update:', err);
    }

    // Local fallback update
    const now = new Date().toISOString();
    let fallbackSaved: Contact;
    if (isEdit) {
      fallbackSaved = {
        ...(contacts.find((c) => c.id === contactData.id) || ({} as Contact)),
        ...contactData,
        updatedAt: now,
      } as Contact;
      setContacts((prev) => prev.map((c) => (c.id === contactData.id ? fallbackSaved : c)));
    } else {
      fallbackSaved = {
        ...contactData,
        id: contactData.id || `con${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      } as Contact;
      setContacts((prev) => [fallbackSaved, ...prev]);
    }
    return fallbackSaved;
  };

  // Delete Single Contact via Backend API
  const deleteContact = async (id: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/contacts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('Backend delete contact failed:', err);
    }
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Delete Batch Contacts via Backend API
  const deleteContactsBatch = async (ids: string[]): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/contacts/delete-batch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids }),
      });
    } catch (err) {
      console.warn('Backend batch delete contacts failed:', err);
    }
    setContacts((prev) => prev.filter((c) => !ids.includes(c.id)));
  };

  // Save (Create or Update) Account via Backend API
  const saveAccount = async (accountData: Partial<Account>): Promise<Account> => {
    const isEdit = Boolean(accountData.id);
    const url = isEdit
      ? `${API_URL}/api/accounts/${accountData.id}`
      : `${API_URL}/api/accounts`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(accountData),
      });
      if (res.ok) {
        const saved: Account = await res.json();
        if (isEdit) {
          setAccounts((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
        } else {
          setAccounts((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
        }
        return saved;
      }
    } catch (err) {
      console.warn('Backend save account failed, applying optimistic update:', err);
    }

    // Local fallback update
    const now = new Date().toISOString();
    let fallbackSaved: Account;
    if (isEdit) {
      fallbackSaved = {
        ...(accounts.find((a) => a.id === accountData.id) || ({} as Account)),
        ...accountData,
        updatedAt: now,
      } as Account;
      setAccounts((prev) => prev.map((a) => (a.id === accountData.id ? fallbackSaved : a)));
    } else {
      fallbackSaved = {
        ...accountData,
        id: accountData.id || `acc${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      } as Account;
      setAccounts((prev) => [fallbackSaved, ...prev]);
    }
    return fallbackSaved;
  };

  // Delete Single Account via Backend API
  const deleteAccount = async (id: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/accounts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('Backend delete account failed:', err);
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  // Delete Batch Accounts via Backend API
  const deleteAccountsBatch = async (ids: string[]): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/accounts/delete-batch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids }),
      });
    } catch (err) {
      console.warn('Backend batch delete accounts failed:', err);
    }
    setAccounts((prev) => prev.filter((a) => !ids.includes(a.id)));
  };

  const saveTicket = async (ticketData: Partial<Ticket>): Promise<Ticket> => {
    const existing = tickets.find((t) => t.id === ticketData.id);
    const isEdit = Boolean(existing);
    try {
      const res = await fetch(isEdit ? `${API_URL}/api/tickets/${ticketData.id}` : `${API_URL}/api/tickets`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(ticketData),
      });
      if (res.ok) {
        const saved: Ticket = await res.json();
        setTickets((prev) => (
          prev.some((t) => t.id === saved.id)
            ? prev.map((t) => (t.id === saved.id ? saved : t))
            : [saved, ...prev]
        ));
        return saved;
      }
    } catch (err) {
      console.warn('Backend save ticket failed, applying optimistic update:', err);
    }
    const now = new Date().toISOString();
    const fallback = {
      ...(existing || {}),
      ...ticketData,
      id: ticketData.id || `tkt${Date.now()}`,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    } as Ticket;
    setTickets((prev) => (
      prev.some((t) => t.id === fallback.id)
        ? prev.map((t) => (t.id === fallback.id ? fallback : t))
        : [fallback, ...prev]
    ));
    return fallback;
  };

  const deleteTicket = async (id: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/tickets/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    } catch (err) {
      console.warn('Backend delete ticket failed:', err);
    }
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteTicketsBatch = async (ids: string[]): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/tickets/delete-batch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids }),
      });
    } catch (err) {
      console.warn('Backend batch delete tickets failed:', err);
    }
    setTickets((prev) => prev.filter((t) => !ids.includes(t.id)));
  };

  const value = {
    accounts,
    setAccounts,
    contacts,
    setContacts,
    tickets,
    setTickets,
    notifications,
    setNotifications,
    saveContact,
    deleteContact,
    deleteContactsBatch,
    saveAccount,
    deleteAccount,
    deleteAccountsBatch,
    saveTicket,
    deleteTicket,
    deleteTicketsBatch,
    fetchContacts,
    fetchAccounts,
    fetchTickets,
    isLoadingData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};