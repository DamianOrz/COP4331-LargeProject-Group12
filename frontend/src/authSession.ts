import type { AuthUser } from './api/authApi';
import { retrieveToken } from './tokenStorage';

export interface SessionState {
  isAuthenticated: boolean;
  isExpired: boolean;
  user: AuthUser | null;
}

const userStorageKey = 'user_data';
const tokenStorageKey = 'token_data';

function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem(userStorageKey);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

function isJwtExpired(token: string): boolean {
  const [, payload] = token.split('.');
  if (!payload) return false;

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(normalizedPayload));
    return typeof decoded.exp === 'number' && decoded.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function getSessionState(): SessionState {
  const token = retrieveToken();
  const user = getStoredUser();

  if (!token || !user) {
    return { isAuthenticated: false, isExpired: false, user: null };
  }

  if (isJwtExpired(token)) {
    clearSession();
    return { isAuthenticated: false, isExpired: true, user: null };
  }

  return { isAuthenticated: true, isExpired: false, user };
}

export function clearSession(): void {
  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem(userStorageKey);
}
