import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AdminSession } from '../types';
import { adminService } from '../services/adminService';

interface AdminContextType {
  currentAdmin: AdminSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentAdmin(adminService.getSession());
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const result = adminService.login(email, password);
    if (result.success) {
      setCurrentAdmin(adminService.getSession());
    }
    return result;
  };

  const logout = () => {
    adminService.clearSession();
    setCurrentAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ currentAdmin, isLoading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
