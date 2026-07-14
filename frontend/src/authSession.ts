import { jwtDecode } from 'jwt-decode';
import type { AuthUser } from './api/authApi';
import { retrieveToken } from './tokenStorage';

export interface SessionState {
  isAuthenticated: boolean;
  isExpired: boolean;
  user: AuthUser | null;
}

interface JwtPayload {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  exp?: number;
}

const tokenStorageKey = 'token_data';
const legacyUserStorageKey = 'user_data';

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function getSessionState(): SessionState {
  const token = retrieveToken();
  if (!token) return { isAuthenticated: false, isExpired: false, user: null };

  const payload = decodeJwtPayload(token);
  if (!payload?.userId || !payload.email) {
    clearSession();
    return { isAuthenticated: false, isExpired: false, user: null };
  }

  if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) {
    clearSession();
    return { isAuthenticated: false, isExpired: true, user: null };
  }

  return {
    isAuthenticated: true,
    isExpired: false,
    user: {
      _id: String(payload.userId),
      firstName: payload.firstName ?? '',
      lastName: payload.lastName ?? '',
      email: payload.email
    }
  };
}

export function clearSession(): void {
  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem(legacyUserStorageKey);
}
