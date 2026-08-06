export type BroadcastStatus =
    | "draft"
    | "scheduled"
    | "sending"
    | "sent"
    | "paused"
    | "failed";

export const BROADCAST_STATUS_LABEL: Record<BroadcastStatus, string> = {
    draft: "Draft",
    scheduled: "Scheduled",
    sending: "Sending",
    sent: "Sent",
    paused: "Paused",
    failed: "Failed",
};

export type Audience = {
    id: string;
    name: string;
    description: string;
    recipientCount: number;
};

export type Broadcast = {
    id: string;
    subject: string;
    previewText: string;
    fromName: string;
    fromEmail: string;
    audienceId: string;
    content: string;
    status: BroadcastStatus;
    recipientCount: number;
    openRate?: number;
    clickRate?: number;
    scheduledAt?: Date;
    sentAt?: Date;
    createdAt: Date;
};

export const AUDIENCES: Audience[] = [
    {
        id: "aud-1",
        name: "All Customers",
        description: "Everyone with an active Dugble workspace",
        recipientCount: 12480,
    },
    {
        id: "aud-2",
        name: "Newsletter Subscribers",
        description: "Opted in to product updates and announcements",
        recipientCount: 8214,
    },
    {
        id: "aud-3",
        name: "Trial Users",
        description: "Currently on a free trial",
        recipientCount: 1096,
    },
    {
        id: "aud-4",
        name: "Churned Customers",
        description: "Cancelled in the last 90 days",
        recipientCount: 642,
    },
];

export function getAudience(id: string): Audience | undefined {
    return AUDIENCES.find((a) => a.id === id);
}

export function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

export function formatDateTimeFull(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

export function generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export type BroadcastsSummary = {
    recipientsReached: number;
    avgOpenRate: number;
    avgClickRate: number;
    scheduledCount: number;
};

export function summarizeBroadcasts(
    broadcasts: Broadcast[],
): BroadcastsSummary {
    const sent = broadcasts.filter((b) => b.status === "sent");

    const recipientsReached = sent.reduce(
        (sum, b) => sum + b.recipientCount,
        0,
    );

    const avgOpenRate = sent.length
        ? sent.reduce((sum, b) => sum + (b.openRate ?? 0), 0) / sent.length
        : 0;

    const avgClickRate = sent.length
        ? sent.reduce((sum, b) => sum + (b.clickRate ?? 0), 0) / sent.length
        : 0;

    const scheduledCount = broadcasts.filter(
        (b) => b.status === "scheduled",
    ).length;

    return { recipientsReached, avgOpenRate, avgClickRate, scheduledCount };
}
