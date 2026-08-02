import { ShieldCheck, ShieldOff } from "lucide-react";

import { OverviewStatCard } from "./overview-stat-card";

export function TwoFactorStatusCard({
    enabled,
    onManage,
}: {
    enabled: boolean;
    onManage: () => void;
}) {
    return (
        <OverviewStatCard
            icon={enabled ? ShieldCheck : ShieldOff}
            tone={enabled ? "signal" : "pending"}
            value={enabled ? "Enabled" : "Disabled"}
            label="Two-factor authentication"
            footerLeft={
                enabled
                    ? "Protected via authenticator app"
                    : "Not protecting your account"
            }
            actionLabel="Manage"
            onAction={onManage}
        />
    );
}
