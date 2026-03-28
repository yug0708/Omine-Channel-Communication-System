import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  profilePicture?: string;
  phone?: string;
  crNumber?: string;
  website?: string;
  industry?: string;
  companySize?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<Pick<User, 'firstName' | 'lastName' | 'profilePicture'>>) => void;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  });

  const isAuthenticated = !!currentUser && !!localStorage.getItem('authToken');

  const login = async (email: string, pass: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      setCurrentUser(data.user);
      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(new Error(error.message || 'Invalid credentials'));
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(new Error(error.message || 'Error occurred during registration'));
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const updateUser = (updatedData: Partial<Pick<User, 'firstName' | 'lastName' | 'profilePicture'>>) => {
    if (!currentUser) return;

    const newUserData = { ...currentUser, ...updatedData };
    setCurrentUser(newUserData);
    localStorage.setItem('currentUser', JSON.stringify(newUserData));

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());

    if (userIndex !== -1) {
      // Don't save password again if it's not present in updatedData
      const existingUser = registeredUsers[userIndex];
      registeredUsers[userIndex] = { ...existingUser, ...updatedData };
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }
  };

  const changePassword = async (newPassword: string): Promise<void> => {
    if (!currentUser) {
      return Promise.reject(new Error('No user is currently logged in.'));
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());

    if (userIndex === -1) {
      return Promise.reject(new Error('Could not find user data to update. Please log in again.'));
    }

    registeredUsers[userIndex].password = newPassword;
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    return Promise.resolve();
  };

  const value = { isAuthenticated, currentUser, login, register, logout, updateUser, changePassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
