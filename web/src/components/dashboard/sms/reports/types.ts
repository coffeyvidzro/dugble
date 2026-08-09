import { mulberry32 } from "../../shared/random";
import {
    getSmsStats,
    SMS_RANGE_DAYS,
    type SmsRange,
} from "../sms-dashboard/types";

export type DailyVolumePoint = {
    date: Date;
    sent: number;
    delivered: number;
    failed: number;
};

const DAILY_VOLUME_SEED = 17;

// Builds a daily sent/delivered/failed series for the given range.
export function generateDailyVolume(range: SmsRange): DailyVolumePoint[] {
    const days = SMS_RANGE_DAYS[range];
    const deliveryStat = getSmsStats(range).find(
        (stat) => stat.id === "delivery_rate",
    );
    const totalDelivered = deliveryStat?.count ?? 0;
    const deliveryRate = (deliveryStat?.percentage ?? 98) / 100;
    const totalSent =
        deliveryRate > 0
            ? Math.round(totalDelivered / deliveryRate)
            : totalDelivered;

    const random = mulberry32(DAILY_VOLUME_SEED + days);
    const weights = Array.from({ length: days }, () => 0.6 + random() * 0.8);
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

    const now = new Date();
    let runningSent = 0;

    return weights.map((weight, index) => {
        const isLast = index === weights.length - 1;
        // The last point absorbs whatever rounding remainder is left, so
        // the series always sums to exactly totalSent.
        const sent = isLast
            ? totalSent - runningSent
            : Math.round((weight / weightSum) * totalSent);
        runningSent += sent;

        const dayDeliveryRate = Math.min(
            0.999,
            Math.max(0.85, deliveryRate - 0.02 + random() * 0.04),
        );
        const delivered = Math.round(sent * dayDeliveryRate);
        const failed = sent - delivered;

        const date = new Date(
            now.getTime() - (days - 1 - index) * 24 * 60 * 60 * 1000,
        );
        return { date, sent, delivered, failed };
    });
}
