import { Check, MousePointerClick, Send, UserX, XCircle } from "lucide-react";
import { StatTile } from "../../shared/stat-tile";
import type { CampaignStats } from "./types";

export function CampaignStatsGrid({ stats }: { stats: CampaignStats }) {
    const deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile label="Sent" value={stats.sent} icon={Send} />
            <StatTile
                label="Delivered"
                value={stats.delivered}
                icon={Check}
                sublabel={`${deliveryRate.toFixed(1)}%`}
            />
            <StatTile label="Failed" value={stats.failed} icon={XCircle} />
            <StatTile label="Clicked" value={stats.clicked} icon={MousePointerClick} />
            <StatTile label="Opted out" value={stats.optedOut} icon={UserX} />
        </div>
    );
}
