import { Scale } from "lucide-react";

import { SummaryStatCard } from "./summary-stat-card";
import { formatCurrency } from "./types";

export function NetChangeSummaryCard({ cents }: { cents: number }) {
    const positive = cents >= 0;

    return (
        <SummaryStatCard
            icon={Scale}
            tone={positive ? "signal" : "danger"}
            value={`${positive ? "+" : "-"}${formatCurrency(Math.abs(cents))}`}
            label="Net change this month"
            footer={positive ? "Balance trending up" : "Balance trending down"}
        />
    );
}
