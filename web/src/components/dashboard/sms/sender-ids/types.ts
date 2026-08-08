import { mulberry32 } from "../../shared/random";
import {
    SENDER_TYPE_LABEL,
    type SenderNumberType,
} from "../sms-dashboard/types";

export { SENDER_TYPE_LABEL };

// Status

export type SenderIdRequestStatus = "pending" | "approved" | "rejected";

export const SENDER_ID_STATUS_LABEL: Record<SenderIdRequestStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
};

export type SenderIdFilter = "all" | "approved" | "pending" | "rejected";

export const SENDER_ID_FILTER_LABEL: Record<SenderIdFilter, string> = {
    all: "All",
    approved: "Approved",
    pending: "Pending",
    rejected: "Rejected",
};

export function matchesSenderIdFilter(
    status: SenderIdRequestStatus,
    filter: SenderIdFilter,
): boolean {
    return filter === "all" || filter === status;
}

// Request

export type SenderIdRequest = {
    id: string;
    name: string;
    type: SenderNumberType;
    status: SenderIdRequestStatus;
    country: string;
    flag: string;
    useCase: string;
    sampleMessage: string;
    messagesSent: number;
    rejectionReason: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
};

export type SenderIdStats = {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
};

export function computeSenderIdStats(
    requests: SenderIdRequest[],
): SenderIdStats {
    return {
        total: requests.length,
        approved: requests.filter((r) => r.status === "approved").length,
        pending: requests.filter((r) => r.status === "pending").length,
        rejected: requests.filter((r) => r.status === "rejected").length,
    };
}

// Countries offered on the request form

export const SENDER_ID_COUNTRIES: {
    code: string;
    name: string;
    flag: string;
}[] = [
    { code: "GH", name: "Ghana", flag: "🇬🇭" },
    { code: "NG", name: "Nigeria", flag: "🇳🇬" },
    { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
    { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
    { code: "KE", name: "Kenya", flag: "🇰🇪" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦" },
];

// Mock pool

const REQUEST_SEED_DATA: {
    name: string;
    type: SenderNumberType;
    country: string;
    flag: string;
    useCase: string;
    sampleMessage: string;
}[] = [
    {
        name: "DUGBLE",
        type: "alphanumeric",
        country: "Ghana",
        flag: "🇬🇭",
        useCase: "Transactional alerts and OTPs for our core product.",
        sampleMessage:
            "Your Dugble verification code is 482913. It expires in 5 minutes.",
    },
    {
        name: "+254 838 555 0142",
        type: "ten_dlc",
        country: "Kenya",
        flag: "🇰🇪",
        useCase:
            "Order confirmations and shipping updates for Kenyan customers.",
        sampleMessage: "Your order #48213 has shipped and is on its way.",
    },
    {
        name: "+233 30 700 1122",
        type: "toll_free",
        country: "Ghana",
        flag: "🇬🇭",
        useCase: "Customer support follow-ups and appointment reminders.",
        sampleMessage: "Reminder: your appointment is tomorrow at 3:00 PM.",
    },
    {
        name: "22345",
        type: "short_code",
        country: "Ethiopia",
        flag: "🇪🇹",
        useCase: "High-volume marketing broadcasts for Ethiopian subscribers.",
        sampleMessage:
            "Black Friday is live — up to 40% off for 24 hours only.",
    },
    {
        name: "MYBRAND",
        type: "alphanumeric",
        country: "Nigeria",
        flag: "🇳🇬",
        useCase: "Payment receipts and account notifications.",
        sampleMessage:
            "Payment of NGN 12,000 received. Thank you for your purchase!",
    },
    {
        name: "+254 709 123 456",
        type: "ten_dlc",
        country: "Kenya",
        flag: "🇰🇪",
        useCase: "Delivery notifications for our logistics partners.",
        sampleMessage:
            "Your package is out for delivery and should arrive by 5 PM.",
    },
    {
        name: "+27 21 555 0110",
        type: "toll_free",
        country: "South Africa",
        flag: "🇿🇦",
        useCase: "Two-factor authentication codes for account logins.",
        sampleMessage:
            "Your one-time code is 719204. Do not share this with anyone.",
    },
    {
        name: "SPAMBRAND",
        type: "alphanumeric",
        country: "Nigeria",
        flag: "🇳🇬",
        useCase: "Promotional broadcasts to a purchased contact list.",
        sampleMessage:
            "FREE PRIZE!! Click now to claim your reward before it's gone!!!",
    },
    {
        name: "77345",
        type: "short_code",
        country: "Kenya",
        flag: "🇰🇪",
        useCase: "Loyalty program point balance updates.",
        sampleMessage:
            "You've earned 120 points! Your balance is now 1,540 points.",
    },
    {
        name: "DUGBLE",
        type: "alphanumeric",
        country: "Ghana",
        flag: "🇬🇭",
        useCase: "Subscription renewal reminders for Ghanaian accounts.",
        sampleMessage:
            "Hi there, your plan renews in 3 days. Reply STOP to cancel auto-renew.",
    },
    {
        name: "+233 24 987 6543",
        type: "ten_dlc",
        country: "Ghana",
        flag: "🇬🇭",
        useCase: "Appointment and booking confirmations.",
        sampleMessage: "Your booking for Aug 12 at 10:00 AM is confirmed.",
    },
    {
        name: "+233 504 555 0134",
        type: "toll_free",
        country: "Ghana",
        flag: "🇬🇭",
        useCase: "Fraud alerts for suspicious account activity.",
        sampleMessage:
            "We noticed a new sign-in from a new device. If this wasn't you, reset your password.",
    },
];

const STATUS_BY_INDEX: SenderIdRequestStatus[] = [
    "approved",
    "approved",
    "pending",
    "approved",
    "approved",
    "pending",
    "approved",
    "rejected",
    "pending",
    "approved",
    "rejected",
    "approved",
];

const REJECTION_REASONS: Record<number, string> = {
    7: "Message content and use case appear to promote unsolicited marketing without proof of consent, which violates carrier content policies.",
    10: "Submitted documentation did not match the registered business name. Please resubmit with matching business verification.",
};

const SENDER_ID_POOL_SEED = 73;

function buildSenderIdRequest(
    seed: (typeof REQUEST_SEED_DATA)[number],
    index: number,
    status: SenderIdRequestStatus,
): SenderIdRequest {
    const random = mulberry32(SENDER_ID_POOL_SEED + index);
    const submittedOffsetDays = 2 + Math.floor(random() * 90);
    const submittedAt = new Date(
        Date.now() - submittedOffsetDays * 24 * 60 * 60 * 1000,
    );
    const reviewedAt =
        status === "pending"
            ? null
            : new Date(
                  submittedAt.getTime() +
                      (1 + Math.floor(random() * 4)) * 24 * 60 * 60 * 1000,
              );
    const messagesSent =
        status === "approved" ? Math.round(500 + random() * 40000) : 0;

    return {
        id: `sid_${SENDER_ID_POOL_SEED}_${index}`,
        name: seed.name,
        type: seed.type,
        status,
        country: seed.country,
        flag: seed.flag,
        useCase: seed.useCase,
        sampleMessage: seed.sampleMessage,
        messagesSent,
        rejectionReason: REJECTION_REASONS[index] ?? null,
        submittedAt,
        reviewedAt,
    };
}

// The single source of truth for "every sender ID ever requested"
export function getSenderIdPool(): SenderIdRequest[] {
    return REQUEST_SEED_DATA.map((seed, index) =>
        buildSenderIdRequest(seed, index, STATUS_BY_INDEX[index]),
    ).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}
