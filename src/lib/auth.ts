export type UserRole = 'user' | 'admin';

export interface AuthUser {
  username: string;
  role: UserRole;
}

const MOCK_USERS: Record<string, { password: string; role: UserRole }> = {
  admin: { password: 'admin', role: 'admin' },
  user: { password: 'user', role: 'user' },
};

const AUTH_KEY = 'siem_auth_user';

export function login(username: string, password: string): AuthUser | null {
  const entry = MOCK_USERS[username];
  if (entry && entry.password === password) {
    const user: AuthUser = { username, role: entry.role };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export function hasRole(role: UserRole): boolean {
  const user = getAuthUser();
  return user?.role === role;
}
