import { CheckCircle2, Clock, Layers, XCircle } from "lucide-react";
import { StatTile } from "../../shared/stat-tile";
import type { SenderIdStats } from "./types";

export function SenderIdStatsGrid({ stats }: { stats: SenderIdStats }) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Total Sender IDs" value={stats.total} icon={Layers} />
            <StatTile
                label="Approved"
                value={stats.approved}
                icon={CheckCircle2}
                tone="positive"
            />
            <StatTile label="Pending" value={stats.pending} icon={Clock} />
            <StatTile
                label="Rejected"
                value={stats.rejected}
                icon={XCircle}
                tone={stats.rejected > 0 ? "negative" : "default"}
            />
        </div>
    );
}
