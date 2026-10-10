export type OverviewRange = "today" | "7d" | "30d";

export const OVERVIEW_RANGE_LABEL: Record<OverviewRange, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
};

/** Analytics window each range reads; "today" is the last day of 7 days. */
export const OVERVIEW_RANGE_DAYS: Record<OverviewRange, number> = {
  today: 7,
  "7d": 7,
  "30d": 30,
};

export type DeliveryPoint = {
  date: string;
  total: number;
  delivered: number;
  failed: number;
};

type SmsPoint = {
  date: string;
  total: number;
  delivered: number;
  failed: number;
};
type EmailPoint = {
  date: string;
  total: number;
  delivered: number;
  bounced: number;
};

/**
 * Merges the SMS and email daily series by date. Email bounces count as
 * failures, matching how the overview has always combined them.
 */
export function combineDeliverySeries(
  sms: SmsPoint[] | undefined,
  email: EmailPoint[] | undefined,
): DeliveryPoint[] {
  const byDate = new Map<string, DeliveryPoint>();
  const at = (date: string) => {
    let point = byDate.get(date);
    if (!point) {
      point = { date, total: 0, delivered: 0, failed: 0 };
      byDate.set(date, point);
    }
    return point;
  };
  for (const p of sms ?? []) {
    const point = at(p.date);
    point.total += p.total;
    point.delivered += p.delivered;
    point.failed += p.failed;
  }
  for (const p of email ?? []) {
    const point = at(p.date);
    point.total += p.total;
    point.delivered += p.delivered;
    point.failed += p.bounced;
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function sumDelivery(
  series: DeliveryPoint[],
): DeliveryPoint | undefined {
  if (series.length === 0) return undefined;
  return series.reduce(
    (acc, p) => ({
      date: p.date,
      total: acc.total + p.total,
      delivered: acc.delivered + p.delivered,
      failed: acc.failed + p.failed,
    }),
    { date: "", total: 0, delivered: 0, failed: 0 },
  );
}
