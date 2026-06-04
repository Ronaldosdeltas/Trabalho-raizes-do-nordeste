import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthSession } from '../types';
import { authService } from '../services/authService';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  lgpdConsent: boolean;
}

interface UpdateProfileData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface ResetRequestResult {
  success: boolean;
  code?: string;
  error?: string;
}

interface AuthContextType {
  currentUser: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => AuthResult;
  register: (data: RegisterData) => AuthResult;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => AuthResult;
  requestPasswordReset: (email: string) => ResetRequestResult;
  resetPassword: (email: string, code: string, newPassword: string) => AuthResult;
  deleteAccount: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(authService.getSession());
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): AuthResult => {
    const user = authService.getUserByEmail(email);
    if (!user || user.password !== password) {
      return { success: false, error: 'E-mail ou senha inválidos.' };
    }
    const session: AuthSession = { userId: user.id, email: user.email, name: user.name };
    authService.saveSession(session);
    setCurrentUser(session);
    return { success: true };
  };

  const register = (data: RegisterData): AuthResult => {
    if (authService.getUserByEmail(data.email)) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }
    const newUser = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      createdAt: new Date().toISOString(),
      lgpdConsent: data.lgpdConsent,
    };
    authService.createUser(newUser);
    const session: AuthSession = { userId: newUser.id, email: newUser.email, name: newUser.name };
    authService.saveSession(session);
    setCurrentUser(session);
    return { success: true };
  };

  const logout = () => {
    authService.clearSession();
    setCurrentUser(null);
  };

  const updateProfile = (data: UpdateProfileData): AuthResult => {
    if (!currentUser) return { success: false, error: 'Não autenticado.' };
    const user = authService.getUserById(currentUser.userId);
    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    if (user.password !== data.currentPassword) {
      return { success: false, error: 'Senha atual incorreta.' };
    }
    if (data.email !== user.email && authService.getUserByEmail(data.email)) {
      return { success: false, error: 'Este e-mail já está em uso.' };
    }
    const updated = {
      ...user,
      name: data.name,
      email: data.email,
      password: data.newPassword ?? user.password,
    };
    authService.updateUser(updated);
    const newSession: AuthSession = { userId: updated.id, email: updated.email, name: updated.name };
    authService.saveSession(newSession);
    setCurrentUser(newSession);
    return { success: true };
  };

  const requestPasswordReset = (email: string): ResetRequestResult => {
    const user = authService.getUserByEmail(email);
    if (!user) return { success: false, error: 'Nenhuma conta encontrada com este e-mail.' };
    const code = authService.generateResetCode(email);
    return { success: true, code };
  };

  const resetPassword = (email: string, code: string, newPassword: string): AuthResult => {
    if (!authService.validateResetCode(email, code)) {
      return { success: false, error: 'Código inválido ou expirado.' };
    }
    const user = authService.getUserByEmail(email);
    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    authService.updateUser({ ...user, password: newPassword });
    authService.consumeResetCode(email);
    return { success: true };
  };

  const deleteAccount = () => {
    if (!currentUser) return;
    authService.deleteUser(currentUser.userId);
    authService.clearSession();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, isLoading, login, register, logout, updateProfile, requestPasswordReset, resetPassword, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
