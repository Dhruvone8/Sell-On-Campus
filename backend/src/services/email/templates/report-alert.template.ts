import { escapeHtml } from "./template.util.js";

export interface ReportAlertEmailData {
    reason: string;
    description?: string | undefined;
    targetTitle: string;
    targetType: "listing" | "user";
    sellerName?: string | undefined;
    sellerEmail?: string | undefined;
    reporterName: string;
    reporterEmail: string;
    queueUrl: string;
}

export function renderReportAlertEmail(data: ReportAlertEmailData): { subject: string; text: string; html: string } {
    const reasonLabel = data.reason.replace(/_/g, " ");
    const queueUrl = data.queueUrl;

    const sanitizedDescription = data.description
        ? data.description.replace(/[\r\n]+/g, " ").replace(/"/g, "'").trim()
        : undefined;
    const sanitizedTargetTitle = data.targetTitle.replace(/[\r\n]+/g, " ").replace(/"/g, "'").trim();

    const subject = `[Action Required] New ${reasonLabel} Report on SellOnCampus`;

    const text = [
        `Dear Administrator,`,
        ``,
        `A new report has been submitted on SellOnCampus and requires your review.`,
        ``,
        `--- REPORT DETAILS ---`,
        `Reason: ${reasonLabel}`,
        `Reported ${data.targetType === "listing" ? "Listing" : "User"}: "${sanitizedTargetTitle}"`,
        data.sellerName ? `Seller / Owner: ${data.sellerName}${data.sellerEmail ? ` (${data.sellerEmail})` : ""}` : "",
        `Reported By: ${data.reporterName} (${data.reporterEmail})`,
        sanitizedDescription ? `Student Details: "${sanitizedDescription}"` : `Student Details: None provided`,
        ``,
        `--- ACTION REQUIRED ---`,
        `Inspect the report and resolve it in the Moderation Queue:`,
        `${queueUrl}`,
        ``,
        `— SellOnCampus Automated Moderation System`,
    ].filter(Boolean).join("\n");

    const html = `<!DOCTYPE html>
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
              <strong>Reported ${data.targetType === "listing" ? "Listing" : "User"}:</strong>
            </td>
            <td style="padding: 7px 0; color: #0f172a; font-size: 15px; font-weight: 700; vertical-align: top;">
              "${escapeHtml(data.targetTitle)}"
            </td>
          </tr>
          ${data.sellerName ? `
          <tr>
            <td style="padding: 7px 0; color: #64748b; vertical-align: top;">
              <strong>Seller / Owner:</strong>
            </td>
            <td style="padding: 7px 0; color: #0f172a; vertical-align: top;">
              <strong>${escapeHtml(data.sellerName)}</strong> ${data.sellerEmail ? `<span style="color: #64748b;">(${escapeHtml(data.sellerEmail)})</span>` : ""}
            </td>
          </tr>` : ""}
          <tr>
            <td style="padding: 7px 0; color: #64748b; vertical-align: top;">
              <strong>Reported By:</strong>
            </td>
            <td style="padding: 7px 0; color: #0f172a; vertical-align: top;">
              <strong>${escapeHtml(data.reporterName)}</strong> <span style="color: #64748b;">(${escapeHtml(data.reporterEmail)})</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 7px 0; color: #64748b; vertical-align: top;">
              <strong>Student Notes:</strong>
            </td>
            <td style="padding: 7px 0; color: #334155; vertical-align: top;">
              ${data.description ? `<em>"${escapeHtml(data.description)}"</em>` : `<span style="color: #94a3b8;">None provided</span>`}
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
</html>`;

    return { subject, text, html };
}

