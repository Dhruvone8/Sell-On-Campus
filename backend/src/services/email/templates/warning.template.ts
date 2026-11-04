import { escapeHtml } from "./template.util.js";

export interface WarningEmailData {
    reason: string;
    notes?: string | undefined;
}

export function renderWarningEmail(data: WarningEmailData): { subject: string; text: string; html: string } {
    const reasonLabel = data.reason.replace(/_/g, " ").toLowerCase();
    const notes = data.notes;

    const subject = "[Notice] Marketplace guideline reminder on SellOnCampus";

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

    const html = `<!DOCTYPE html>
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
</html>`;

    return { subject, text, html };
}

