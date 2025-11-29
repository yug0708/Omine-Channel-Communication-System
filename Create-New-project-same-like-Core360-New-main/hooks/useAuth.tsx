import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  profilePicture?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<void>;
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

  const isAuthenticated = !!currentUser && localStorage.getItem('authToken') === 'dummy-token';

  const login = async (email: string, pass: string): Promise<void> => {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
    );
    
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userDataToStore } = user;
      localStorage.setItem('authToken', 'dummy-token');
      localStorage.setItem('currentUser', JSON.stringify(userDataToStore));
      setCurrentUser(userDataToStore);
      return Promise.resolve();
    }
    
    return Promise.reject(new Error('Invalid credentials'));
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

  const value = { isAuthenticated, currentUser, login, logout, updateUser, changePassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
