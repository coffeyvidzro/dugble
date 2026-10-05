import type { SmsAnalyticsWindow } from "@/types/sms-api";

export type DailyVolumePoint = {
  date: Date;
  sent: number;
  delivered: number;
  failed: number;
};

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
