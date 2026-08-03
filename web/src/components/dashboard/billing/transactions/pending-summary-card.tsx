import { Clock } from "lucide-react";

import { SummaryStatCard } from "./summary-stat-card";

export function PendingSummaryCard({ count }: { count: number }) {
    return (
        <SummaryStatCard
            icon={Clock}
            tone={count > 0 ? "pending" : "neutral"}
            value={count}
            label="Pending transactions"
            footer={count > 0 ? "Awaiting confirmation" : "All caught up"}
        />
    );
}
