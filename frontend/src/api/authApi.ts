// Mock service now. Replace these internals with Express fetch calls later while keeping the exported function names and response shapes.
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
  isEmailVerified: boolean;
  createdAt: string;
}

const delay = () => new Promise((resolve) => window.setTimeout(resolve, 350));

export async function login(payload: LoginPayload): Promise<{ user: AuthUser; token: string }> {
  await delay();
  return {
    token: 'mock-jwt-token',
    user: {
      _id: 'user-1',
      firstName: 'Demo',
      lastName: 'User',
      email: payload.email,
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    }
  };
}

export async function register(payload: RegisterPayload): Promise<{ message: string }> {
  await delay();
  void payload;
  return { message: 'Account created. Please check your email to verify your account.' };
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  await delay();
  void token;
  return { message: 'Your email has been successfully verified.' };
}

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  await delay();
  void email;
  return { message: 'Verification email sent.' };
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  await delay();
  void email;
  return { message: 'Password reset link sent.' };
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  await delay();
  void token;
  void password;
  return { message: 'Your password has been reset.' };
}
