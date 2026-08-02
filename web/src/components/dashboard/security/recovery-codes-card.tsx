import { KeySquare } from "lucide-react";

import { OverviewStatCard } from "./overview-stat-card";

export function RecoveryCodesCard({
    enabled,
    remaining,
    total,
    onManage,
}: {
    enabled: boolean;
    remaining: number;
    total: number;
    onManage: () => void;
}) {
    return (
        <OverviewStatCard
            icon={KeySquare}
            tone={!enabled ? "neutral" : remaining <= 2 ? "pending" : "signal"}
            value={enabled ? `${remaining}/${total}` : "—"}
            label="Recovery codes"
            footerLeft={
                enabled
                    ? `${remaining} unused ${remaining === 1 ? "code" : "codes"}`
                    : "Enable 2FA to generate codes"
            }
            actionLabel={enabled ? "View" : "Set up"}
            onAction={onManage}
        />
    );
}
