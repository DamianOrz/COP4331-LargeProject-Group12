import nodemailer from 'nodemailer';

interface EmailTokenMessage {
    to: string;
    firstName: string;
    token: string;
}

function getFrontendUrl(): string {
    return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
}

function getTransport() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured.');
    }

    return nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass }
    });
}

function getSender(): string {
    return process.env.EMAIL_FROM || process.env.SMTP_USER || 'Meal Planner';
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]!);
}

export async function sendVerificationEmail({ to, firstName, token }: EmailTokenMessage): Promise<void> {
    const verificationUrl = `${getFrontendUrl()}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;
    const safeFirstName = escapeHtml(firstName);

    await getTransport().sendMail({
        from: getSender(),
        to,
        subject: 'Verify your Meal Planner email',
        text: `Hi ${firstName}, verify your Meal Planner account: ${verificationUrl}`,
        html: `<p>Hi ${safeFirstName},</p><p>Verify your Meal Planner account using the link below:</p><p><a href="${verificationUrl}">Verify email</a></p>`
    });
}

export async function sendPasswordResetEmail({ to, firstName, token }: EmailTokenMessage): Promise<void> {
    const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    const safeFirstName = escapeHtml(firstName);

    await getTransport().sendMail({
        from: getSender(),
        to,
        subject: 'Reset your Meal Planner password',
        text: `Hi ${firstName}, reset your Meal Planner password: ${resetUrl}`,
        html: `<p>Hi ${safeFirstName},</p><p>Reset your Meal Planner password using the link below:</p><p><a href="${resetUrl}">Reset password</a></p>`
    });
}
