// src/components/dashboard/sms/history/types.ts

import { SMS_API_STATUS_LABEL, type SmsApiStatus } from "@/types/sms-api";

// Status filter

export type HistoryStatusFilter = "all" | SmsApiStatus;

export const HISTORY_STATUS_LABEL: Record<HistoryStatusFilter, string> = {
  all: "All",
  ...SMS_API_STATUS_LABEL,
};

// "unknown" is a fallback state, not something worth surfacing as its own
// filter chip — still a valid HistoryStatusFilter value, just not listed.
export const HISTORY_STATUS_FILTERS: HistoryStatusFilter[] = [
  "all",
  "queued",
  "processing",
  "submitted",
  "sent",
  "delivered",
  "undelivered",
  "rejected",
  "failed",
  "expired",
  "canceled",
];

// Date range filter

export type HistoryDateFilter = "24h" | "7d" | "30d" | "90d" | "all";

export const HISTORY_DATE_LABEL: Record<HistoryDateFilter, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  all: "All time",
};

export const HISTORY_DATE_FILTERS: HistoryDateFilter[] = [
  "24h",
  "7d",
  "30d",
  "90d",
  "all",
];

const DATE_FILTER_WINDOW_MS: Record<HistoryDateFilter, number | null> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "90d": 90 * 24 * 60 * 60 * 1000,
  all: null,
};

/** Converts the selected date-range filter into a `start_date` for the API, or undefined for "all time". */
export function dateFilterToStartDate(
  filter: HistoryDateFilter,
): string | undefined {
  const windowMs = DATE_FILTER_WINDOW_MS[filter];
  if (windowMs === null) return undefined;
  return new Date(Date.now() - windowMs).toISOString();
}

// Pagination

export const HISTORY_PAGE_SIZE = 25;
