import { HelpCircle, Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TimeSeriesPoint } from "./chart-utils";
import {
  type BreakdownItem,
  MetricsBreakdownLegend,
} from "./metrics-breakdown-legend";
import { RateMiniChart } from "./rate-mini-chart";
import type { MetricPolarity, MetricTrend } from "./types";

function trendTone(
  trend: MetricTrend,
  polarity: MetricPolarity,
): "positive" | "negative" | "neutral" {
  if (trend.direction === "flat") return "neutral";
  const isUp = trend.direction === "up";
  const favorable = polarity === "higher-is-better" ? isUp : !isUp;
  return favorable ? "positive" : "negative";
}

const TONE_TEXT_CLASS = {
  positive: "text-signal",
  negative: "text-danger",
  neutral: "text-muted-foreground",
} as const;

export function RateMetricCard({
  title,
  description,
  percentage,
  countLabel,
  series,
  trend,
  polarity,
  riskThreshold,
  breakdownItems,
}: {
  title: string;
  description: string;
  percentage: number;
  countLabel: string;
  series: TimeSeriesPoint[];
  trend: MetricTrend;
  polarity: MetricPolarity;
  riskThreshold?: number;
  breakdownItems?: BreakdownItem[];
}) {
  const tone = trendTone(trend, polarity);
  const TrendIcon =
    trend.direction === "flat"
      ? Minus
      : trend.direction === "up"
        ? TrendingUp
        : TrendingDown;

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/40 bg-muted/10 pb-4">
        <div className="flex items-center gap-1.5">
          <CardDescription className="font-mono text-[11px] uppercase tracking-widest">
            {title}
          </CardDescription>
          <Tooltip>
            <TooltipTrigger
              render={<span className="inline-flex text-muted-foreground/70" />}
            >
              <HelpCircle className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-56">
              {description}
            </TooltipContent>
          </Tooltip>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            TONE_TEXT_CLASS[tone],
          )}
        >
          <TrendIcon className="size-3" />
          {trend.points.toFixed(2)}
          pt{trend.points === 1 ? "" : "s"}
        </span>
      </CardHeader>

      <div className="px-6 pt-4">
        <CardTitle className="font-heading text-3xl font-semibold tracking-tight">
          {percentage.toFixed(2)}
          <span className="text-lg text-muted-foreground">%</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{countLabel}</p>
      </div>

      <RateMiniChart series={series} riskThreshold={riskThreshold} />

      {breakdownItems?.length ? (
        <MetricsBreakdownLegend items={breakdownItems} />
      ) : null}
    </Card>
  );
}
