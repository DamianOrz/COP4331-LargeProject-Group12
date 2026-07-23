import { describe, expect, test } from 'bun:test';
import { createOneTimeToken, hashOneTimeToken, hashPassword, isStrongPassword, verifyPassword } from './authSecurity';

describe('auth security helpers', () => {
    test('hashes passwords and verifies only the correct password', async () => {
        const passwordHash = await hashPassword('Password123');

        expect(passwordHash).not.toBe('Password123');
        expect(await verifyPassword('Password123', passwordHash)).toBe(true);
        expect(await verifyPassword('WrongPassword123', passwordHash)).toBe(false);
    });

    test('creates one-time tokens and stores only deterministic hashes', () => {
        const token = createOneTimeToken();

        expect(token).toHaveLength(64);
        expect(hashOneTimeToken(token)).not.toBe(token);
        expect(hashOneTimeToken(token)).toBe(hashOneTimeToken(token));
    });

    test('enforces the shared password requirements', () => {
        expect(isStrongPassword('Password123')).toBe(true);
        expect(isStrongPassword('short1')).toBe(false);
        expect(isStrongPassword('NoNumbersHere')).toBe(false);
    });
});
