import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MetricTone } from "./sparkline-chart";

const TONE_TEXT: Record<MetricTone, string> = {
    positive: "text-signal",
    negative: "text-danger",
    neutral: "text-muted-foreground",
};

export function TrendBadge({
    direction,
    points,
    tone,
    suffix = "pt",
}: {
    direction: "up" | "down" | "flat";
    points: number;
    tone: MetricTone;
    suffix?: string;
}) {
    const Icon =
        direction === "flat"
            ? Minus
            : direction === "up"
              ? TrendingUp
              : TrendingDown;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                TONE_TEXT[tone],
            )}
        >
            <Icon className="size-3" />
            {points.toFixed(1)}
            {suffix}
            {points === 1 ? "" : "s"}
        </span>
    );
}
