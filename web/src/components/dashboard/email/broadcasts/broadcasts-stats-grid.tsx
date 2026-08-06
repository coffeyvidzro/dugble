import { CheckCircle2, Clock, MousePointerClick, Users } from "lucide-react";

import { BroadcastCountCard } from "./broadcast-count-card";
import { BroadcastStatCard } from "./broadcast-stat-card";
import { summarizeBroadcasts, type Broadcast } from "./types";

const OPEN_RATE_SPARKLINE = [41.2, 42.0, 43.5, 44.1, 45.0, 46.3];
const CLICK_RATE_SPARKLINE = [10.8, 11.2, 11.0, 11.6, 12.1, 12.4];

export function BroadcastsStatsGrid({
    broadcasts,
}: {
    broadcasts: Broadcast[];
}) {
    const summary = summarizeBroadcasts(broadcasts);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <BroadcastCountCard
                icon={Users}
                label="Recipients reached"
                value={summary.recipientsReached.toLocaleString("en-US")}
                footer="Across all sent broadcasts"
            />
            <BroadcastStatCard
                icon={CheckCircle2}
                label="Avg. open rate"
                percentage={summary.avgOpenRate}
                count={Math.round(
                    (summary.avgOpenRate / 100) * summary.recipientsReached,
                )}
                countLabel="opens"
                polarity="higher-is-better"
                trend={{ direction: "up", points: 1.8 }}
                sparkline={OPEN_RATE_SPARKLINE}
            />
            <BroadcastStatCard
                icon={MousePointerClick}
                label="Avg. click rate"
                percentage={summary.avgClickRate}
                count={Math.round(
                    (summary.avgClickRate / 100) * summary.recipientsReached,
                )}
                countLabel="clicks"
                polarity="higher-is-better"
                trend={{ direction: "up", points: 0.6 }}
                sparkline={CLICK_RATE_SPARKLINE}
            />
            <BroadcastCountCard
                icon={Clock}
                label="Scheduled"
                value={String(summary.scheduledCount)}
                footer={
                    summary.scheduledCount > 0
                        ? "Upcoming campaigns"
                        : "Nothing queued"
                }
            />
        </div>
    );
}
