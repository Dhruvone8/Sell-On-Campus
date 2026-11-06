import { Resend } from "resend";
import {
    LOGO_IMAGE_BUFFER,
    renderWelcomeEmail,
    renderRegistrationOtpEmail,
    renderPasswordResetOtpEmail,
    renderWarningEmail,
    renderListingRemovalEmail,
    renderAccountSuspensionEmail,
    renderReportAlertEmail,
} from "./templates/index.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.SMTP_FROM || "SellOnCampus <noreply@selloncampus.site>";

export interface EmailAttachment {
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
    contentId?: string;
}

export async function sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: EmailAttachment[],
    idempotencyKey?: string
) {
    const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject,
        text,
        ...(html ? { html } : {}),
        ...(attachments && attachments.length > 0 ? { attachments } : {}),
    },
        idempotencyKey ? { idempotencyKey } : undefined);

    if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

export async function sendRegistrationOtpEmail(email: string, otp: string) {
    const { subject, text, html } = renderRegistrationOtpEmail({ otp });
    await sendEmail(email, subject, text, html);
}

export async function sendPasswordResetOtpEmail(email: string, otp: string) {
    const { subject, text, html } = renderPasswordResetOtpEmail({ otp });
    await sendEmail(email, subject, text, html);
}

// --- Moderation Emails ---

export async function sendWarningEmail(email: string, reason: string, notes?: string) {
    const { subject, text, html } = renderWarningEmail({ reason, notes });
    await sendEmail(email, subject, text, html);
}

export async function sendListingRemovalEmail(email: string, listingTitle: string, reason: string, notes?: string) {
    const { subject, text, html } = renderListingRemovalEmail({ listingTitle, reason, notes });
    await sendEmail(email, subject, text, html);
}

export async function sendAccountSuspensionEmail(
    email: string,
    action: "USER_SUSPENDED" | "USER_BANNED",
    reason: string,
    notes?: string
) {
    const { subject, text, html } = renderAccountSuspensionEmail({ action, reason, notes });
    await sendEmail(email, subject, text, html);
}

export async function sendNewReportAlertEmail(
    adminEmail: string,
    reportData: {
        reason: string;
        description?: string | undefined;
        targetTitle: string;
        targetType: "listing" | "user";
        sellerName?: string | undefined;
        sellerEmail?: string | undefined;
        reporterName: string;
        reporterEmail: string;
    }
) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const queueUrl = `${frontendUrl}/admin/reports`;

    const { subject, text, html } = renderReportAlertEmail({
        ...reportData,
        queueUrl,
    });

    await sendEmail(adminEmail, subject, text, html);
}

export async function sendWelcomeEmail(email: string, name: string, idempotencyKey?: string) {
    const firstName = name.trim().split(/\s+/)[0] || "Student";
    const marketplaceUrl = (process.env.FRONTEND_URL || "https://selloncampus.site").replace(/\/$/, "");

    const { subject, text, html } = renderWelcomeEmail({ firstName, marketplaceUrl });

    await sendEmail(email, subject, text, html, [
        {
            filename: "logo.jpg",
            content: LOGO_IMAGE_BUFFER,
            contentId: "selloncampus-logo",
            contentType: "image/jpeg",
        },
    ], idempotencyKey);
}