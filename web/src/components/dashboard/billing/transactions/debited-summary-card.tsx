import { ArrowUpRight } from "lucide-react";

import { SummaryStatCard } from "./summary-stat-card";
import { formatCurrency } from "./types";

export function DebitedSummaryCard({ cents }: { cents: number }) {
    return (
        <SummaryStatCard
            icon={ArrowUpRight}
            tone="neutral"
            value={formatCurrency(cents)}
            label="Debited this month"
            footer="OTPs, alerts & receipts"
        />
    );
}
