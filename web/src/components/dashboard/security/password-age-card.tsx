import { KeyRound } from "lucide-react";

import { OverviewStatCard } from "./overview-stat-card";
import { daysSince, formatDate } from "./types";

export function PasswordAgeCard({
    lastChangedAt,
    onManage,
}: {
    lastChangedAt: Date;
    onManage: () => void;
}) {
    const days = daysSince(lastChangedAt);
    const tone = days > 180 ? "danger" : days > 90 ? "pending" : "signal";

    return (
        <OverviewStatCard
            icon={KeyRound}
            tone={tone}
            value={`${days}d`}
            label="Password age"
            footerLeft={`Last changed ${formatDate(lastChangedAt)}`}
            actionLabel="Change"
            onAction={onManage}
        />
    );
}
