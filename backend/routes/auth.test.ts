import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createAuthRouter } from './auth';
import { verifyPassword } from '../services/authSecurity';

interface FakeUserData {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    verificationTokenHash?: string;
    verificationTokenExpires?: Date;
    passwordResetTokenHash?: string;
    passwordResetTokenExpires?: Date;
}

class FakeUserRepository {
    records: Array<FakeUserData & { _id: { toString(): string }; save(): Promise<void> }> = [];

    async findOne(query: Record<string, any>) {
        return this.records.find((record) => Object.entries(query).every(([key, expected]) => {
            const actual = record[key as keyof typeof record];
            if (expected && typeof expected === 'object' && '$gt' in expected) {
                return actual instanceof Date && actual > expected.$gt;
            }
            return String(actual) === String(expected);
        })) ?? null;
    }

    async create(data: FakeUserData) {
        const id = `user-${this.records.length + 1}`;
        const record = {
            ...data,
            _id: { toString: () => id },
            save: async () => undefined
        };
        this.records.push(record);
        return record;
    }
}

describe('auth API integration', () => {
    const repository = new FakeUserRepository();
    let verificationToken = '';
    let resetToken = '';
    let server: Server;
    let baseUrl: string;

    const post = async (path: string, body: object) => {
        const response = await fetch(`${baseUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return { response, data: await response.json() as Record<string, any> };
    };

    beforeAll(async () => {
        process.env.ACCESS_TOKEN_SECRET = 'integration-test-secret-that-is-long-enough';
        const app = express();
        app.use(express.json());
        app.use('/api', createAuthRouter({
            userRepository: repository as any,
            sendVerification: async ({ token }) => { verificationToken = token; },
            sendPasswordReset: async ({ token }) => { resetToken = token; }
        }));

        await new Promise<void>((resolve, reject) => {
            server = app.listen(0, '127.0.0.1', (error?: Error) => error ? reject(error) : resolve());
        });
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    });

    test('registers with hashing, verifies email, resets password, and changes password', async () => {
        const registration = await post('/api/register', {
            firstName: 'Front',
            lastName: 'Tester',
            email: 'front@example.com',
            password: 'Password123'
        });
        expect(registration.response.status).toBe(201);
        expect(repository.records[0]?.passwordHash).not.toBe('Password123');
        expect(await verifyPassword('Password123', repository.records[0]!.passwordHash)).toBe(true);
        expect(verificationToken).not.toBe('');

        const blockedLogin = await post('/api/login', { login: 'front@example.com', password: 'Password123' });
        expect(blockedLogin.response.status).toBe(403);

        const originalVerificationToken = verificationToken;
        const resend = await post('/api/resend-verification', { email: 'front@example.com' });
        expect(resend.response.status).toBe(200);
        expect(verificationToken).not.toBe(originalVerificationToken);

        const verification = await post('/api/verify-email', { token: verificationToken });
        expect(verification.response.status).toBe(200);
        expect(repository.records[0]?.isEmailVerified).toBe(true);

        const login = await post('/api/login', { login: 'front@example.com', password: 'Password123' });
        expect(login.response.status).toBe(200);
        expect(login.data.accessToken).toBeString();

        const forgot = await post('/api/forgot-password', { email: 'front@example.com' });
        expect(forgot.response.status).toBe(200);
        expect(resetToken).not.toBe('');

        const reset = await post('/api/reset-password', { token: resetToken, password: 'Password456' });
        expect(reset.response.status).toBe(200);
        expect((await post('/api/login', { login: 'front@example.com', password: 'Password123' })).response.status).toBe(401);

        const resetLogin = await post('/api/login', { login: 'front@example.com', password: 'Password456' });
        expect(resetLogin.response.status).toBe(200);

        const changed = await post('/api/change-password', {
            currentPassword: 'Password456',
            newPassword: 'Password789',
            jwtToken: resetLogin.data.accessToken
        });
        expect(changed.response.status).toBe(200);
        expect((await post('/api/login', { login: 'front@example.com', password: 'Password789' })).response.status).toBe(200);
    });
});
