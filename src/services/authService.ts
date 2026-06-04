import type { User, AuthSession } from '../types';

const USERS_KEY = 'raizes_users';
const SESSION_KEY = 'raizes_session';
const RESET_CODES_KEY = 'raizes_reset_codes';

interface ResetCode {
  email: string;
  code: string;
  expiresAt: number;
}

export const authService = {
  getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? (JSON.parse(data) as User[]) : [];
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  createUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  },

  updateUser(updated: User): void {
    const users = this.getUsers().map(u => (u.id === updated.id ? updated : u));
    this.saveUsers(users);
  },

  deleteUser(userId: string): void {
    this.saveUsers(this.getUsers().filter(u => u.id !== userId));
  },

  getSession(): AuthSession | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? (JSON.parse(data) as AuthSession) : null;
  },

  saveSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  generateResetCode(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codes = this.getResetCodes().filter(c => c.email !== email);
    codes.push({ email, code, expiresAt: Date.now() + 15 * 60 * 1000 });
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
    return code;
  },

  validateResetCode(email: string, code: string): boolean {
    return this.getResetCodes().some(
      c => c.email.toLowerCase() === email.toLowerCase() && c.code === code && c.expiresAt > Date.now()
    );
  },

  consumeResetCode(email: string): void {
    const codes = this.getResetCodes().filter(c => c.email !== email);
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
  },

  getResetCodes(): ResetCode[] {
    const data = localStorage.getItem(RESET_CODES_KEY);
    return data ? (JSON.parse(data) as ResetCode[]) : [];
  },
};
