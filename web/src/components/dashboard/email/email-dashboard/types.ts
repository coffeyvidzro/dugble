export type EmailRange = "7d" | "30d" | "90d";

export const EMAIL_RANGE_LABEL: Record<EmailRange, string> = {
    "7d": "7d",
    "30d": "30d",
    "90d": "90d",
};

export const EMAIL_RANGE_DAYS: Record<EmailRange, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
};

export type MetricPolarity = "higher-is-better" | "lower-is-better";

export type MetricTrend = {
    direction: "up" | "down" | "flat";
    points: number;
};

export type EmailStatId =
    | "deliverability"
    | "open_rate"
    | "click_rate"
    | "bounce_rate";

export type EmailStat = {
    id: EmailStatId;
    label: string;
    percentage: number;
    count: number;
    countLabel: string;
    polarity: MetricPolarity;
    trend: MetricTrend;
    sparkline: number[];
};

export function trendTone(
    trend: MetricTrend,
    polarity: MetricPolarity,
): "positive" | "negative" | "neutral" {
    if (trend.direction === "flat") return "neutral";
    const isUp = trend.direction === "up";
    const favorable = polarity === "higher-is-better" ? isUp : !isUp;
    return favorable ? "positive" : "negative";
}

export type EmailStatus =
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "bounced"
    | "failed"
    | "complained";

export const EMAIL_STATUS_LABEL: Record<EmailStatus, string> = {
    sent: "Sent",
    delivered: "Delivered",
    opened: "Opened",
    clicked: "Clicked",
    bounced: "Bounced",
    failed: "Failed",
    complained: "Complained",
};

export type RecentEmail = {
    id: string;
    to: string;
    subject: string;
    status: EmailStatus;
    sentAt: Date;
};

export type DomainStatus = "verified" | "pending" | "failed";

export type SendingDomain = {
    id: string;
    domain: string;
    status: DomainStatus;
};

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.round(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.round(diffHour / 24);
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(date);
}

const STATS_BY_RANGE: Record<EmailRange, EmailStat[]> = {
    "7d": [
        {
            id: "deliverability",
            label: "Deliverability",
            percentage: 98.6,
            count: 4812,
            countLabel: "delivered",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 0.3 },
            sparkline: [
                97.8, 98.0, 97.9, 98.1, 98.3, 98.2, 98.4, 98.5, 98.3, 98.6,
            ],
        },
        {
            id: "open_rate",
            label: "Open rate",
            percentage: 46.2,
            count: 2223,
            countLabel: "opens",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 2.1 },
            sparkline: [
                41.0, 42.4, 43.1, 42.8, 44.0, 44.6, 45.1, 45.8, 45.5, 46.2,
            ],
        },
        {
            id: "click_rate",
            label: "Click rate",
            percentage: 11.8,
            count: 568,
            countLabel: "clicks",
            polarity: "higher-is-better",
            trend: { direction: "down", points: 0.6 },
            sparkline: [
                12.9, 12.6, 12.8, 12.4, 12.2, 12.5, 12.1, 11.9, 12.0, 11.8,
            ],
        },
        {
            id: "bounce_rate",
            label: "Bounce rate",
            percentage: 1.2,
            count: 58,
            countLabel: "bounces",
            polarity: "lower-is-better",
            trend: { direction: "down", points: 0.2 },
            sparkline: [1.6, 1.5, 1.5, 1.4, 1.3, 1.4, 1.3, 1.2, 1.3, 1.2],
        },
    ],
    "30d": [
        {
            id: "deliverability",
            label: "Deliverability",
            percentage: 98.3,
            count: 19340,
            countLabel: "delivered",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 0.1 },
            sparkline: [
                98.0, 98.1, 98.2, 98.0, 98.1, 98.3, 98.2, 98.4, 98.3, 98.3,
            ],
        },
        {
            id: "open_rate",
            label: "Open rate",
            percentage: 44.8,
            count: 8664,
            countLabel: "opens",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 1.4 },
            sparkline: [
                42.1, 42.8, 43.2, 43.0, 43.6, 44.0, 44.2, 44.5, 44.6, 44.8,
            ],
        },
        {
            id: "click_rate",
            label: "Click rate",
            percentage: 12.4,
            count: 2398,
            countLabel: "clicks",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 0.8 },
            sparkline: [
                11.4, 11.6, 11.8, 11.7, 12.0, 12.1, 12.2, 12.3, 12.2, 12.4,
            ],
        },
        {
            id: "bounce_rate",
            label: "Bounce rate",
            percentage: 1.4,
            count: 276,
            countLabel: "bounces",
            polarity: "lower-is-better",
            trend: { direction: "up", points: 0.3 },
            sparkline: [1.1, 1.2, 1.1, 1.3, 1.2, 1.3, 1.4, 1.3, 1.4, 1.4],
        },
    ],
    "90d": [
        {
            id: "deliverability",
            label: "Deliverability",
            percentage: 97.9,
            count: 54220,
            countLabel: "delivered",
            polarity: "higher-is-better",
            trend: { direction: "down", points: 0.2 },
            sparkline: [
                98.2, 98.1, 98.0, 98.1, 97.9, 98.0, 97.8, 97.9, 98.0, 97.9,
            ],
        },
        {
            id: "open_rate",
            label: "Open rate",
            percentage: 43.1,
            count: 23368,
            countLabel: "opens",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 3.2 },
            sparkline: [
                39.5, 40.1, 40.8, 41.2, 41.6, 42.0, 42.4, 42.7, 42.9, 43.1,
            ],
        },
        {
            id: "click_rate",
            label: "Click rate",
            percentage: 11.1,
            count: 6018,
            countLabel: "clicks",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 1.5 },
            sparkline: [
                9.6, 9.9, 10.2, 10.4, 10.6, 10.8, 10.9, 11.0, 11.0, 11.1,
            ],
        },
        {
            id: "bounce_rate",
            label: "Bounce rate",
            percentage: 1.6,
            count: 892,
            countLabel: "bounces",
            polarity: "lower-is-better",
            trend: { direction: "down", points: 0.1 },
            sparkline: [1.8, 1.7, 1.8, 1.7, 1.6, 1.7, 1.6, 1.5, 1.6, 1.6],
        },
    ],
};

export function getEmailStats(range: EmailRange): EmailStat[] {
    return STATS_BY_RANGE[range];
}

const RECENT_EMAIL_SEED: {
    to: string;
    subject: string;
    status: EmailStatus;
    minutesAgo: number;
}[] = [
    {
        to: "coffey@vidzro.io",
        subject: "Your Dugble verification code",
        status: "opened",
        minutesAgo: 3,
    },
    {
        to: "receipts@westline.com",
        subject: "Payment receipt. Invoice #4821",
        status: "delivered",
        minutesAgo: 12,
    },
    {
        to: "p.kessie@snappx.app",
        subject: "Your one-time passcode: 738214",
        status: "clicked",
        minutesAgo: 27,
    },
    {
        to: "hello@james.dev",
        subject: "Welcome to Dugble. Verify your email",
        status: "sent",
        minutesAgo: 41,
    },
    {
        to: "janet.r@ofori-cloud.co",
        subject: "Reset your password",
        status: "delivered",
        minutesAgo: 58,
    },
    {
        to: "ops@gpha-alerts.com",
        subject: "Weekly delivery summary",
        status: "bounced",
        minutesAgo: 95,
    },
    {
        to: "t.mensah@quickledger.io",
        subject: "Your OTP code expires in 5 minutes",
        status: "delivered",
        minutesAgo: 134,
    },
    {
        to: "billing@vertexstudio.com",
        subject: "Your subscription receipt",
        status: "failed",
        minutesAgo: 182,
    },
    {
        to: "s.johnson@driftwave.app",
        subject: "New sign-in from Chrome on macOS",
        status: "opened",
        minutesAgo: 241,
    },
    {
        to: "support@parcelroute.io",
        subject: "Delivery confirmation. Order #90213",
        status: "complained",
        minutesAgo: 366,
    },
];

export function buildRecentEmails(): RecentEmail[] {
    const now = Date.now();
    return RECENT_EMAIL_SEED.map((entry, index) => ({
        id: `email-${index + 1}`,
        to: entry.to,
        subject: entry.subject,
        status: entry.status,
        sentAt: new Date(now - entry.minutesAgo * 60 * 1000),
    }));
}

export const SENDING_DOMAINS: SendingDomain[] = [
    { id: "domain-1", domain: "notify.dugble.com", status: "verified" },
    { id: "domain-2", domain: "receipts.dugble.com", status: "verified" },
    { id: "domain-3", domain: "updates.kessie.dev", status: "pending" },
];
