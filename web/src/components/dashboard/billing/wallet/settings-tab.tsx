import { AlertsAndLimitsCard } from "./alerts-and-limits-card";
import { AutoRechargeCard } from "./auto-recharge-card";
import type {
    AutoRechargeSettings,
    LowBalanceAlertSettings,
    SpendingLimitSettings,
} from "./types";

export function SettingsTab({
    autoRecharge,
    onUpdateAutoRecharge,
    lowBalanceAlert,
    onUpdateLowBalanceAlert,
    spendingLimit,
    onUpdateSpendingLimit,
}: {
    autoRecharge: AutoRechargeSettings;
    onUpdateAutoRecharge: (settings: AutoRechargeSettings) => void;
    lowBalanceAlert: LowBalanceAlertSettings;
    onUpdateLowBalanceAlert: (settings: LowBalanceAlertSettings) => void;
    spendingLimit: SpendingLimitSettings;
    onUpdateSpendingLimit: (settings: SpendingLimitSettings) => void;
}) {
    return (
        <div className="space-y-6">
            <AutoRechargeCard
                settings={autoRecharge}
                onUpdate={onUpdateAutoRecharge}
            />
            <AlertsAndLimitsCard
                lowBalanceAlert={lowBalanceAlert}
                onUpdateLowBalanceAlert={onUpdateLowBalanceAlert}
                spendingLimit={spendingLimit}
                onUpdateSpendingLimit={onUpdateSpendingLimit}
            />
        </div>
    );
}
