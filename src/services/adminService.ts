import type { AdminUser, AdminSession } from '../types';

const ADMINS_KEY = 'raizes_admins';
const ADMINS_SEEDED = 'raizes_admins_seeded';
const SESSION_KEY = 'raizes_admin_session';

const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'admin-001',
    name: 'Administrador Geral',
    email: 'admin@raizes.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'mgr-fortaleza',
    name: 'Gerente Fortaleza',
    email: 'gerente@fortaleza.com',
    password: 'gerente123',
    role: 'manager',
    unitId: 'fortaleza',
  },
  {
    id: 'mgr-recife',
    name: 'Gerente Recife',
    email: 'gerente@recife.com',
    password: 'gerente123',
    role: 'manager',
    unitId: 'recife',
  },
  {
    id: 'mgr-natal',
    name: 'Gerente Natal',
    email: 'gerente@natal.com',
    password: 'gerente123',
    role: 'manager',
    unitId: 'natal',
  },
];

export const adminService = {
  ensureSeeded(): void {
    if (localStorage.getItem(ADMINS_SEEDED)) return;
    localStorage.setItem(ADMINS_KEY, JSON.stringify(DEFAULT_ADMINS));
    localStorage.setItem(ADMINS_SEEDED, '1');
  },

  getAdmins(): AdminUser[] {
    this.ensureSeeded();
    const data = localStorage.getItem(ADMINS_KEY);
    return data ? (JSON.parse(data) as AdminUser[]) : DEFAULT_ADMINS;
  },

  login(email: string, password: string): { success: boolean; error?: string } {
    const admin = this.getAdmins().find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    );
    if (!admin) return { success: false, error: 'Credenciais inválidas.' };
    const session: AdminSession = {
      adminId: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      unitId: admin.unitId,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true };
  },

  getSession(): AdminSession | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? (JSON.parse(data) as AdminSession) : null;
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },
};
