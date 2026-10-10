import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = process.env.SMTP_FROM || "SellOnCampus <noreply@selloncampus.site>";

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
    const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to,
        subject,
        text,
        ...(html ? { html } : {}),
    });

    if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

export async function sendRegistrationOtpEmail(email: string, otp: string) {
    const text = `Your SellOnCampus verification code is ${otp}. This code expires in 2 minutes`;
    const html = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background-color: #1e293b; padding: 20px 24px; border-bottom: 3px solid #f95a1e;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Sell<span style="color: #f95a1e;">On</span>Campus</h1>
    </div>
    <div style="padding: 28px 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Verify Your Student Email</h2>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">Use the verification code below to complete your registration:</p>
      <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ea580c; font-family: monospace;">${otp}</span>
      </div>
      <p style="margin: 0; font-size: 13px; color: #64748b;">This code expires in <strong>2 minutes</strong>. If you did not request this, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;
    await sendEmail(email, "SellOnCampus Email Verification", text, html);
}

export async function sendPasswordResetOtpEmail(email: string, otp: string) {
    const text = `Your SellOnCampus password reset code is ${otp}. This code expires in 2 minutes`;
    const html = `
<!DOCTYPE html>
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
</html>
`;
    await sendEmail(email, "SellOnCampus Password Reset", text, html);
}

// --- Moderation Emails ---

export async function sendWarningEmail(email: string, reason: string, notes?: string) {
    const reasonLabel = reason.replace(/_/g, " ").toLowerCase();
    const text = [
        `Dear Student,`,
        ``,
        `We've received a report regarding your activity on SellOnCampus for: ${reasonLabel}.`,
        notes ? `Admin notes: ${notes}` : "",
        ``,
        `This is a formal warning. Please review our campus marketplace guidelines to avoid further action on your account.`,
        ``,
        `If you believe this was a mistake, please contact the SellOnCampus admin.`,
        ``,
        `— SellOnCampus Team`,
    ].filter(Boolean).join("\n");

    const html = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background-color: #1e293b; padding: 20px 24px; border-bottom: 3px solid #f59e0b;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Sell<span style="color: #f95a1e;">On</span>Campus <span style="font-size: 13px; font-weight: 500; color: #fcd34d; margin-left: 8px;">Notice</span></h1>
    </div>
    <div style="padding: 28px 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Community Guideline Reminder</h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">Dear Student,</p>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">
        We received a report regarding your activity on SellOnCampus for: <strong style="color: #b45309;">${escapeHtml(reasonLabel)}</strong>.
      </p>
      ${notes ? `
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
        <strong style="color: #92400e; font-size: 13px; display: block; margin-bottom: 4px;">Admin Notes:</strong>
        <p style="margin: 0; font-size: 13px; color: #78350f;">"${escapeHtml(notes)}"</p>
      </div>` : ""}
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">
        This is a formal warning. Please review our campus marketplace guidelines to keep SellOnCampus safe for all students.
      </p>
      <p style="margin: 0; font-size: 13px; color: #94a3b8;">If you believe this was sent in error, please reply to contact the administration.</p>
    </div>
    <div style="background-color: #f1f5f9; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      SellOnCampus Community Safety Team
    </div>
  </div>
</body>
</html>
`;

    await sendEmail(email, "[Notice] Marketplace guideline reminder on SellOnCampus", text, html);
}

export async function sendListingRemovalEmail(email: string, listingTitle: string, reason: string, notes?: string) {
    const reasonLabel = reason.replace(/_/g, " ").toLowerCase();
    const text = [
        `Dear Student,`,
        ``,
        `Your listing "${listingTitle}" has been removed from SellOnCampus.`,
        ``,
        `Reason: ${reasonLabel}.`,
        notes ? `Admin notes: ${notes}` : "",
        ``,
        `Repeated violations may result in account suspension. If you believe this was a mistake, please contact the SellOnCampus admin.`,
        ``,
        `— SellOnCampus Team`,
    ].filter(Boolean).join("\n");

    const html = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background-color: #1e293b; padding: 20px 24px; border-bottom: 3px solid #dc2626;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Sell<span style="color: #f95a1e;">On</span>Campus <span style="font-size: 13px; font-weight: 500; color: #fca5a5; margin-left: 8px;">Listing Removed</span></h1>
    </div>
    <div style="padding: 28px 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Your Listing Has Been Removed</h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">Dear Student,</p>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">
        Your listing <strong style="color: #0f172a;">"${escapeHtml(listingTitle)}"</strong> has been removed from SellOnCampus for violating campus marketplace rules.
      </p>
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #991b1b;">
          <strong>Reason:</strong> ${escapeHtml(reasonLabel)}
        </p>
        ${notes ? `<p style="margin: 0; font-size: 13px; color: #991b1b;"><strong>Admin Notes:</strong> "${escapeHtml(notes)}"</p>` : ""}
      </div>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569;">
        Repeated violations may lead to account suspension. If you believe this removal was a mistake, please reach out to the campus administrator.
      </p>
    </div>
    <div style="background-color: #f1f5f9; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      SellOnCampus Community Safety Team
    </div>
  </div>
</body>
</html>
`;

    await sendEmail(email, `Your listing "${listingTitle}" was removed on SellOnCampus`, text, html);
}

export async function sendAccountSuspensionEmail(email: string, action: "USER_SUSPENDED" | "USER_BANNED", reason: string, notes?: string) {
    const status = action === "USER_SUSPENDED" ? "suspended" : "permanently banned";
    const reasonLabel = reason.replace(/_/g, " ").toLowerCase();
    const text = [
        `Dear Student,`,
        ``,
        `Your SellOnCampus account has been ${status}.`,
        ``,
        `Reason: ${reasonLabel}.`,
        notes ? `Admin notes: ${notes}` : "",
        ``,
        `If you believe this decision was made in error, please contact the SellOnCampus admin`,
        ``,
        `— SellOnCampus Team`,
    ].filter(Boolean).join("\n");

    const html = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="background-color: #1e293b; padding: 20px 24px; border-bottom: 3px solid #b91c1c;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Sell<span style="color: #f95a1e;">On</span>Campus <span style="font-size: 13px; font-weight: 500; color: #fca5a5; margin-left: 8px;">Account Alert</span></h1>
    </div>
    <div style="padding: 28px 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #991b1b;">Your Account Has Been ${action === "USER_SUSPENDED" ? "Suspended" : "Banned"}</h2>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">Dear Student,</p>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">
        Your SellOnCampus account has been <strong style="color: #991b1b;">${status}</strong> due to community guideline violations.
      </p>
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #991b1b;">
          <strong>Reason:</strong> ${escapeHtml(reasonLabel)}
        </p>
        ${notes ? `<p style="margin: 0; font-size: 13px; color: #991b1b;"><strong>Admin Notes:</strong> "${escapeHtml(notes)}"</p>` : ""}
      </div>
      <p style="margin: 0; font-size: 13px; color: #64748b;">If you believe this decision was made in error, please contact the campus administrator.</p>
    </div>
    <div style="background-color: #f1f5f9; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      SellOnCampus Community Safety Team
    </div>
  </div>
</body>
</html>
`;

    await sendEmail(email, `SellOnCampus Account ${action === "USER_SUSPENDED" ? "Suspended" : "Banned"}`, text, html);
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
    const reasonLabel = reportData.reason.replace(/_/g, " ");

    const textBody = [
        `Dear Administrator,`,
        ``,
        `A new report has been submitted on SellOnCampus and requires your review.`,
        ``,
        `--- REPORT DETAILS ---`,
        `Reason: ${reasonLabel}`,
        `Reported ${reportData.targetType === "listing" ? "Listing" : "User"}: "${reportData.targetTitle}"`,
        reportData.sellerName ? `Seller / Owner: ${reportData.sellerName}${reportData.sellerEmail ? ` (${reportData.sellerEmail})` : ""}` : "",
        `Reported By: ${reportData.reporterName} (${reportData.reporterEmail})`,
        reportData.description ? `Student Details: "${reportData.description}"` : `Student Details: None provided`,
        ``,
        `--- ACTION REQUIRED ---`,
        `Inspect the report and resolve it in the Moderation Queue:`,
        `${queueUrl}`,
        ``,
        `— SellOnCampus Automated Moderation System`,
    ].filter(Boolean).join("\n");

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Report Submitted</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Brand Header Banner -->
    <div style="background-color: #1e293b; padding: 20px 24px; border-bottom: 3px solid #f95a1e;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
        Sell<span style="color: #f95a1e;">On</span>Campus <span style="font-size: 13px; font-weight: 500; color: #94a3b8; margin-left: 8px;">Moderation System</span>
      </h1>
    </div>

    <!-- Main Content -->
    <div style="padding: 28px 24px;">
      <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
        Action Required: New ${escapeHtml(reasonLabel)} Report
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">
        A student has submitted a new report for review on SellOnCampus. Please inspect the details below and take appropriate moderation action.
      </p>

      <!-- Details Card with Bold Headings -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 14px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          Report Details
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 7px 0; color: #64748b; width: 140px; vertical-align: top;">
              <strong>Reason:</strong>
            </td>
            <td style="padding: 7px 0; vertical-align: top;">
              <span style="display: inline-block; background-color: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #fee2e2;">
                ${escapeHtml(reasonLabel)}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 7px 0; color: #64748b; vertical-align: top;">
              <strong>Reported ${reportData.targetType === "listing" ? "Listing" : "User"}:</strong>
            </td>
            <td style="padding: 7px 0; color: #0f172a; font-size: 15px; font-weight: 700; vertical-align: top;">
              "${escapeHtml(reportData.targetTitle)}"
            </td>
          </tr>
          ${reportData.sellerName ? `
          <tr>
            <td style="padding: 7px 0; color: #64748b; vertical-align: top;">
              <strong>Seller / Owner:</strong>
            </td>
            <td style="padding: 7px 0; color: #0f172a; vertical-align: top;">
              <strong>${escapeHtml(reportData.sellerName)}</strong> ${reportData.sellerEmail ? `<span style="color: #64748b;">(${escapeHtml(reportData.sellerEmail)})</span>` : ""}
            </td>
          </tr>` : ""}
          <tr>
            <td style="padding: 7px 0; color: #64748b; vertical-align: top;">
              <strong>Reported By:</strong>
            </td>
            <td style="padding: 7px 0; color: #0f172a; vertical-align: top;">
              <strong>${escapeHtml(reportData.reporterName)}</strong> <span style="color: #64748b;">(${escapeHtml(reportData.reporterEmail)})</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 7px 0; color: #64748b; vertical-align: top;">
              <strong>Student Notes:</strong>
            </td>
            <td style="padding: 7px 0; color: #334155; vertical-align: top;">
              ${reportData.description ? `<em>"${escapeHtml(reportData.description)}"</em>` : `<span style="color: #94a3b8;">None provided</span>`}
            </td>
          </tr>
        </table>
      </div>

      <!-- Action Required Section -->
      <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #c2410c;">
          Moderation Action Required
        </h3>
        <p style="margin: 0; font-size: 13px; color: #9a3412;">
          Review this report in the dashboard to dismiss it, warn the seller, remove the listing, or suspend the user account.
        </p>
      </div>

      <!-- Prominent Call To Action Button -->
      <div style="text-align: center; margin: 28px 0 16px 0;">
        <a href="${queueUrl}" style="display: inline-block; background-color: #f95a1e; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(249, 90, 30, 0.25);">
          Inspect & Resolve in Moderation Queue &rarr;
        </a>
      </div>
    </div>

    <!-- Confidential Footer -->
    <div style="background-color: #f1f5f9; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
      SellOnCampus Moderation System &bull; Automated notification for administrators
    </div>
  </div>
</body>
</html>
    `;

    await sendEmail(
        adminEmail,
        `[Action Required] New ${reasonLabel} Report on SellOnCampus`,
        textBody,
        htmlBody
    );
}