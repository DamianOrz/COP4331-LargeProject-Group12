import { createHash, randomBytes } from 'node:crypto';

export const VERIFICATION_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export function isStrongPassword(password: string): boolean {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export async function hashPassword(password: string): Promise<string> {
    return Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    try {
        return await Bun.password.verify(password, passwordHash, 'bcrypt');
    } catch {
        return false;
    }
}

export function createOneTimeToken(): string {
    return randomBytes(32).toString('hex');
}

export function hashOneTimeToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}
