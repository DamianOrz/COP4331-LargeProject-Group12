import { Resend } from 'resend';

interface EmailTokenMessage {
    to: string;
    firstName: string;
    token: string;
}

function getFrontendUrl(): string {
    return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
}

const resend = new Resend(process.env.RESEND_API_KEY!);



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
    const verificationUrl =
        `${getFrontendUrl()}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`;

    const safeFirstName = escapeHtml(firstName);

    await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to,
        subject: "Verify your Meal Planner email",
        html: `
            <p>Hi ${safeFirstName},</p>
            <p>Verify your Meal Planner account using the link below:</p>
            <p><a href="${verificationUrl}">Verify Email</a></p>
        `,
    });
}

export async function sendPasswordResetEmail({ to, firstName, token }: EmailTokenMessage): Promise<void> {
    const resetUrl =
        `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;

    const safeFirstName = escapeHtml(firstName);

    await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to,
        subject: "Reset your Meal Planner password",
        html: `
            <p>Hi ${safeFirstName},</p>
            <p>Reset your Meal Planner password using the link below:</p>
            <p><a href="${resetUrl}">Reset Password</a></p>
        `,
    });
}