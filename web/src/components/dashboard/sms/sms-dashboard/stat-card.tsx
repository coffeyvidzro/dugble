import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SparklineChart } from "../../shared/sparkline-chart";
import { TrendBadge } from "../../shared/trend-badge";
import { trendTone, type SmsStat } from "./types";

export function StatCard({
    icon: Icon,
    stat,
}: {
    icon: LucideIcon;
    stat: SmsStat;
}) {
    const tone = trendTone(stat.trend, stat.polarity);

    return (
        <Card className="overflow-hidden border-border/40 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Icon className="size-4" />
                    {stat.label}
                </div>
                <TrendBadge
                    direction={stat.trend.direction}
                    points={stat.trend.points}
                    tone={tone}
                />
            </div>

            <div className="px-4 pt-2">
                <p className="font-heading text-3xl font-semibold tracking-tight text-foreground">
                    {stat.percentage.toFixed(1)}
                    <span className="text-lg text-muted-foreground">%</span>
                </p>
                <p className="text-xs text-muted-foreground">
                    {stat.count.toLocaleString()} {stat.countLabel}
                </p>
            </div>

            <SparklineChart
                values={stat.sparkline}
                tone={tone}
                className="mt-3 h-10 w-full"
            />
        </Card>
    );
}
