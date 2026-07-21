import { jwtDecode } from 'jwt-decode';
import { postApi } from './apiClient';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified?: boolean;
  createdAt?: string;
}

interface JwtPayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

function decodeUser(token: string): AuthUser {
  const decoded = jwtDecode<JwtPayload>(token);

  return {
    _id: String(decoded.userId),
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    email: decoded.email
  };
}

export async function login(payload: LoginPayload): Promise<{ user: AuthUser; token: string }> {
  const response = await postApi<{ accessToken: string }>('login', {
    login: payload.email,
    password: payload.password
  }, false);

  return { token: response.accessToken, user: decodeUser(response.accessToken) };
}

export async function register(payload: RegisterPayload): Promise<{ message: string }> {
  return postApi<{ message: string }>('register', payload, false);
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  return postApi<{ message: string }>('verify-email', { token }, false);
}

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  return postApi<{ message: string }>('resend-verification', { email }, false);
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return postApi<{ message: string }>('forgot-password', { email }, false);
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return postApi<{ message: string }>('reset-password', { token, password }, false);
}
