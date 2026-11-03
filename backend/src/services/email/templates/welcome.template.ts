interface WelcomeEmailData {
    firstName: string;
    marketplaceUrl: string;
    logoUrl?: string;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function renderWelcomeEmail(data: WelcomeEmailData): { subject: string; text: string; html: string } {
    const firstName = escapeHtml(data.firstName);
    const marketplaceUrl = data.marketplaceUrl;
    const logoUrl = data.logoUrl || "cid:selloncampus-logo";

    const subject = "Welcome to SellOnCampus!";

    const text = [
        `Hey ${data.firstName},`,
        ``,
        `Welcome to SellOnCampus! We're excited to have you here.`,
        ``,
        `You've just joined a community where students can buy, sell, and discover things right within their campus.`,
        ``,
        `Here's what you can do:`,
        ``,
        `- Discover great finds: Find useful items listed by fellow students.`,
        `- Sell what you no longer need: Give your unused items a new home.`,
        `- Connect directly: Chat with buyers and sellers to make deals happen.`,
        ``,
        `Explore SellOnCampus: ${marketplaceUrl}`,
        ``,
        `Happy buying and selling!`,
        `Team SellOnCampus`,
        ``,
        `Your campus. Your marketplace.`,
    ].join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SellOnCampus</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fafafa;">
    Your campus marketplace journey starts here.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; text-align: left;">
          
          <!-- Header / Wordmark with Logo -->
          <tr>
            <td style="padding: 36px 36px 24px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <img src="${logoUrl}" alt="" width="32" height="32" style="display: block; width: 32px; height: 32px; max-width: 32px; border: 0; outline: none; text-decoration: none; border-radius: 4px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.4px; color: #18181b; line-height: 1; text-decoration: none;">
                      Sell<span style="color: #f95a1e;">On</span>Campus
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 36px 36px 36px;">
              <h1 style="margin: 0 0 18px 0; font-size: 22px; font-weight: 700; line-height: 1.3; color: #18181b; letter-spacing: -0.3px;">
                Welcome to SellOnCampus!
              </h1>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                Hey ${firstName},
              </p>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                Welcome to SellOnCampus! We're excited to have you here. You've just joined a community where students can buy, sell, and discover things right within their campus.
              </p>

              <p style="margin: 28px 0 12px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a;">
                Here's what you can do
              </p>

              <!-- Feature List (Minimal & Typography Focused) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 12px 0; border-top: 1px solid #f4f4f5;">
                    <div style="font-size: 14px; font-weight: 600; color: #18181b; margin-bottom: 3px;">
                      Discover great finds
                    </div>
                    <div style="font-size: 14px; color: #71717a; line-height: 1.5;">
                      Find useful items listed by fellow students.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-top: 1px solid #f4f4f5;">
                    <div style="font-size: 14px; font-weight: 600; color: #18181b; margin-bottom: 3px;">
                      Sell what you no longer need
                    </div>
                    <div style="font-size: 14px; color: #71717a; line-height: 1.5;">
                      Give your unused items a new home.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-top: 1px solid #f4f4f5; border-bottom: 1px solid #f4f4f5;">
                    <div style="font-size: 14px; font-weight: 600; color: #18181b; margin-bottom: 3px;">
                      Connect directly
                    </div>
                    <div style="font-size: 14px; color: #71717a; line-height: 1.5;">
                      Chat with buyers and sellers to make deals happen.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 32px 0;">
                <tr>
                  <td align="left" style="border-radius: 6px; background-color: #f95a1e;">
                    <a href="${marketplaceUrl}" target="_blank" style="display: inline-block; padding: 12px 26px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                      Explore SellOnCampus
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Sign-off -->
              <p style="margin: 0 0 4px 0; font-size: 14px; line-height: 1.5; color: #52525b;">
                Happy buying and selling!
              </p>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #18181b;">
                Team SellOnCampus
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 36px; background-color: #fafafa; border-top: 1px solid #f4f4f5; font-size: 12px; color: #71717a;">
              Your campus. Your marketplace.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return { subject, text, html };
}
