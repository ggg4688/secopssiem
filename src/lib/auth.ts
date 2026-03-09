import { api, getToken, setToken, clearToken } from './api';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  username: string;
  role: UserRole;
}

// Keys used for local persistence
const USER_KEY = 'siem_auth_user';

// ── Helpers ──────────────────────────────────────────────────────────────────

function persistUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Calls POST /auth/login with form-encoded body (OAuth2PasswordRequestForm).
 * FastAPI's default login endpoint expects `username` + `password` as
 * application/x-www-form-urlencoded, not JSON.
 * Returns the authenticated user or throws on failure.
 */
export async function login(
  username: string,
  password: string,
): Promise<AuthUser> {
  const body = new URLSearchParams({ username, password });

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    },
  );

  if (!res.ok) {
    let message = 'Invalid username or password';
    try {
      const data = await res.json();
      message = data?.detail ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = await res.json() as {
    access_token: string;
    token_type: string;
    username?: string;
    role?: string;
  };

  setToken(data.access_token);

  // Decode the JWT payload to extract claims if username/role not returned directly
  let username_val = data.username;
  let role_val = data.role as UserRole | undefined;

  if (!username_val || !role_val) {
    try {
      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      username_val = username_val ?? (payload.sub as string);
      role_val = role_val ?? (payload.role as UserRole) ?? 'user';
    } catch {
      username_val = username_val ?? username;
      role_val = role_val ?? 'user';
    }
  }

  const user: AuthUser = {
    username: username_val ?? username,
    role: role_val ?? 'user',
  };

  persistUser(user);
  return user;
}

export function logout(): void {
  clearToken();
  clearUser();
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    // Also ensure we still have a token
    if (!getToken()) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export function hasRole(role: UserRole): boolean {
  return getAuthUser()?.role === role;
}

// Re-export api for convenience in other modules
export { api };
