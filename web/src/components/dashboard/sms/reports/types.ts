// src/components/dashboard/sms/reports/types.ts

import type { SmsAnalyticsWindow } from "@/types/sms-api";

export type DailyVolumePoint = {
  date: Date;
  sent: number;
  delivered: number;
  failed: number;
};

/**
 * Maps a real analytics window's daily series onto the chart's point shape.
 * The API calls the daily count `total`; the chart calls it `sent` — same
 * value, kept as-is so VolumeChart doesn't need touching.
 */
export function toDailyVolumePoints(
  window: SmsAnalyticsWindow,
): DailyVolumePoint[] {
  return window.series.map((point) => ({
    date: new Date(point.date),
    sent: point.total,
    delivered: point.delivered,
    failed: point.failed,
  }));
}
