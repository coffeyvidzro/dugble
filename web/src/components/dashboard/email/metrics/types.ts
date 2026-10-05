// src/components/dashboard/email/metrics/types.ts

import type { EmailAnalyticsWindow } from "@/types/email-api";
import type { TimeSeriesPoint } from "./chart-utils";

// The real API only exposes fixed 7/30/90-day windows — no 24h or 15d
// window exists in GET /emails/analytics.
export type MetricsRange = "7d" | "30d" | "90d";

export const METRICS_RANGE_OPTIONS: { value: MetricsRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export const METRICS_RANGE_DAYS: Record<MetricsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const METRICS_RANGE_SHORT_LABEL: Record<MetricsRange, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

// The daily series fields the real API actually returns. "total" stands in
// for "sent" — there's no separate sent/queued breakdown, just a running
// daily total.
export type EmailSeriesId =
  | "total"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced";
export type EventFilter = "all" | EmailSeriesId;

export const EMAIL_SERIES_LABEL: Record<EmailSeriesId, string> = {
  total: "Sent",
  delivered: "Delivered",
  opened: "Opened",
  clicked: "Clicked",
  bounced: "Bounced",
};

export const EVENT_FILTER_OPTIONS: { value: EventFilter; label: string }[] = [
  { value: "all", label: "All events" },
  ...(Object.keys(EMAIL_SERIES_LABEL) as EmailSeriesId[]).map((id) => ({
    value: id as EventFilter,
    label: EMAIL_SERIES_LABEL[id],
  })),
];

export const EMAIL_SERIES_COLOR: Record<EmailSeriesId, string> = {
  total: "--chart-3",
  delivered: "--signal",
  opened: "--chart-2",
  clicked: "--chart-1",
  bounced: "--danger",
};

export type MetricPolarity = "higher-is-better" | "lower-is-better";
export type MetricTrend = { direction: "up" | "down" | "flat"; points: number };

export type RateStat = {
  percentage: number;
  count: number;
  totalCount: number;
  trend: MetricTrend;
  series: TimeSeriesPoint[];
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Derives a trend direction from the window's daily series by comparing
 * the average daily rate across the first vs second half. The API only
 * gives an aggregate rate for the whole window, not a day-by-day rate
 * series, so this — like SMS Reports' trend computation — is a client-side
 * approximation rather than a server-computed figure.
 */
function computeRate(
  series: EmailAnalyticsWindow["series"],
  numerator: (point: EmailAnalyticsWindow["series"][number]) => number,
  denominator: (point: EmailAnalyticsWindow["series"][number]) => number,
  aggregatePercentage: number,
): RateStat {
  const totalNum = series.reduce((sum, p) => sum + numerator(p), 0);
  const totalDenom = series.reduce((sum, p) => sum + denominator(p), 0);

  const points: TimeSeriesPoint[] = series.map((p) => {
    const d = denominator(p);
    return {
      date: new Date(p.date),
      value: d > 0 ? (numerator(p) / d) * 100 : 0,
    };
  });

  const midpoint = Math.ceil(points.length / 2);
  const firstHalfAvg = average(points.slice(0, midpoint).map((p) => p.value));
  const secondHalfAvg = average(points.slice(midpoint).map((p) => p.value));
  const delta = secondHalfAvg - firstHalfAvg;
  const direction: MetricTrend["direction"] =
    Math.abs(delta) < 0.05 ? "flat" : delta > 0 ? "up" : "down";

  return {
    percentage: aggregatePercentage,
    count: totalNum,
    totalCount: totalDenom,
    trend: { direction, points: Math.abs(delta) },
    series: points,
  };
}

function findRate(window: EmailAnalyticsWindow, name: string): number {
  const rate = window.rates.find((r) => r.name === name);
  return (rate?.value ?? 0) * 100;
}

export function computeDeliverabilityStat(
  window: EmailAnalyticsWindow,
): RateStat {
  return computeRate(
    window.series,
    (p) => p.delivered,
    (p) => p.total,
    findRate(window, "delivery_rate"),
  );
}

export function computeBounceStat(window: EmailAnalyticsWindow): RateStat {
  return computeRate(
    window.series,
    (p) => p.bounced,
    (p) => p.total,
    findRate(window, "bounce_rate"),
  );
}

export function computeOpenStat(window: EmailAnalyticsWindow): RateStat {
  return computeRate(
    window.series,
    (p) => p.opened,
    (p) => p.delivered,
    findRate(window, "open_rate"),
  );
}

export function computeClickStat(window: EmailAnalyticsWindow): RateStat {
  return computeRate(
    window.series,
    (p) => p.clicked,
    (p) => p.delivered,
    findRate(window, "click_rate"),
  );
}

export function sumTotal(window: EmailAnalyticsWindow): number {
  return window.series.reduce((sum, p) => sum + p.total, 0);
}

export const BOUNCE_RISK_THRESHOLD = 4;
