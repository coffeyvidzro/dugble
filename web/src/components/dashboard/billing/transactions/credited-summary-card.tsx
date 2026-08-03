import { ArrowDownLeft } from "lucide-react";

import { SummaryStatCard } from "./summary-stat-card";
import { formatCurrency } from "./types";

export function CreditedSummaryCard({ cents }: { cents: number }) {
    return (
        <SummaryStatCard
            icon={ArrowDownLeft}
            tone="signal"
            value={formatCurrency(cents)}
            label="Credited this month"
            footer="Top-ups & refunds"
        />
    );
}
