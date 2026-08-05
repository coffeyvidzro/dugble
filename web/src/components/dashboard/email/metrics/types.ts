import {
    EMAIL_STATUS_LABEL,
    type EmailStatus,
    type MetricTrend,
} from "../email-dashboard/types";
import type { TimeSeriesPoint } from "./chart-utils";

export type MetricsRange = "24h" | "7d" | "15d" | "30d" | "90d";

export const METRICS_RANGE_OPTIONS: { value: MetricsRange; label: string }[] = [
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "15d", label: "Last 15 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
];

export const METRICS_RANGE_DAYS: Record<MetricsRange, number> = {
    "24h": 1,
    "7d": 7,
    "15d": 15,
    "30d": 30,
    "90d": 90,
};

export const METRICS_RANGE_SHORT_LABEL: Record<MetricsRange, string> = {
    "24h": "24 hours",
    "7d": "7 days",
    "15d": "15 days",
    "30d": "30 days",
    "90d": "90 days",
};

export type MetricsDomainFilter = "all" | string;

export type EventSeriesId = EmailStatus;
export type EventFilter = "all" | EventSeriesId;

export const EVENT_FILTER_OPTIONS: { value: EventFilter; label: string }[] = [
    { value: "all", label: "All events" },
    ...(Object.keys(EMAIL_STATUS_LABEL) as EventSeriesId[]).map((id) => ({
        value: id as EventFilter,
        label: EMAIL_STATUS_LABEL[id],
    })),
];

export const EVENT_SERIES_COLOR: Record<EventSeriesId, string> = {
    sent: "--chart-3",
    delivered: "--signal",
    opened: "--chart-2",
    clicked: "--chart-1",
    bounced: "--danger",
    failed: "--destructive",
    complained: "--pending",
};

export type MetricsDailyPoint = {
    date: Date;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
    complained: number;
};

// Deterministic demo data
function mulberry32(seed: number): () => number {
    let state = seed;
    return function random() {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const BASE_DAILY_VOLUME = 640;

export function generateMetricsSeries(
    days: number,
    seed = 101,
): MetricsDailyPoint[] {
    const rand = mulberry32(seed);
    const now = new Date();
    const points: MetricsDailyPoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);

        const growth = 1 + ((days - i) / days) * 0.35;
        const weekday = date.getDay();
        const weekendDip = weekday === 0 || weekday === 6 ? 0.72 : 1;
        const noise = 0.85 + rand() * 0.3;
        const sent = Math.max(
            Math.round(BASE_DAILY_VOLUME * growth * weekendDip * noise),
            1,
        );

        const bounceRate = 0.008 + rand() * 0.02;
        const failedRate = 0.002 + rand() * 0.006;
        const bounced = Math.round(sent * bounceRate);
        const failed = Math.round(sent * failedRate);
        const delivered = Math.max(sent - bounced - failed, 0);

        const openRate = 0.34 + rand() * 0.18;
        const opened = Math.round(delivered * openRate);

        const clickRate = 0.18 + rand() * 0.14;
        const clicked = Math.round(opened * clickRate);

        const complainRate = 0.0003 + rand() * 0.0009;
        const complained = Math.round(delivered * complainRate);

        points.push({
            date,
            sent,
            delivered,
            opened,
            clicked,
            bounced,
            failed,
            complained,
        });
    }

    return points;
}

export const METRICS_DOMAIN_WEIGHTS: Record<string, number> = {
    "notify.dugble.com": 0.52,
    "receipts.dugble.com": 0.31,
    "updates.kessie.dev": 0.17,
};

export function filterSeriesByDomain(
    daily: MetricsDailyPoint[],
    domain: MetricsDomainFilter,
): MetricsDailyPoint[] {
    if (domain === "all") return daily;
    const weight = METRICS_DOMAIN_WEIGHTS[domain] ?? 1;
    return daily.map((point) => ({
        date: point.date,
        sent: Math.round(point.sent * weight),
        delivered: Math.round(point.delivered * weight),
        opened: Math.round(point.opened * weight),
        clicked: Math.round(point.clicked * weight),
        bounced: Math.round(point.bounced * weight),
        failed: Math.round(point.failed * weight),
        complained: Math.round(point.complained * weight),
    }));
}

export function sumSeries(
    daily: MetricsDailyPoint[],
    key: EventSeriesId,
): number {
    return daily.reduce((sum, point) => sum + point[key], 0);
}

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

function computeRate(
    daily: MetricsDailyPoint[],
    numerator: (point: MetricsDailyPoint) => number,
    denominator: (point: MetricsDailyPoint) => number,
): RateStat {
    const totalNum = daily.reduce((sum, p) => sum + numerator(p), 0);
    const totalDenom = daily.reduce((sum, p) => sum + denominator(p), 0);
    const percentage = totalDenom > 0 ? (totalNum / totalDenom) * 100 : 0;

    const series: TimeSeriesPoint[] = daily.map((p) => {
        const d = denominator(p);
        return { date: p.date, value: d > 0 ? (numerator(p) / d) * 100 : 0 };
    });

    const midpoint = Math.ceil(series.length / 2);
    const firstHalfAvg = average(series.slice(0, midpoint).map((s) => s.value));
    const secondHalfAvg = average(series.slice(midpoint).map((s) => s.value));
    const delta = secondHalfAvg - firstHalfAvg;
    const direction: MetricTrend["direction"] =
        Math.abs(delta) < 0.05 ? "flat" : delta > 0 ? "up" : "down";

    return {
        percentage,
        count: totalNum,
        totalCount: totalDenom,
        trend: { direction, points: Math.abs(delta) },
        series,
    };
}

export function computeDeliverabilityStat(
    daily: MetricsDailyPoint[],
): RateStat {
    return computeRate(
        daily,
        (p) => p.delivered,
        (p) => p.sent,
    );
}
export function computeBounceStat(daily: MetricsDailyPoint[]): RateStat {
    return computeRate(
        daily,
        (p) => p.bounced,
        (p) => p.sent,
    );
}
export function computeComplainStat(daily: MetricsDailyPoint[]): RateStat {
    return computeRate(
        daily,
        (p) => p.complained,
        (p) => p.delivered,
    );
}
export function computeOpenStat(daily: MetricsDailyPoint[]): RateStat {
    return computeRate(
        daily,
        (p) => p.opened,
        (p) => p.delivered,
    );
}
export function computeClickStat(daily: MetricsDailyPoint[]): RateStat {
    return computeRate(
        daily,
        (p) => p.clicked,
        (p) => p.delivered,
    );
}

export const BOUNCE_RISK_THRESHOLD = 4;
export const COMPLAIN_RISK_THRESHOLD = 0.1;
