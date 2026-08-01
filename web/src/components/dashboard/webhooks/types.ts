import { z } from "zod";

export type WebhookStatus = "active" | "disabled";

export type WebhookEventGroupId = "domain" | "email" | "sms";

export type WebhookEventGroup = {
    id: WebhookEventGroupId;
    label: string;
    events: string[];
};

export type Webhook = {
    id: string;
    url: string;
    events: string[];
    status: WebhookStatus;
    createdAt: Date;
    maskedSecret: string;
    lastDelivery: { status: "success" | "failed"; at: Date } | null;
};

export const WEBHOOK_EVENT_GROUPS: WebhookEventGroup[] = [
    {
        id: "domain",
        label: "Domains",
        events: ["domain.created", "domain.deleted", "domain.updated"],
    },
    {
        id: "email",
        label: "Emails",
        events: [
            "email.bounced",
            "email.clicked",
            "email.complained",
            "email.delivered",
            "email.delivery_delayed",
            "email.failed",
            "email.opened",
            "email.received",
            "email.scheduled",
            "email.sent",
            "email.suppressed",
        ],
    },
    {
        id: "sms",
        label: "SMS",
        events: [
            "sms.clicked",
            "sms.delivered",
            "sms.delivery_delayed",
            "sms.failed",
            "sms.opted_out",
            "sms.received",
            "sms.scheduled",
            "sms.sent",
            "sms.undelivered",
        ],
    },
];

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

const webhookUrlSchema = z
    .string()
    .url("Enter a valid URL.")
    .refine((url) => url.startsWith("https://"), {
        message: "Endpoint URL must use https://.",
    });

export function validateWebhookUrl(url: string): string | null {
    const result = webhookUrlSchema.safeParse(url.trim());
    if (result.success) return null;
    return result.error.issues[0]?.message ?? "Enter a valid URL.";
}

function randomHex(length: number): string {
    const chars = "abcdef0123456789";
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
}

export function generateWebhookSecret(): { full: string; masked: string } {
    const body = randomHex(32);
    const full = `whsec_${body}`;
    const masked = `whsec_${body.slice(0, 4)}\u2022\u2022\u2022\u2022${body.slice(-4)}`;
    return { full, masked };
}
