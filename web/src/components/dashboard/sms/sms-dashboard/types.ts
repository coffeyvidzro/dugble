import { mulberry32, pick } from "../../shared/random";

export type SmsRange = "7d" | "30d" | "90d";

export const SMS_RANGE_LABEL: Record<SmsRange, string> = {
    "7d": "7d",
    "30d": "30d",
    "90d": "90d",
};

export const SMS_RANGE_DAYS: Record<SmsRange, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
};

export type MetricPolarity = "higher-is-better" | "lower-is-better";

export type MetricTrend = {
    direction: "up" | "down" | "flat";
    points: number;
};

export type SmsStatId =
    | "delivery_rate"
    | "click_rate"
    | "failed_rate"
    | "opt_out_rate";

export type SmsStat = {
    id: SmsStatId;
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

export type SmsStatus =
    | "queued"
    | "sent"
    | "delivered"
    | "clicked"
    | "failed"
    | "undelivered";

export const SMS_STATUS_LABEL: Record<SmsStatus, string> = {
    queued: "Queued",
    sent: "Sent",
    delivered: "Delivered",
    clicked: "Clicked",
    failed: "Failed",
    undelivered: "Undelivered",
};

export type SenderNumberType =
    | "toll_free"
    | "ten_dlc"
    | "short_code"
    | "alphanumeric";

export type SenderNumberStatus = "approved" | "pending" | "rejected";

export type SenderNumberCapability = "sms" | "sms_mms";

export type SenderNumber = {
    id: string;
    number: string;
    type: SenderNumberType;
    status: SenderNumberStatus;
    country: string;
    flag: string;
    capability: SenderNumberCapability;
};

export const SENDER_TYPE_LABEL: Record<SenderNumberType, string> = {
    toll_free: "Toll-Free",
    ten_dlc: "10DLC",
    short_code: "Short Code",
    alphanumeric: "Alphanumeric",
};

export type SmsLogEntry = {
    id: string;
    to: string;
    from: string;
    countryFlag: string;
    status: SmsStatus;
    body: string;
    segments: number;
    sentAt: Date;
};

export type CountryDelivery = {
    country: string;
    flag: string;
    messages: number;
    deliveryRate: number;
};

export type WebhookStatus = "active" | "failing" | "disabled";

export type WebhookHealth = {
    endpoint: string;
    status: WebhookStatus;
    successRatePct: number;
    lastEventType: string;
    lastEventAt: Date;
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

const STATS_BY_RANGE: Record<SmsRange, SmsStat[]> = {
    "7d": [
        {
            id: "delivery_rate",
            label: "Delivery rate",
            percentage: 98.9,
            count: 12480,
            countLabel: "delivered",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 0.2 },
            sparkline: [
                98.2, 98.4, 98.3, 98.5, 98.6, 98.7, 98.6, 98.8, 98.7, 98.9,
            ],
        },
        {
            id: "click_rate",
            label: "Click rate",
            percentage: 21.4,
            count: 2672,
            countLabel: "clicks",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 1.8 },
            sparkline: [
                18.1, 18.6, 19.0, 19.4, 19.8, 20.2, 20.6, 20.9, 21.1, 21.4,
            ],
        },
        {
            id: "failed_rate",
            label: "Failed rate",
            percentage: 0.6,
            count: 76,
            countLabel: "failed",
            polarity: "lower-is-better",
            trend: { direction: "down", points: 0.1 },
            sparkline: [0.9, 0.8, 0.9, 0.8, 0.7, 0.7, 0.6, 0.7, 0.6, 0.6],
        },
        {
            id: "opt_out_rate",
            label: "Opt-out rate",
            percentage: 0.15,
            count: 19,
            countLabel: "opt-outs",
            polarity: "lower-is-better",
            trend: { direction: "down", points: 0.1 },
            sparkline: [
                0.24, 0.22, 0.23, 0.2, 0.19, 0.18, 0.17, 0.16, 0.16, 0.15,
            ],
        },
    ],
    "30d": [
        {
            id: "delivery_rate",
            label: "Delivery rate",
            percentage: 98.4,
            count: 51220,
            countLabel: "delivered",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 0.1 },
            sparkline: [
                98.1, 98.2, 98.1, 98.3, 98.2, 98.4, 98.3, 98.5, 98.4, 98.4,
            ],
        },
        {
            id: "click_rate",
            label: "Click rate",
            percentage: 19.8,
            count: 10140,
            countLabel: "clicks",
            polarity: "higher-is-better",
            trend: { direction: "up", points: 0.9 },
            sparkline: [
                18.2, 18.4, 18.7, 18.9, 19.1, 19.3, 19.5, 19.6, 19.7, 19.8,
            ],
        },
        {
            id: "failed_rate",
            label: "Failed rate",
            percentage: 0.9,
            count: 462,
            countLabel: "failed",
            polarity: "lower-is-better",
            trend: { direction: "up", points: 0.2 },
            sparkline: [0.6, 0.6, 0.7, 0.7, 0.8, 0.7, 0.8, 0.9, 0.8, 0.9],
        },
        {
            id: "opt_out_rate",
            label: "Opt-out rate",
            percentage: 0.22,
            count: 113,
            countLabel: "opt-outs",
            polarity: "lower-is-better",
            trend: { direction: "up", points: 0.1 },
            sparkline: [
                0.15, 0.16, 0.17, 0.18, 0.18, 0.19, 0.2, 0.2, 0.21, 0.22,
            ],
        },
    ],
    "90d": [
        {
            id: "delivery_rate",
            label: "Delivery rate",
            percentage: 97.6,
            count: 142860,
            countLabel: "delivered",
            polarity: "higher-is-better",
            trend: { direction: "down", points: 0.3 },
            sparkline: [
                98.2, 98.0, 97.9, 98.0, 97.8, 97.7, 97.8, 97.6, 97.7, 97.6,
            ],
        },
        {
            id: "click_rate",
            label: "Click rate",
            percentage: 18.2,
            count: 25980,
            countLabel: "clicks",
            polarity: "higher-is-better",
            trend: { direction: "down", points: 0.4 },
            sparkline: [
                18.9, 18.8, 18.7, 18.6, 18.5, 18.4, 18.3, 18.3, 18.2, 18.2,
            ],
        },
        {
            id: "failed_rate",
            label: "Failed rate",
            percentage: 1.3,
            count: 1908,
            countLabel: "failed",
            polarity: "lower-is-better",
            trend: { direction: "up", points: 0.1 },
            sparkline: [1.1, 1.1, 1.2, 1.2, 1.2, 1.3, 1.2, 1.3, 1.3, 1.3],
        },
        {
            id: "opt_out_rate",
            label: "Opt-out rate",
            percentage: 0.31,
            count: 442,
            countLabel: "opt-outs",
            polarity: "lower-is-better",
            trend: { direction: "up", points: 0.1 },
            sparkline: [
                0.22, 0.23, 0.25, 0.26, 0.27, 0.28, 0.29, 0.3, 0.3, 0.31,
            ],
        },
    ],
};

export function getSmsStats(range: SmsRange): SmsStat[] {
    return STATS_BY_RANGE[range];
}

export const SENDER_NUMBERS: SenderNumber[] = [
    {
        id: "sender-1",
        number: "DUGBLE",
        type: "alphanumeric",
        status: "approved",
        country: "Ghana",
        flag: "🇬🇭",
        capability: "sms",
    },
    {
        id: "sender-2",
        number: "+254 838 555 0142",
        type: "ten_dlc",
        status: "approved",
        country: "United States",
        flag: "🇺🇸",
        capability: "sms_mms",
    },
    {
        id: "sender-3",
        number: "+233 30 700 1122",
        type: "toll_free",
        status: "pending",
        country: "Ghana",
        flag: "🇬🇭",
        capability: "sms",
    },
    {
        id: "sender-4",
        number: "22345",
        type: "short_code",
        status: "rejected",
        country: "United Kingdom",
        flag: "🇬🇧",
        capability: "sms_mms",
    },
    {
        id: "sender-5",
        number: "+254 709 123 456",
        type: "ten_dlc",
        status: "approved",
        country: "Kenya",
        flag: "🇰🇪",
        capability: "sms",
    },
];

export const WEBHOOK_HEALTH: WebhookHealth = {
    endpoint: "https://api.kessie.dev/webhooks/dugble",
    status: "active",
    successRatePct: 99.8,
    lastEventType: "message.delivered",
    lastEventAt: new Date(Date.now() - 1000 * 62),
};

export const COUNTRY_DELIVERY: CountryDelivery[] = [
    { country: "Ghana", flag: "🇬🇭", messages: 48210, deliveryRate: 99.1 },
    { country: "Nigeria", flag: "🇳🇬", messages: 31640, deliveryRate: 97.8 },
    {
        country: "Kenya",
        flag: "🇰🇪",
        messages: 18920,
        deliveryRate: 99.4,
    },
    {
        country: "Ethiopia",
        flag: "🇪🇹",
        messages: 9380,
        deliveryRate: 98.7,
    },
    { country: "Tanzania", flag: "🇹🇿", messages: 6110, deliveryRate: 96.9 },
];

const SAMPLE_NUMBERS = [
    "+233 20 123 4567",
    "+234 803 555 0192",
    "+254 415 555 0148",
    "+44 7911 123456",
    "+254 712 345678",
    "+233 24 987 6543",
    "+254 646 555 0110",
    "+233 504 555 0134",
];

const SAMPLE_FLAGS = ["🇬🇭", "🇳🇬", "🇰🇪", "🇿🇦"];

const SAMPLE_BODY_TEMPLATES = [
    "Your Dugble verification code is {code}. It expires in 5 minutes.",
    "Your order #{order} has shipped and is on its way.",
    "Payment of GHS {amount} received. Thank you!",
    "Reminder: your appointment is tomorrow at 3:00 PM.",
    "Your one-time code is {code}. Do not share this with anyone.",
    "Your account balance is now GHS {amount}.",
];

const SMS_STATUS_WEIGHTS: SmsStatus[] = [
    "delivered",
    "delivered",
    "delivered",
    "clicked",
    "sent",
    "queued",
    "failed",
    "undelivered",
];

function buildBody(template: string, random: () => number): string {
    return template
        .replace("{code}", String(100000 + Math.floor(random() * 899999)))
        .replace("{order}", String(10000 + Math.floor(random() * 89999)))
        .replace("{amount}", (random() * 500).toFixed(2));
}

export function generateSmsLog(count: number, seed: number): SmsLogEntry[] {
    const random = mulberry32(seed);
    const now = Date.now();
    const fourteenDaysMs = 1000 * 60 * 60 * 24 * 14;
    const approvedSenderNumbers = SENDER_NUMBERS.filter(
        (sender) => sender.status === "approved",
    ).map((sender) => sender.number);

    const entries: SmsLogEntry[] = Array.from({ length: count }, (_, i) => ({
        id: `sms_${seed}_${i}`,
        to: pick(SAMPLE_NUMBERS, random),
        from: pick(approvedSenderNumbers, random),
        countryFlag: pick(SAMPLE_FLAGS, random),
        status: pick(SMS_STATUS_WEIGHTS, random),
        body: buildBody(pick(SAMPLE_BODY_TEMPLATES, random), random),
        segments: 1 + Math.floor(random() * 3),
        sentAt: new Date(now - Math.floor(random() * fourteenDaysMs)),
    }));

    return entries.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
}

const MOCK_MESSAGE_POOL_SEED = 7;
const MOCK_MESSAGE_POOL_SIZE = 200;

// The single source of truth for "every message ever sent in this mock workspace".
export function getMockMessagePool(): SmsLogEntry[] {
    return generateSmsLog(MOCK_MESSAGE_POOL_SIZE, MOCK_MESSAGE_POOL_SEED);
}
