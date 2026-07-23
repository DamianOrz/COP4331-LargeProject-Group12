import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changePassword, login, requestPasswordReset, resendVerificationEmail, resetPassword, verifyEmail } from '../api/authApi';
import { getWeeklyMealPlan } from '../api/mealPlanApi';
import { listRecipes } from '../api/recipeApi';

function makeToken(): string {
  const encode = (value: object) => window.btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    userId: 'user-1',
    firstName: 'Front',
    lastName: 'Tester',
    email: 'front@example.com',
    exp: Math.floor(Date.now() / 1000) + 300
  })}.signature`;
}

function response(body: object, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body)
  } as unknown as Response;
}

describe('frontend API services', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('logs in with the Express payload and decodes the returned JWT user', async () => {
    const token = makeToken();
    fetchMock.mockResolvedValue(response({ accessToken: token }));

    const result = await login({ email: 'front@example.com', password: 'Password123' });

    expect(result.user).toMatchObject({ _id: 'user-1', email: 'front@example.com' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5000/api/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ login: 'front@example.com', password: 'Password123' })
      })
    );
  });

  it('uses the real email verification and password reset endpoints', async () => {
    fetchMock.mockResolvedValue(response({ message: 'Success' }));

    await verifyEmail('verification-token');
    await resendVerificationEmail('front@example.com');
    await requestPasswordReset('front@example.com');
    await resetPassword('reset-token', 'Password123');

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'http://localhost:5000/api/verify-email',
      'http://localhost:5000/api/resend-verification',
      'http://localhost:5000/api/forgot-password',
      'http://localhost:5000/api/reset-password'
    ]);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({ token: 'verification-token' });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toEqual({ email: 'front@example.com' });
    expect(JSON.parse(fetchMock.mock.calls[2][1].body as string)).toEqual({ email: 'front@example.com' });
    expect(JSON.parse(fetchMock.mock.calls[3][1].body as string)).toEqual({ token: 'reset-token', password: 'Password123' });
  });

  it('sends the current password, new password, and JWT when changing a password', async () => {
    const token = makeToken();
    localStorage.setItem('token_data', token);
    fetchMock.mockResolvedValue(response({ message: 'Your password has been changed.', jwtToken: token }));

    await changePassword('Password123', 'Password456');

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:5000/api/change-password');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({
      currentPassword: 'Password123',
      newPassword: 'Password456',
      jwtToken: token
    });
  });

  it('sends JWT, user, search, and meal-type fields when listing recipes', async () => {
    const token = makeToken();
    localStorage.setItem('token_data', token);
    fetchMock.mockResolvedValue(response({ recipes: [], error: '', jwtToken: token }));

    await listRecipes({ search: 'rice', mealType: 'dinner' });

    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:5000/api/recipes/list');
    expect(request).toMatchObject({ jwtToken: token, userId: 'user-1', search: 'rice', mealType: 'dinner' });
  });

  it('loads a weekly meal plan using the authenticated user', async () => {
    const token = makeToken();
    localStorage.setItem('token_data', token);
    fetchMock.mockResolvedValue(response({
      mealPlan: {
        _id: 'plan-1',
        userId: 'user-1',
        weekStartDate: '2026-07-13',
        plannedMeals: [],
        createdAt: '2026-07-14T00:00:00.000Z'
      },
      error: '',
      jwtToken: token
    }));

    const plan = await getWeeklyMealPlan('2026-07-13');

    expect(plan._id).toBe('plan-1');
    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:5000/api/mealplans/get');
    expect(request).toMatchObject({ jwtToken: token, userId: 'user-1', weekStartDate: '2026-07-13' });
  });

  it('surfaces API errors to protected pages', async () => {
    localStorage.setItem('token_data', makeToken());
    fetchMock.mockResolvedValue(response({ recipes: [], error: 'Database unavailable', jwtToken: '' }, 500));

    await expect(listRecipes()).rejects.toThrow('Database unavailable');
  });
});
