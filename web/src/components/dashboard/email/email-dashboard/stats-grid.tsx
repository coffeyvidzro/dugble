import { MailCheck, MailOpen, MailX, MousePointerClick } from "lucide-react";
import { StatCard } from "./stat-card";
import type { EmailStat, EmailStatId } from "./types";

const STAT_ICONS: Record<EmailStatId, typeof MailCheck> = {
    deliverability: MailCheck,
    open_rate: MailOpen,
    click_rate: MousePointerClick,
    bounce_rate: MailX,
};

export function StatsGrid({ stats }: { stats: EmailStat[] }) {
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
