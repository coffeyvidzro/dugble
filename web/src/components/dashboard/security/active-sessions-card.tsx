import { Laptop } from "lucide-react";

import { OverviewStatCard } from "./overview-stat-card";
import type { SecuritySession } from "./types";

export function ActiveSessionsCard({
    sessions,
    onManage,
}: {
    sessions: SecuritySession[];
    onManage: () => void;
}) {
    const otherCount = sessions.filter((s) => !s.isCurrent).length;

    return (
        <OverviewStatCard
            icon={Laptop}
            tone={otherCount > 0 ? "pending" : "neutral"}
            value={sessions.length}
            label="Active sessions"
            footerLeft={
                otherCount > 0
                    ? `${otherCount} other ${otherCount === 1 ? "device" : "devices"} signed in`
                    : "Only this device is signed in"
            }
            actionLabel="Manage"
            onAction={onManage}
        />
    );
}
