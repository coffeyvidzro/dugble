import { CheckCircle2, TriangleAlert } from "lucide-react";
import { StatCard } from "./stat-card";
import type { SmsStat, SmsStatId } from "./types";

const STAT_ICONS: Record<SmsStatId, typeof CheckCircle2> = {
  delivery_rate: CheckCircle2,
  failure_rate: TriangleAlert,
};

export function StatsGrid({ stats }: { stats: SmsStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <StatCard key={stat.id} icon={STAT_ICONS[stat.id]} stat={stat} />
      ))}
    </div>
  );
}
