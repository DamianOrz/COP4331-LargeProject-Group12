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

// These screens remain UI-only until matching backend routes are added.
export async function verifyEmail(_token: string): Promise<{ message: string }> {
  return { message: 'Your email has been successfully verified.' };
}

export async function resendVerificationEmail(_email: string): Promise<{ message: string }> {
  return { message: 'Verification email sent.' };
}

export async function requestPasswordReset(_email: string): Promise<{ message: string }> {
  return { message: 'Password reset link sent.' };
}

export async function resetPassword(_token: string, _password: string): Promise<{ message: string }> {
  return { message: 'Your password has been reset.' };
}
