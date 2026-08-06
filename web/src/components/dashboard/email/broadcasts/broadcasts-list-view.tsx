"use client";

import { BroadcastsHeader } from "./broadcasts-header";
import { BroadcastsStatsGrid } from "./broadcasts-stats-grid";
import { BroadcastsTableCard } from "./broadcasts-table-card";
import { useBroadcasts } from "./broadcasts-provider";

export function BroadcastsListView() {
    const { broadcasts, duplicateBroadcast, deleteBroadcast } = useBroadcasts();
    const scheduledCount = broadcasts.filter(
        (b) => b.status === "scheduled",
    ).length;

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <BroadcastsHeader scheduledCount={scheduledCount} />

            <div className="space-y-6">
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "100ms",
                        animationFillMode: "both",
                    }}
                >
                    <BroadcastsStatsGrid broadcasts={broadcasts} />
                </div>
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "150ms",
                        animationFillMode: "both",
                    }}
                >
                    <BroadcastsTableCard
                        broadcasts={broadcasts}
                        onDuplicate={duplicateBroadcast}
                        onDelete={deleteBroadcast}
                    />
                </div>
            </div>
        </div>
    );
}
