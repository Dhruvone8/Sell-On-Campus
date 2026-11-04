import { escapeHtml } from "./template.util.js";

export interface PasswordResetOtpEmailData {
    otp: string;
}

export function renderPasswordResetOtpEmail(data: PasswordResetOtpEmailData): { subject: string; text: string; html: string } {
    const otp = escapeHtml(data.otp);
    const subject = "SellOnCampus Password Reset";
    const text = `Your SellOnCampus password reset code is ${data.otp}. This code expires in 2 minutes`;
    const html = `<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background-color: #1e293b; padding: 20px 24px; border-bottom: 3px solid #f95a1e;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Sell<span style="color: #f95a1e;">On</span>Campus</h1>
    </div>
    <div style="padding: 28px 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Password Reset Code</h2>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">Use the code below to reset your SellOnCampus password:</p>
      <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ea580c; font-family: monospace;">${otp}</span>
      </div>
      <p style="margin: 0; font-size: 13px; color: #64748b;">This code expires in <strong>2 minutes</strong>.</p>
    </div>
  </div>
</body>
</html>`;

    return { subject, text, html };
}

