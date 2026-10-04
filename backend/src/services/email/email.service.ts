import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.SMTP_FROM || "SellOnCampus <noreply@send.selloncampus.site>";

export async function sendEmail(to: string, subject: string, text: string) {
    const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject,
        text,
    });

    if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

export async function sendRegistrationOtpEmail(email: string, otp: string) {
    await sendEmail(
        email,
        "SellOnCampus Email Verification",
        `Your SellOnCampus verification code is ${otp}. This code expires in 2 minutes`
    );
}

export async function sendPasswordResetOtpEmail(email: string, otp: string) {
    await sendEmail(
        email, "SellOnCampus Password Reset",
        `Your SellOnCampus password reset code is ${otp}. This code expires in 2 minutes`
    )
}