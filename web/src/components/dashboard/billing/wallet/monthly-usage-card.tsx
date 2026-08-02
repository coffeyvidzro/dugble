import { TrendingUp } from "lucide-react";

import { OverviewStatCard } from "./overview-stat-card";
import { formatCurrency } from "./types";

export function MonthlyUsageCard({
    spentCents,
    onViewTransactions,
}: {
    spentCents: number;
    onViewTransactions: () => void;
}) {
    return (
        <OverviewStatCard
            icon={TrendingUp}
            tone="neutral"
            value={formatCurrency(spentCents)}
            label="Spent this month"
            footerLeft="Across OTPs, alerts & receipts"
            actionLabel="View"
            onAction={onViewTransactions}
        />
    );
}
