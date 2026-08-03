import type { TemplateCategory } from "./types";

export type TemplateVariable = {
    key: string;
    sample: string;
    description: string;
};

export const COMMON_VARIABLES: TemplateVariable[] = [
    {
        key: "app_name",
        sample: "Dugble",
        description: "Your product or company name",
    },
    {
        key: "user_name",
        sample: "Prosper Kessie",
        description: "Recipient's display name",
    },
];

export const CATEGORY_VARIABLES: Record<TemplateCategory, TemplateVariable[]> =
    {
        otp: [
            {
                key: "otp_code",
                sample: "482913",
                description: "One-time passcode",
            },
            {
                key: "expires_in_minutes",
                sample: "10",
                description: "Minutes until the code expires",
            },
        ],
        welcome: [
            {
                key: "dashboard_url",
                sample: "https://app.dugble.com/dashboard",
                description: "Link to the product dashboard",
            },
        ],
        receipt: [
            { key: "amount", sample: "$49.00", description: "Amount charged" },
            {
                key: "invoice_id",
                sample: "INV-10432",
                description: "Invoice reference number",
            },
        ],
        alert: [
            {
                key: "event_name",
                sample: "New sign-in detected",
                description: "What triggered this alert",
            },
            {
                key: "ip_address",
                sample: "154.160.22.8",
                description: "Origin IP address of the event",
            },
        ],
        notification: [
            {
                key: "summary",
                sample: "3 webhook deliveries failed in the last hour",
                description: "One-line notification summary",
            },
        ],
        custom: [
            {
                key: "custom_value",
                sample: "Sample value",
                description: "Placeholder for any custom field",
            },
        ],
    };

export function variablesForCategory(
    category: TemplateCategory,
): TemplateVariable[] {
    return [...COMMON_VARIABLES, ...CATEGORY_VARIABLES[category]];
}

export function interpolateHtml(
    html: string,
    variables: TemplateVariable[],
): string {
    return variables.reduce(
        (acc, variable) =>
            acc.split(`{{${variable.key}}}`).join(variable.sample),
        html,
    );
}

function scaffold(heading: string, bodyHtml: string): string {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow-wrap:anywhere;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;background-color:#f4f4f5;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="table-layout:fixed;width:480px;max-width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #ececec; overflow-wrap:anywhere;">
                <span style="font-size:14px;font-weight:600;letter-spacing:-0.01em;color:#111111;">{{app_name}}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;overflow-wrap:anywhere;word-break:break-word;">
                <h1 style="margin:0 0 16px;font-size:19px;line-height:1.4;color:#111111;">${heading}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #ececec;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#9a9a9a;">
                  Sent by {{app_name}} &middot; If you didn't expect this email, you can safely ignore it.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const BUTTON_STYLE =
    "display:inline-block;padding:11px 20px;background-color:#111111;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;";
const PARAGRAPH_STYLE =
    "margin:0 0 20px;font-size:14px;line-height:1.6;color:#3f3f46;";

const BODY_BY_CATEGORY: Record<
    TemplateCategory,
    { heading: string; body: string }
> = {
    otp: {
        heading: "Confirm it's you",
        body: `
        <p style="${PARAGRAPH_STYLE}">Hi {{user_name}}, use the code below to finish signing in. It expires in {{expires_in_minutes}} minutes.</p>
        <div style="margin:0 0 20px;padding:16px 0;background-color:#f4f4f5;border-radius:8px;text-align:center;">
          <span style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:600;letter-spacing:0.2em;color:#111111;">{{otp_code}}</span>
        </div>
        <p style="${PARAGRAPH_STYLE}margin-bottom:0;">Didn't request this? You can ignore this email.</p>`,
    },
    welcome: {
        heading: "Welcome to {{app_name}} 🎉",
        body: `
        <p style="${PARAGRAPH_STYLE}">Hi {{user_name}}, your account is ready. Here's your dashboard to start sending your first emails.</p>
        <a href="{{dashboard_url}}" style="${BUTTON_STYLE}">Go to dashboard</a>`,
    },
    receipt: {
        heading: "Payment received",
        body: `
        <p style="${PARAGRAPH_STYLE}">Hi {{user_name}}, this confirms your payment of <strong>{{amount}}</strong> for invoice <strong>{{invoice_id}}</strong>.</p>
        <p style="${PARAGRAPH_STYLE}margin-bottom:0;">A copy of this receipt has been saved to your billing history.</p>`,
    },
    alert: {
        heading: "Security alert",
        body: `
        <p style="${PARAGRAPH_STYLE}">Hi {{user_name}}, we noticed: <strong>{{event_name}}</strong> from IP <strong>{{ip_address}}</strong>.</p>
        <p style="${PARAGRAPH_STYLE}margin-bottom:0;">If this wasn't you, please secure your account immediately.</p>`,
    },
    notification: {
        heading: "Here's your update",
        body: `
        <p style="${PARAGRAPH_STYLE}margin-bottom:0;">Hi {{user_name}}, {{summary}}.</p>`,
    },
    custom: {
        heading: "Hello {{user_name}}",
        body: `
        <p style="${PARAGRAPH_STYLE}margin-bottom:0;">This is a custom template. Replace this text and use {{custom_value}} or any variable you define.</p>`,
    },
};

export function defaultHtmlForCategory(category: TemplateCategory): string {
    const { heading, body } = BODY_BY_CATEGORY[category];
    return scaffold(heading, body);
}
