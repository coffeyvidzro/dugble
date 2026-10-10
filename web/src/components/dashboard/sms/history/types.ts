import { SMS_API_STATUS_LABEL, type SmsApiStatus } from "@/types/sms-api";

export type HistoryStatusFilter = "all" | SmsApiStatus;

export const HISTORY_STATUS_LABEL: Record<HistoryStatusFilter, string> = {
  all: "All",
  ...SMS_API_STATUS_LABEL,
};

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

export type HistoryDateFilter = "24h" | "7d" | "30d" | "90d" | "all";

export const HISTORY_DATE_LABEL: Record<HistoryDateFilter, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
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

export function dateFilterToStartDate(
  filter: HistoryDateFilter,
): string | undefined {
  const windowMs = DATE_FILTER_WINDOW_MS[filter];
  if (windowMs === null) return undefined;
  return new Date(Date.now() - windowMs).toISOString();
}

export const HISTORY_PAGE_SIZE = 25;
