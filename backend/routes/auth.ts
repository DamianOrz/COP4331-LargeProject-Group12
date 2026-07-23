import { Router, type Request, type Response } from 'express';
import { createToken } from '../jwt';
import { requireAuth } from '../middleware/auth';
import users from '../schema/users';
import {
    PASSWORD_RESET_TOKEN_LIFETIME_MS,
    VERIFICATION_TOKEN_LIFETIME_MS,
    createOneTimeToken,
    hashOneTimeToken,
    hashPassword,
    isStrongPassword,
    verifyPassword
} from '../services/authSecurity';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/email';

interface AuthUserDocument {
    _id: { toString(): string };
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    verificationTokenHash?: string;
    verificationTokenExpires?: Date;
    passwordResetTokenHash?: string;
    passwordResetTokenExpires?: Date;
    save(): Promise<unknown>;
}

interface AuthUserRepository {
    findOne(query: Record<string, unknown>): Promise<AuthUserDocument | null>;
    create(data: Record<string, unknown>): Promise<AuthUserDocument>;
}

interface TokenEmailInput {
    to: string;
    firstName: string;
    token: string;
}

export interface AuthDependencies {
    userRepository: AuthUserRepository;
    sendVerification: (input: TokenEmailInput) => Promise<void>;
    sendPasswordReset: (input: TokenEmailInput) => Promise<void>;
}

const defaultDependencies: AuthDependencies = {
    userRepository: users as unknown as AuthUserRepository,
    sendVerification: sendVerificationEmail,
    sendPasswordReset: sendPasswordResetEmail
};

const normalizeEmail = (value: unknown) => String(value || '').trim().toLowerCase();
const normalizeText = (value: unknown) => String(value || '').trim();
const emailIsValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function setVerificationToken(user: AuthUserDocument): string {
    const token = createOneTimeToken();
    user.verificationTokenHash = hashOneTimeToken(token);
    user.verificationTokenExpires = new Date(Date.now() + VERIFICATION_TOKEN_LIFETIME_MS);
    return token;
}

function setPasswordResetToken(user: AuthUserDocument): string {
    const token = createOneTimeToken();
    user.passwordResetTokenHash = hashOneTimeToken(token);
    user.passwordResetTokenExpires = new Date(Date.now() + PASSWORD_RESET_TOKEN_LIFETIME_MS);
    return token;
}

export function createAuthRouter(dependencies: AuthDependencies = defaultDependencies) {
    const router = Router();
    const { userRepository, sendVerification, sendPasswordReset } = dependencies;

    router.post('/login', async (req: Request, res: Response) => {
        try {
            const email = normalizeEmail(req.body.login);
            const password = String(req.body.password || '');
            const user = await userRepository.findOne({ email });

            if (!user || !(await verifyPassword(password, user.passwordHash))) {
                return res.status(401).json({ error: 'Invalid Credentials' });
            }

            if (!user.isEmailVerified) {
                return res.status(403).json({ error: 'Please verify your email before logging in.' });
            }

            const userId = user._id.toString();
            const accessToken = createToken(user.firstName, user.lastName, userId, user.email);

            if (!accessToken) {
                return res.status(500).json({ error: 'Unable to create access token' });
            }

            return res.json({ accessToken, userId, firstName: user.firstName });
        } catch (error) {
            console.error('Login Error:', error);
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    });

    router.post('/register', async (req: Request, res: Response) => {
        try {
            const firstName = normalizeText(req.body.firstName);
            const lastName = normalizeText(req.body.lastName);
            const email = normalizeEmail(req.body.email);
            const password = String(req.body.password || '');

            if (!firstName || !lastName || !emailIsValid(email) || !isStrongPassword(password)) {
                return res.status(400).json({ error: 'Enter a valid name, email, and password.' });
            }

            if (await userRepository.findOne({ email })) {
                return res.status(403).json({ error: 'Account already exists' });
            }

            const verificationToken = createOneTimeToken();
            const user = await userRepository.create({
                firstName,
                lastName,
                email,
                passwordHash: await hashPassword(password),
                isEmailVerified: false,
                verificationTokenHash: hashOneTimeToken(verificationToken),
                verificationTokenExpires: new Date(Date.now() + VERIFICATION_TOKEN_LIFETIME_MS)
            });

            try {
                await sendVerification({ to: user.email, firstName: user.firstName, token: verificationToken });
                return res.status(201).json({ message: 'Account created. Check your email to verify your account.' });
            } catch (emailError) {
                console.error('Verification Email Error:', emailError);
                return res.status(201).json({ message: 'Account created, but the verification email could not be sent. Please resend it.' });
            }
        } catch (error: any) {
            if (error?.code === 11000) {
                return res.status(403).json({ error: 'Account already exists' });
            }
            console.error('Registration Error:', error);
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    });

    router.post('/verify-email', async (req: Request, res: Response) => {
        try {
            const token = normalizeText(req.body.token);
            if (!token) return res.status(400).json({ error: 'Verification token is required.' });

            const user = await userRepository.findOne({
                verificationTokenHash: hashOneTimeToken(token),
                verificationTokenExpires: { $gt: new Date() }
            });

            if (!user) {
                return res.status(400).json({ error: 'Verification link is invalid or has expired.' });
            }

            user.isEmailVerified = true;
            user.verificationTokenHash = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();

            return res.json({ message: 'Email verified successfully.' });
        } catch (error) {
            console.error('Email Verification Error:', error);
            return res.status(500).json({ error: 'Unable to verify email.' });
        }
    });

    router.post('/resend-verification', async (req: Request, res: Response) => {
        try {
            const email = normalizeEmail(req.body.email);
            if (!emailIsValid(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

            const user = await userRepository.findOne({ email });
            if (!user || user.isEmailVerified) {
                return res.json({ message: 'If the account needs verification, a new email has been sent.' });
            }

            const token = setVerificationToken(user);
            await user.save();
            await sendVerification({ to: user.email, firstName: user.firstName, token });

            return res.json({ message: 'Verification email sent.' });
        } catch (error) {
            console.error('Resend Verification Error:', error);
            return res.status(500).json({ error: 'Unable to send verification email.' });
        }
    });

    router.post('/forgot-password', async (req: Request, res: Response) => {
        try {
            const email = normalizeEmail(req.body.email);
            if (!emailIsValid(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

            const user = await userRepository.findOne({ email });
            if (user) {
                const token = setPasswordResetToken(user);
                await user.save();
                await sendPasswordReset({ to: user.email, firstName: user.firstName, token });
            }

            return res.json({ message: 'If an account exists for that email, a password reset link has been sent.' });
        } catch (error) {
            console.error('Forgot Password Error:', error);
            return res.status(500).json({ error: 'Unable to send password reset email.' });
        }
    });

    router.post('/reset-password', async (req: Request, res: Response) => {
        try {
            const token = normalizeText(req.body.token);
            const password = String(req.body.password || '');
            if (!token) return res.status(400).json({ error: 'Reset token is required.' });
            if (!isStrongPassword(password)) {
                return res.status(400).json({ error: 'Password must be at least 8 characters with a letter and a number.' });
            }

            const user = await userRepository.findOne({
                passwordResetTokenHash: hashOneTimeToken(token),
                passwordResetTokenExpires: { $gt: new Date() }
            });

            if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired.' });

            user.passwordHash = await hashPassword(password);
            user.passwordResetTokenHash = undefined;
            user.passwordResetTokenExpires = undefined;
            await user.save();

            return res.json({ message: 'Your password has been reset.' });
        } catch (error) {
            console.error('Reset Password Error:', error);
            return res.status(500).json({ error: 'Unable to reset password.' });
        }
    });

    router.post('/change-password', requireAuth, async (req: Request, res: Response) => {
        try {
            const currentPassword = String(req.body.currentPassword || '');
            const newPassword = String(req.body.newPassword || '');
            if (!isStrongPassword(newPassword)) {
                return res.status(400).json({ error: 'Password must be at least 8 characters with a letter and a number.' });
            }

            const user = await userRepository.findOne({ _id: res.locals.authUser.userId });
            if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
                return res.status(400).json({ error: 'Current password is incorrect.', jwtToken: res.locals.refreshedToken });
            }

            user.passwordHash = await hashPassword(newPassword);
            user.passwordResetTokenHash = undefined;
            user.passwordResetTokenExpires = undefined;
            await user.save();

            return res.json({ message: 'Your password has been changed.', jwtToken: res.locals.refreshedToken });
        } catch (error) {
            console.error('Change Password Error:', error);
            return res.status(500).json({ error: 'Unable to change password.', jwtToken: '' });
        }
    });

    return router;
}

export default createAuthRouter();
