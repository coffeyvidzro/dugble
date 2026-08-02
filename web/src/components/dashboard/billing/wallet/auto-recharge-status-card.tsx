import { Zap, ZapOff } from "lucide-react";

import { OverviewStatCard } from "./overview-stat-card";
import { formatCurrency, type AutoRechargeSettings } from "./types";

export function AutoRechargeStatusCard({
    settings,
    onManage,
}: {
    settings: AutoRechargeSettings;
    onManage: () => void;
}) {
    return (
        <OverviewStatCard
            icon={settings.enabled ? Zap : ZapOff}
            tone={settings.enabled ? "signal" : "neutral"}
            value={settings.enabled ? "On" : "Off"}
            label="Auto recharge"
            footerLeft={
                settings.enabled
                    ? `Tops up ${formatCurrency(settings.rechargeAmountCents)} below ${formatCurrency(settings.thresholdCents)}`
                    : "Add funds manually each time"
            }
            actionLabel="Manage"
            onAction={onManage}
        />
    );
}
