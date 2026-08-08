import type { SmsLogEntry, SmsStatus } from "../sms-dashboard/types";

// Status filter

export type HistoryStatusFilter = "all" | SmsStatus;

export const HISTORY_STATUS_LABEL: Record<HistoryStatusFilter, string> = {
    all: "All",
    queued: "Queued",
    sent: "Sent",
    delivered: "Delivered",
    clicked: "Clicked",
    failed: "Failed",
    undelivered: "Undelivered",
};

// Date range filter

export type HistoryDateFilter = "24h" | "7d" | "30d" | "90d" | "all";

export const HISTORY_DATE_LABEL: Record<HistoryDateFilter, string> = {
    "24h": "24h",
    "7d": "7d",
    "30d": "30d",
    "90d": "90d",
    all: "All time",
};

const DATE_FILTER_WINDOW_MS: Record<HistoryDateFilter, number | null> = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
    all: null,
};

// Combined filter state

export type HistoryFilterState = {
    search: string;
    status: HistoryStatusFilter;
    dateRange: HistoryDateFilter;
    sender: string;
};

export function matchesHistoryFilters(
    message: SmsLogEntry,
    filters: HistoryFilterState,
): boolean {
    if (filters.status !== "all" && message.status !== filters.status)
        return false;
    if (filters.sender !== "all" && message.from !== filters.sender)
        return false;

    const windowMs = DATE_FILTER_WINDOW_MS[filters.dateRange];
    if (windowMs !== null && Date.now() - message.sentAt.getTime() > windowMs)
        return false;

    const query = filters.search.trim().toLowerCase();
    if (query.length > 0) {
        const haystack = `${message.to} ${message.body}`.toLowerCase();
        if (!haystack.includes(query)) return false;
    }

    return true;
}

// Pagination

export const HISTORY_PAGE_SIZE = 25;

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
}
