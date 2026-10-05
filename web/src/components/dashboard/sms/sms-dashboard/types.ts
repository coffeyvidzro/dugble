import type { SmsAnalyticsWindow } from "@/types/sms-api";

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

export type SmsStatId = "delivery_rate" | "failure_rate";

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

export type CountryDelivery = {
  country: string;
  flag: string;
  messages: number;
  deliveryRate: number;
};

function dailyRate(
  point: { total: number; delivered: number; failed: number },
  metric: "delivered" | "failed",
): number {
  if (point.total <= 0) return 0;
  return (point[metric] / point.total) * 100;
}

function computeTrend(
  series: SmsAnalyticsWindow["series"],
  metric: "delivered" | "failed",
): MetricTrend {
  if (series.length < 2) return { direction: "flat", points: 0 };

  const midpoint = Math.floor(series.length / 2);
  const firstHalf = series.slice(0, midpoint);
  const secondHalf = series.slice(midpoint);

  const average = (points: typeof series) =>
    points.length === 0
      ? 0
      : points.reduce((sum, point) => sum + dailyRate(point, metric), 0) /
        points.length;

  const diff = average(secondHalf) - average(firstHalf);
  if (Math.abs(diff) < 0.05) return { direction: "flat", points: 0 };
  return { direction: diff > 0 ? "up" : "down", points: Math.abs(diff) };
}

export function computeSmsStats(window: SmsAnalyticsWindow): SmsStat[] {
  const deliveryRate = window.rates.find((r) => r.name === "delivery_rate");
  const failureRate = window.rates.find((r) => r.name === "failure_rate");

  const totalDelivered = window.series.reduce(
    (sum, point) => sum + point.delivered,
    0,
  );
  const totalFailed = window.series.reduce(
    (sum, point) => sum + point.failed,
    0,
  );

  return [
    {
      id: "delivery_rate",
      label: "Delivery rate",
      percentage: (deliveryRate?.value ?? 0) * 100,
      count: totalDelivered,
      countLabel: "delivered",
      polarity: "higher-is-better",
      trend: computeTrend(window.series, "delivered"),
      sparkline: window.series.map((point) => dailyRate(point, "delivered")),
    },
    {
      id: "failure_rate",
      label: "Failure rate",
      percentage: (failureRate?.value ?? 0) * 100,
      count: totalFailed,
      countLabel: "failed",
      polarity: "lower-is-better",
      trend: computeTrend(window.series, "failed"),
      sparkline: window.series.map((point) => dailyRate(point, "failed")),
    },
  ];
}

export { formatDate, formatRelativeTime } from "@/lib/format-date";
