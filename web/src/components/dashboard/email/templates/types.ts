import { defaultHtmlForCategory } from "./template-content";

export type TemplateCategory =
    | "otp"
    | "welcome"
    | "receipt"
    | "alert"
    | "notification"
    | "custom";

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
    "otp",
    "welcome",
    "receipt",
    "alert",
    "notification",
    "custom",
];

export type TemplateStatus = "published" | "draft";

export type TemplateViewMode = "grid" | "list";

export type EmailTemplate = {
    id: string;
    name: string;
    subject: string;
    previewText: string;
    description: string;
    category: TemplateCategory;
    status: TemplateStatus;
    updatedAt: Date;
    createdAt: Date;
    sentLast30d: number;
    version: number;
    htmlBody: string;
};

export const CATEGORY_CONFIG: Record<
    TemplateCategory,
    { label: string; colorClass: string; dotClass: string }
> = {
    otp: { label: "OTP", colorClass: "text-chart-1", dotClass: "bg-chart-1" },
    welcome: {
        label: "Welcome",
        colorClass: "text-chart-2",
        dotClass: "bg-chart-2",
    },
    receipt: {
        label: "Receipt",
        colorClass: "text-signal",
        dotClass: "bg-signal",
    },
    alert: {
        label: "Alert",
        colorClass: "text-pending",
        dotClass: "bg-pending",
    },
    notification: {
        label: "Notification",
        colorClass: "text-chart-4",
        dotClass: "bg-chart-4",
    },
    custom: {
        label: "Custom",
        colorClass: "text-chart-5",
        dotClass: "bg-chart-5",
    },
};

export const TEMPLATE_STATUS_LABEL: Record<TemplateStatus, string> = {
    published: "Published",
    draft: "Draft",
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function ago(ms: number): Date {
    return new Date(Date.now() - ms);
}

export const TEMPLATES: EmailTemplate[] = [
    {
        id: "tpl_otp_verify",
        name: "OTP Verification Code",
        subject: "Your verification code",
        previewText: "Your one-time code expires in 10 minutes.",
        description:
            "One-time passcode sent for sign-in and other sensitive account actions.",
        category: "otp",
        status: "published",
        updatedAt: ago(2 * HOUR),
        createdAt: ago(210 * DAY),
        sentLast30d: 8412,
        version: 1,
        htmlBody: defaultHtmlForCategory("otp"),
    },
    {
        id: "tpl_magic_link",
        name: "Magic Sign-in Link",
        subject: "Your sign-in link for Dugble",
        previewText: "Tap the button to sign in. Link expires shortly.",
        description:
            "Password-less login link that expires 15 minutes after it's sent.",
        category: "otp",
        status: "published",
        updatedAt: ago(28 * HOUR),
        createdAt: ago(180 * DAY),
        sentLast30d: 3021,
        version: 3,
        htmlBody: defaultHtmlForCategory("otp"),
    },
    {
        id: "tpl_welcome",
        name: "Welcome to Dugble",
        subject: "Welcome aboard 🎉",
        previewText: "You're in. Here's what to do first.",
        description:
            "First email new users receive right after they create an account.",
        category: "welcome",
        status: "published",
        updatedAt: ago(3 * DAY),
        createdAt: ago(240 * DAY),
        sentLast30d: 1204,
        version: 2,
        htmlBody: defaultHtmlForCategory("welcome"),
    },
    {
        id: "tpl_account_verified",
        name: "Account Verified",
        subject: "You're verified ✅",
        previewText: "Your account is now verified.",
        description: "Confirms a successful email or identity verification.",
        category: "welcome",
        status: "draft",
        updatedAt: ago(45 * MIN),
        createdAt: ago(4 * DAY),
        sentLast30d: 0,
        version: 1,
        htmlBody: defaultHtmlForCategory("welcome"),
    },
    {
        id: "tpl_payment_receipt",
        name: "Payment Receipt",
        subject: "Your receipt from Dugble",
        previewText: "Thanks for your payment. Receipt attached below.",
        description:
            "Sent automatically after a successful charge or invoice payment.",
        category: "receipt",
        status: "published",
        updatedAt: ago(1 * DAY),
        createdAt: ago(300 * DAY),
        sentLast30d: 3890,
        version: 6,
        htmlBody: defaultHtmlForCategory("receipt"),
    },
    {
        id: "tpl_subscription_renewed",
        name: "Subscription Renewed",
        subject: "Your subscription has renewed",
        previewText: "Your plan has renewed for another billing cycle.",
        description: "Confirms an upcoming or completed plan renewal charge.",
        category: "receipt",
        status: "published",
        updatedAt: ago(6 * DAY),
        createdAt: ago(150 * DAY),
        sentLast30d: 642,
        version: 3,
        htmlBody: defaultHtmlForCategory("receipt"),
    },
    {
        id: "tpl_suspicious_login",
        name: "Suspicious Login Alert",
        subject: "New sign-in to your account",
        previewText: "We noticed a sign-in from a new device.",
        description:
            "Triggered when a login occurs from an unrecognized device or location.",
        category: "alert",
        status: "published",
        updatedAt: ago(5 * HOUR),
        createdAt: ago(190 * DAY),
        sentLast30d: 218,
        version: 5,
        htmlBody: defaultHtmlForCategory("alert"),
    },
    {
        id: "tpl_payment_failed",
        name: "Payment Failed",
        subject: "We couldn't process your payment",
        previewText: "Your last payment didn't go through.",
        description:
            "Warns customers their card was declined and prompts them to update billing.",
        category: "alert",
        status: "published",
        updatedAt: ago(2 * DAY),
        createdAt: ago(220 * DAY),
        sentLast30d: 97,
        version: 2,
        htmlBody: defaultHtmlForCategory("alert"),
    },
    {
        id: "tpl_low_balance",
        name: "Low Balance Warning",
        subject: "Your account balance is running low",
        previewText: "Your prepaid balance is running low.",
        description:
            "Prepaid balance alert sent before usage-based sending is paused.",
        category: "alert",
        status: "draft",
        updatedAt: ago(30 * MIN),
        createdAt: ago(2 * DAY),
        sentLast30d: 0,
        version: 1,
        htmlBody: defaultHtmlForCategory("alert"),
    },
    {
        id: "tpl_weekly_digest",
        name: "Weekly Usage Digest",
        subject: "Your week in review",
        previewText: "Your usage, deliverability, and errors this week.",
        description:
            "Summarizes API usage, deliverability, and errors from the past week.",
        category: "notification",
        status: "draft",
        updatedAt: ago(12 * HOUR),
        createdAt: ago(6 * DAY),
        sentLast30d: 0,
        version: 1,
        htmlBody: defaultHtmlForCategory("notification"),
    },
    {
        id: "tpl_webhook_failing",
        name: "Webhook Delivery Failing",
        subject: "A webhook endpoint is failing",
        previewText: "One of your webhook endpoints keeps failing.",
        description:
            "Sent when an endpoint returns repeated non-2xx responses.",
        category: "notification",
        status: "published",
        updatedAt: ago(4 * DAY),
        createdAt: ago(160 * DAY),
        sentLast30d: 54,
        version: 3,
        htmlBody: defaultHtmlForCategory("notification"),
    },
    {
        id: "tpl_team_invite",
        name: "Team Invite",
        subject: "You've been invited to join a team on Dugble",
        previewText: "You've been invited to join a workspace.",
        description:
            "Sent when a workspace admin invites a new teammate by email.",
        category: "custom",
        status: "published",
        updatedAt: ago(9 * DAY),
        createdAt: ago(260 * DAY),
        sentLast30d: 312,
        version: 2,
        htmlBody: defaultHtmlForCategory("custom"),
    },
];

export function getTemplateById(id: string): EmailTemplate | undefined {
    return TEMPLATES.find((template) => template.id === id);
}

export function trendTone(
    trend: { direction: "up" | "down" | "flat"; points: number },
    polarity: "higher-is-better" | "lower-is-better",
): "positive" | "negative" | "neutral" {
    if (trend.direction === "flat") return "neutral";
    const isUp = trend.direction === "up";
    const favorable = polarity === "higher-is-better" ? isUp : !isUp;
    return favorable ? "positive" : "negative";
}

export type DomainStatus = "verified" | "pending" | "failed";

export type SendingDomain = {
    id: string;
    domain: string;
    status: DomainStatus;
};

export const SENDING_DOMAINS: SendingDomain[] = [
    { id: "domain-1", domain: "notify.dugble.com", status: "verified" },
    { id: "domain-2", domain: "receipts.dugble.com", status: "verified" },
    { id: "domain-3", domain: "updates.kessie.dev", status: "pending" },
];
