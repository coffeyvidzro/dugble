import { mulberry32, pick } from "../../shared/random";
import { getApprovedSenders } from "../../shared/senders";

// Status

export type CampaignStatus =
    | "draft"
    | "scheduled"
    | "sending"
    | "active"
    | "paused"
    | "completed"
    | "failed"
    | "canceled";

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
    draft: "Draft",
    scheduled: "Scheduled",
    sending: "Sending",
    active: "Active",
    paused: "Paused",
    completed: "Completed",
    failed: "Failed",
    canceled: "Canceled",
};

export type CampaignFilter =
    | "all"
    | "draft"
    | "scheduled"
    | "active"
    | "completed";

export const CAMPAIGN_FILTER_LABEL: Record<CampaignFilter, string> = {
    all: "All",
    draft: "Draft",
    scheduled: "Scheduled",
    active: "Active",
    completed: "Completed",
};

const FILTER_STATUSES: Record<CampaignFilter, CampaignStatus[] | null> = {
    all: null,
    draft: ["draft"],
    scheduled: ["scheduled"],
    active: ["sending", "active", "paused"],
    completed: ["completed", "failed", "canceled"],
};

export function matchesFilter(
    status: CampaignStatus,
    filter: CampaignFilter,
): boolean {
    const statuses = FILTER_STATUSES[filter];
    return statuses === null || statuses.includes(status);
}

// Schedule. One-time or recurring

export type RecurrenceFrequency = "daily" | "weekly" | "monthly";
export type CampaignScheduleType = "one_time" | "recurring";

export type CampaignSchedule =
    | { type: "one_time"; sendAt: Date }
    | {
          type: "recurring";
          frequency: RecurrenceFrequency;
          time: string;
          daysOfWeek?: number[];
          endsAt: Date | null;
      };

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatSchedule(schedule: CampaignSchedule | null): string {
    if (!schedule) return "Not scheduled";

    if (schedule.type === "one_time") {
        return schedule.sendAt.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    const frequencyLabel =
        schedule.frequency === "daily"
            ? "Daily"
            : schedule.frequency === "monthly"
              ? "Monthly"
              : "Weekly";
    const days = schedule.daysOfWeek?.length
        ? ` · ${schedule.daysOfWeek.map((day) => DAY_LABELS[day]).join(", ")}`
        : "";

    return `${frequencyLabel}${days} at ${schedule.time}`;
}

// Audience

export type AudienceSegment = {
    id: string;
    name: string;
    description: string;
    size: number;
};

export const AUDIENCE_SEGMENTS: AudienceSegment[] = [
    {
        id: "all",
        name: "All contacts",
        description: "Everyone in your workspace",
        size: 12480,
    },
    {
        id: "ghana",
        name: "Ghana customers",
        description: "Contacts with a Ghana phone number",
        size: 5210,
    },
    {
        id: "vip",
        name: "VIP customers",
        description: "Top-tier customers",
        size: 842,
    },
    {
        id: "newsletter",
        name: "Newsletter subscribers",
        description: "Opted in to marketing updates",
        size: 3120,
    },
    {
        id: "inactive-30",
        name: "Inactive 30 days",
        description: "No activity in the last 30 days",
        size: 1930,
    },
];

export function getAudienceById(id: string): AudienceSegment | undefined {
    return AUDIENCE_SEGMENTS.find((segment) => segment.id === id);
}

// Campaign

export type CampaignStats = {
    sent: number;
    delivered: number;
    failed: number;
    clicked: number;
    optedOut: number;
};

export type Campaign = {
    id: string;
    name: string;
    status: CampaignStatus;
    message: string;
    sender: string;
    audience: AudienceSegment;
    schedule: CampaignSchedule | null;
    stats: CampaignStats;
    createdAt: Date;
    updatedAt: Date;
};

// Mock pool — deterministic, spans every status for a realistic list view.

const CAMPAIGN_SEED_DATA: {
    name: string;
    body: string;
    scheduleType: CampaignScheduleType;
}[] = [
    {
        name: "Monthly Billing Reminder",
        body: "Hi {{first_name}}, your invoice for this month is ready. Pay by the 5th to avoid a late fee.",
        scheduleType: "recurring",
    },
    {
        name: "Weekly Delivery Digest",
        body: "Hi {{first_name}}, here's what shipped this week and what's on the way.",
        scheduleType: "recurring",
    },
    {
        name: "Black Friday Flash Alert",
        body: "{{first_name}}, Black Friday is live. Up to 40% off for the next 24 hours only.",
        scheduleType: "one_time",
    },
    {
        name: "New Feature Announcement",
        body: "Hi {{first_name}}, webhooks now support delivery receipts. Check your dashboard for details.",
        scheduleType: "one_time",
    },
    {
        name: "Payment Failed Follow-up",
        body: "{{first_name}}, we couldn't process your last payment. Update your card to avoid service interruption.",
        scheduleType: "one_time",
    },
    {
        name: "Scheduled Maintenance Notice",
        body: "Heads up {{first_name}}. We're performing maintenance tonight from 1–3am GMT. Brief delays may occur.",
        scheduleType: "one_time",
    },
    {
        name: "VIP Early Access",
        body: "{{first_name}}, you're getting 24-hour early access to our new pricing tier. Enjoy!",
        scheduleType: "one_time",
    },
    {
        name: "Re-engagement Nudge",
        body: "We miss you, {{first_name}}! Come back and see what's new. Here's 10% off your next top-up.",
        scheduleType: "one_time",
    },
    {
        name: "Order Ready for Pickup",
        body: "{{first_name}}, your order #48213 is ready for pickup at our Osu branch.",
        scheduleType: "one_time",
    },
    {
        name: "Referral Program Launch",
        body: "{{first_name}}, invite a friend and you'll both get GHS 20 credit. Share your link today.",
        scheduleType: "one_time",
    },
    {
        name: "Holiday Support Hours",
        body: "{{first_name}}, our support hours are shortened this holiday season. Full details on our status page.",
        scheduleType: "one_time",
    },
    {
        name: "Subscription Renewal Reminder",
        body: "Hi {{first_name}}, your plan renews in 3 days. Reply STOP to cancel auto-renew.",
        scheduleType: "recurring",
    },
    {
        name: "Welcome Series. Day 1",
        body: "Welcome to Dugble, {{first_name}}! Here's how to send your first message in under 5 minutes.",
        scheduleType: "one_time",
    },
    {
        name: "Churn-risk Win-back",
        body: "{{first_name}}, it's been a while. Here's what you've missed and a little something to come back to.",
        scheduleType: "one_time",
    },
];

const STATUS_BY_INDEX: CampaignStatus[] = [
    "active",
    "active",
    "completed",
    "scheduled",
    "draft",
    "completed",
    "sending",
    "draft",
    "completed",
    "scheduled",
    "completed",
    "paused",
    "active",
    "failed",
];

const CAMPAIGN_POOL_SEED = 42;

function buildStats(
    status: CampaignStatus,
    audienceSize: number,
    random: () => number,
): CampaignStats {
    if (status === "draft" || status === "scheduled") {
        return { sent: 0, delivered: 0, failed: 0, clicked: 0, optedOut: 0 };
    }

    if (status === "sending") {
        const progress = 0.15 + random() * 0.5;
        const sent = Math.round(audienceSize * progress);
        const delivered = Math.round(sent * (0.94 + random() * 0.05));
        const failed = sent - delivered;
        const clicked = Math.round(delivered * (0.1 + random() * 0.15));
        const optedOut = Math.round(sent * (0.001 + random() * 0.003));
        return { sent, delivered, failed, clicked, optedOut };
    }

    if (status === "failed") {
        const sent = Math.round(audienceSize * (0.05 + random() * 0.15));
        const delivered = Math.round(sent * (0.3 + random() * 0.2));
        const failed = sent - delivered;
        const clicked = Math.round(delivered * 0.05);
        const optedOut = Math.round(sent * 0.002);
        return { sent, delivered, failed, clicked, optedOut };
    }

    // active / paused / completed — occurrences > 1 for recurring campaigns
    // that have already fired more than once.
    const occurrences =
        status === "completed" ? 1 : 3 + Math.floor(random() * 12);
    const sent = audienceSize * occurrences;
    const delivered = Math.round(sent * (0.96 + random() * 0.03));
    const failed = sent - delivered;
    const clicked = Math.round(delivered * (0.12 + random() * 0.18));
    const optedOut = Math.round(sent * (0.0008 + random() * 0.0015));
    return { sent, delivered, failed, clicked, optedOut };
}

function buildSchedule(
    scheduleType: CampaignScheduleType,
    status: CampaignStatus,
    random: () => number,
): CampaignSchedule | null {
    if (status === "draft") return null;

    if (scheduleType === "recurring") {
        const frequency = pick<RecurrenceFrequency>(
            ["daily", "weekly", "monthly"],
            random,
        );
        const hour = 8 + Math.floor(random() * 10);
        const time = `${String(hour).padStart(2, "0")}:00`;
        const daysOfWeek = frequency === "weekly" ? [1, 4] : undefined;
        return { type: "recurring", frequency, time, daysOfWeek, endsAt: null };
    }

    let offsetMs: number;
    if (status === "scheduled") {
        offsetMs = (1 + Math.floor(random() * 14)) * 24 * 60 * 60 * 1000;
    } else if (status === "sending") {
        offsetMs = -(5 + Math.floor(random() * 115)) * 60 * 1000;
    } else {
        offsetMs = -(1 + Math.floor(random() * 30)) * 24 * 60 * 60 * 1000;
    }

    return { type: "one_time", sendAt: new Date(Date.now() + offsetMs) };
}

function buildCampaign(
    seed: (typeof CAMPAIGN_SEED_DATA)[number],
    index: number,
    status: CampaignStatus,
): Campaign {
    const random = mulberry32(CAMPAIGN_POOL_SEED + index);
    const audience = AUDIENCE_SEGMENTS[index % AUDIENCE_SEGMENTS.length];
    const verifiedSenders = getApprovedSenders();
    const sender =
        verifiedSenders[index % verifiedSenders.length]?.number ?? "DUGBLE";
    const schedule = buildSchedule(seed.scheduleType, status, random);
    const stats = buildStats(status, audience.size, random);
    const createdOffsetDays = 3 + Math.floor(random() * 60);
    const createdAt = new Date(
        Date.now() - createdOffsetDays * 24 * 60 * 60 * 1000,
    );
    const updatedAt = new Date(
        createdAt.getTime() +
            Math.floor(random() * createdOffsetDays * 24 * 60 * 60 * 1000),
    );

    return {
        id: `camp_${CAMPAIGN_POOL_SEED}_${index}`,
        name: seed.name,
        status,
        message: seed.body,
        sender,
        audience,
        schedule,
        stats,
        createdAt,
        updatedAt,
    };
}

// The single source of truth for "every campaign in this mock workspace"
export function getCampaignPool(): Campaign[] {
    return CAMPAIGN_SEED_DATA.map((seed, index) =>
        buildCampaign(seed, index, STATUS_BY_INDEX[index]),
    );
}

// Reconstructs a just-created campaign from the fields the builder passed through the URL on redirect.

function buildCampaignFromCreationParams(
    id: string,
    params: Record<string, string | undefined>,
): Campaign {
    const audience =
        getAudienceById(params.audience ?? "") ?? AUDIENCE_SEGMENTS[0];
    const sender = getApprovedSenders()[0]?.number ?? "DUGBLE";
    const now = new Date();

    let schedule: CampaignSchedule | null = null;
    let status: CampaignStatus = "draft";

    if (
        params.scheduleType === "recurring" &&
        params.frequency &&
        params.time
    ) {
        schedule = {
            type: "recurring",
            frequency: params.frequency as RecurrenceFrequency,
            time: params.time,
            daysOfWeek: params.days
                ? params.days
                      .split(",")
                      .map((day) => Number(day))
                      .filter((day) => !Number.isNaN(day))
                : undefined,
            endsAt: null,
        };
        status = "active";
    } else if (params.scheduleType === "one_time" && params.sendAt) {
        const sendAt = new Date(params.sendAt);
        schedule = { type: "one_time", sendAt };
        status = sendAt.getTime() > Date.now() ? "scheduled" : "sending";
    }

    return {
        id,
        name:
            params.name && params.name.length > 0
                ? params.name
                : "Untitled campaign",
        status,
        message: params.message ?? "",
        sender,
        audience,
        schedule,
        stats: { sent: 0, delivered: 0, failed: 0, clicked: 0, optedOut: 0 },
        createdAt: now,
        updatedAt: now,
    };
}

export function resolveCampaign(
    id: string,
    params: Record<string, string | undefined>,
): { campaign: Campaign; isNew: boolean } {
    const existing = getCampaignPool().find((campaign) => campaign.id === id);
    if (existing) return { campaign: existing, isNew: false };
    return {
        campaign: buildCampaignFromCreationParams(id, params),
        isNew: true,
    };
}
