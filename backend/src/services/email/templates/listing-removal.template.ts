import { escapeHtml } from "./template.util.js";

export interface ListingRemovalEmailData {
    listingTitle: string;
    reason: string;
    notes?: string | undefined;
}

export function renderListingRemovalEmail(data: ListingRemovalEmailData): { subject: string; text: string; html: string } {
    const reasonLabel = data.reason.replace(/_/g, " ").toLowerCase();
    const listingTitle = data.listingTitle;
    const notes = data.notes;

    const subject = `Your listing "${listingTitle}" was removed on SellOnCampus`;

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

    const html = `<!DOCTYPE html>
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
</html>`;

    return { subject, text, html };
}

