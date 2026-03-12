import { api, getToken, setToken, clearToken } from './api';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  username: string;
  role: UserRole;
}

// Keys used for local persistence (username only — role is always derived from JWT)
const USER_KEY = 'siem_auth_user';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Decodes the JWT payload without verifying the signature.
 * Role claims derived here are used only for UI hints; real enforcement
 * happens server-side on every authenticated API request.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // atob requires standard base64; JWT uses base64url
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function persistUsername(username: string): void {
  localStorage.setItem(USER_KEY, username);
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
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/api/login`,
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

  // Derive username from response or JWT payload — never from localStorage
  const payload = decodeJwtPayload(data.access_token);
  const resolvedUsername =
    data.username ?? (payload?.sub as string | undefined) ?? username;

  // Persist only the username; role will always be read fresh from the JWT
  persistUsername(resolvedUsername);

  return getAuthUser() ?? { username: resolvedUsername, role: 'user' };
}

export function logout(): void {
  clearToken();
  clearUser();
}

/**
 * Returns the authenticated user by reading the JWT fresh from storage on
 * every call. The `role` field is decoded directly from the token payload —
 * it is never read from localStorage, preventing client-side privilege
 * escalation via DevTools.
 */
export function getAuthUser(): AuthUser | null {
  try {
    const storedUsername = localStorage.getItem(USER_KEY);
    if (!storedUsername) return null;

    const token = getToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);

    // Role comes exclusively from the signed JWT payload, not from localStorage
    const role: UserRole =
      (payload?.role as UserRole | undefined) === 'admin' ? 'admin' : 'user';

    const username =
      (payload?.sub as string | undefined) ?? storedUsername;

    return { username, role };
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
