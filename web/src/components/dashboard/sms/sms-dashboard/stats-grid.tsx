import { CheckCircle2, MousePointerClick, TriangleAlert, UserX } from "lucide-react";
import { StatCard } from "./stat-card";
import type { SmsStat, SmsStatId } from "./types";

const STAT_ICONS: Record<SmsStatId, typeof CheckCircle2> = {
    delivery_rate: CheckCircle2,
    click_rate: MousePointerClick,
    failed_rate: TriangleAlert,
    opt_out_rate: UserX,
};

export function StatsGrid({ stats }: { stats: SmsStat[] }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <StatCard
                    key={stat.id}
                    icon={STAT_ICONS[stat.id]}
                    stat={stat}
                />
            ))}
        </div>
    );
}
