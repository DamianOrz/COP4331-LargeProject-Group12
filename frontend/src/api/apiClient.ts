import { retrieveToken, storeToken } from '../tokenStorage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace(/\/+$/, '');

interface ApiEnvelope {
  error?: string;
  jwtToken?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function postApi<T>(path: string, payload: object, requiresAuth = true): Promise<T> {
  const token = retrieveToken();
  if (requiresAuth && !token) {
    throw new ApiError('Please log in to continue.', 401);
  }

  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, '')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requiresAuth ? { ...payload, jwtToken: token } : payload)
  });

  const data = await response.json().catch(() => ({})) as T & ApiEnvelope;

  if (data.jwtToken) {
    storeToken({ accessToken: data.jwtToken });
  }

  if (!response.ok || data.error) {
    const message = data.error || `Request failed with status ${response.status}.`;
    if (requiresAuth && (response.status === 401 || message.toLowerCase().includes('jwt'))) {
      localStorage.removeItem('token_data');
      localStorage.removeItem('user_data');
      window.location.assign('/login?session=expired');
    }
    throw new ApiError(message, response.status);
  }

  return data;
}
