import type { EmailStatus } from "../email-dashboard/types";

export type EmailDirection = "sent" | "received";

export type EmailLogEntry = {
    id: string;
    messageId: string;
    to: string;
    from: string;
    subject: string;
    status: EmailStatus;
    direction: EmailDirection;
    sentAt: Date;
};

export type StatusFilter = "all" | EmailStatus;
export type DirectionFilter = "all" | EmailDirection;
export type DateFilter = "all" | "24h" | "7d" | "30d" | "90d";

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All statuses" },
    { value: "sent", label: "Sent" },
    { value: "delivered", label: "Delivered" },
    { value: "opened", label: "Opened" },
    { value: "clicked", label: "Clicked" },
    { value: "bounced", label: "Bounced" },
    { value: "failed", label: "Failed" },
    { value: "complained", label: "Complained" },
];

export const DIRECTION_FILTER_OPTIONS: {
    value: DirectionFilter;
    label: string;
}[] = [
    { value: "all", label: "All directions" },
    { value: "sent", label: "Sent" },
    { value: "received", label: "Received" },
];

export const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
    { value: "all", label: "All time" },
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
];

export const DATE_FILTER_MS: Record<Exclude<DateFilter, "all">, number> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
};

export const EMAILS_PAGE_SIZE = 10;

export const SEND_FROM_ADDRESSES = [
    "notifications@notify.dugble.com",
    "alerts@notify.dugble.com",
    "receipts@receipts.dugble.com",
    "support@updates.kessie.dev",
];

// Deterministic demo data
function mulberry32(seed: number): () => number {
    let state = seed;
    return function random() {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function randomHexFromRand(rand: () => number, length: number): string {
    const chars = "abcdef0123456789";
    let out = "";
    for (let i = 0; i < length; i++) {
        out += chars[Math.floor(rand() * chars.length)];
    }
    return out;
}

const LOCAL_PARTS = [
    "amina.k",
    "d.owu",
    "kessie.n",
    "t.mensah",
    "s.peters",
    "hello",
    "ops",
    "billing",
    "support",
    "j.arnold",
    "m.koomson",
    "a.tawiah",
    "l.mensah",
    "k.prosper",
];

const DOMAINS = [
    "meridianpay.io",
    "west-side.com",
    "fintrack.app",
    "stack.dev",
    "kessie.co",
    "gcb-alerts.com",
    "quickledger.io",
    "vertexstudio.com",
    "driftwave.app",
    "vidzro.io",
    "james.dev",
    "bright.ai",
    "cedarforge.com",
];

const SUBJECT_TEMPLATES = [
    "Your Dugble verification code",
    "Payment receipt — Invoice #{n}",
    "Your one-time passcode: {code}",
    "Welcome to Dugble — verify your email",
    "Reset your password",
    "Weekly delivery summary",
    "Your OTP code expires in 5 minutes",
    "Your subscription receipt",
    "New sign-in from Chrome on macOS",
    "Delivery confirmation — Order #{n}",
    "Your account statement is ready",
    "Security alert: new device login",
    "Your refund has been processed",
    "Action required: verify your phone number",
    "Your weekly usage report",
];

const STATUS_POOL: EmailStatus[] = [
    "delivered",
    "delivered",
    "delivered",
    "delivered",
    "delivered",
    "opened",
    "opened",
    "opened",
    "opened",
    "clicked",
    "clicked",
    "clicked",
    "sent",
    "sent",
    "bounced",
    "failed",
    "complained",
];

const DIRECTION_POOL: EmailDirection[] = [
    "sent",
    "sent",
    "sent",
    "sent",
    "sent",
    "sent",
    "sent",
    "sent",
    "sent",
    "received",
];

export function generateEmailLog(
    count: number,
    seed: number,
    maxMinutesAgo: number = 60 * 24 * 90,
): EmailLogEntry[] {
    const rand = mulberry32(seed);
    const now = Date.now();
    const entries: EmailLogEntry[] = [];

    for (let i = 0; i < count; i++) {
        const direction =
            DIRECTION_POOL[Math.floor(rand() * DIRECTION_POOL.length)];
        const counterpartLocal =
            LOCAL_PARTS[Math.floor(rand() * LOCAL_PARTS.length)];
        const counterpartDomain = DOMAINS[Math.floor(rand() * DOMAINS.length)];
        const counterparty = `${counterpartLocal}@${counterpartDomain}`;
        const ownAddress =
            SEND_FROM_ADDRESSES[
                Math.floor(rand() * SEND_FROM_ADDRESSES.length)
            ];

        const subjectTemplate =
            SUBJECT_TEMPLATES[Math.floor(rand() * SUBJECT_TEMPLATES.length)];
        const subject = subjectTemplate
            .replace("{n}", String(1000 + Math.floor(rand() * 9000)))
            .replace("{code}", String(100000 + Math.floor(rand() * 900000)));

        const status = STATUS_POOL[Math.floor(rand() * STATUS_POOL.length)];
        const minutesAgo = Math.floor(rand() * rand() * maxMinutesAgo);

        entries.push({
            id: `log-${seed}-${i + 1}`,
            messageId: `msg_${randomHexFromRand(rand, 16)}`,
            to: direction === "sent" ? counterparty : ownAddress,
            from: direction === "sent" ? ownAddress : counterparty,
            subject,
            status,
            direction,
            sentAt: new Date(now - minutesAgo * 60 * 1000),
        });
    }

    entries.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
    return entries;
}

export function randomMessageId(): string {
    const chars = "abcdef0123456789";
    let out = "";
    for (let i = 0; i < 16; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return `msg_${out}`;
}
