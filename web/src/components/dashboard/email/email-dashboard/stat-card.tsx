import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { trendTone, type EmailStat } from "./types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function buildSparklinePoints(
    values: number[],
    width: number,
    height: number,
    padding: number,
): string {
    if (values.length === 0) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX =
        values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
    return values
        .map((v, i) => {
            const x = padding + i * stepX;
            const y =
                padding + (1 - (v - min) / range) * (height - padding * 2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
}

const TONE_CLASSES = {
    positive: {
        stroke: "text-signal",
        fill: "fill-signal/10",
        badge: "text-signal",
    },
    negative: {
        stroke: "text-danger",
        fill: "fill-danger/10",
        badge: "text-danger",
    },
    neutral: {
        stroke: "text-muted-foreground",
        fill: "fill-muted-foreground/10",
        badge: "text-muted-foreground",
    },
} as const;

const WIDTH = 100;
const HEIGHT = 32;
const PADDING = 2;

export function StatCard({
    icon: Icon,
    stat,
}: {
    icon: LucideIcon;
    stat: EmailStat;
}) {
    const tone = trendTone(stat.trend, stat.polarity);
    const toneClasses = TONE_CLASSES[tone];
    const linePoints = buildSparklinePoints(
        stat.sparkline,
        WIDTH,
        HEIGHT,
        PADDING,
    );
    const areaPoints = `${PADDING},${HEIGHT - PADDING} ${linePoints} ${WIDTH - PADDING},${HEIGHT - PADDING}`;

    const TrendIcon =
        stat.trend.direction === "flat"
            ? Minus
            : stat.trend.direction === "up"
              ? TrendingUp
              : TrendingDown;

    return (
        <Card className="overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center justify-between p-4 pb-0">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Icon className="size-4" />
                    {stat.label}
                </div>
                <span
                    className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        toneClasses.badge,
                    )}
                >
                    <TrendIcon className="size-3" />
                    {stat.trend.points.toFixed(1)}
                    pt{stat.trend.points === 1 ? "" : "s"}
                </span>
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

            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="none"
                className="mt-3 h-10 w-full"
                aria-hidden="true"
            >
                <polygon points={areaPoints} className={toneClasses.fill} />
                <polyline
                    points={linePoints}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    className={toneClasses.stroke}
                />
            </svg>
        </Card>
    );
}
