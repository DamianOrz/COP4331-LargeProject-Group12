﻿import type { AuthUser } from './api/authApi';
import { retrieveToken } from './tokenStorage';

export interface SessionState {
  isAuthenticated: boolean;
  isExpired: boolean;
  user: AuthUser | null;
}

const tokenStorageKey = 'token_data';

function decodeJwtPayload(token: string): AuthUser | null {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    // This is a simplified base64-url decoder. A library like `jwt-decode` would be more robust.
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(normalizedPayload));
    return decoded as AuthUser;
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

  if (!token) {
    return { isAuthenticated: false, isExpired: false, user: null };
  }

  if (isJwtExpired(token)) {
    clearSession();
    return { isAuthenticated: false, isExpired: true, user: null };
  }

  const user = decodeJwtPayload(token);
  if (!user) {
    clearSession();
    return { isAuthenticated: false, isExpired: false, user: null };
  }

  return { isAuthenticated: true, isExpired: false, user };
}

export function clearSession(): void {
  localStorage.removeItem(tokenStorageKey);
}
