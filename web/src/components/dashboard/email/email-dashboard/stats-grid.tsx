import { CheckCircle2, MailOpen, MousePointerClick } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type MetricTone, SparklineChart } from "../../shared/sparkline-chart";
import { TrendBadge } from "../../shared/trend-badge";
import type { MetricPolarity, RateStat } from "../metrics/types";

function trendTone(
  trend: RateStat["trend"],
  polarity: MetricPolarity,
): MetricTone {
  if (trend.direction === "flat") return "neutral";
  const isUp = trend.direction === "up";
  const favorable = polarity === "higher-is-better" ? isUp : !isUp;
  return favorable ? "positive" : "negative";
}

function StatCard({
  icon: Icon,
  label,
  stat,
  polarity,
  countLabel,
}: {
  icon: typeof CheckCircle2;
  label: string;
  stat: RateStat;
  polarity: MetricPolarity;
  countLabel: string;
}) {
  const tone = trendTone(stat.trend, polarity);

  return (
    <Card className="overflow-hidden transition-all">
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" />
          {label}
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
          {stat.count.toLocaleString()} {countLabel}
        </p>
      </div>

      <SparklineChart
        values={stat.series.map((p) => p.value)}
        tone={tone}
        className="mt-3 h-10 w-full"
      />
    </Card>
  );
}

export function StatsGrid({
  deliverability,
  open,
  click,
}: {
  deliverability: RateStat;
  open: RateStat;
  click: RateStat;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={CheckCircle2}
        label="Deliverability"
        stat={deliverability}
        polarity="higher-is-better"
        countLabel="delivered"
      />
      <StatCard
        icon={MailOpen}
        label="Open rate"
        stat={open}
        polarity="higher-is-better"
        countLabel="opens"
      />
      <StatCard
        icon={MousePointerClick}
        label="Click rate"
        stat={click}
        polarity="higher-is-better"
        countLabel="clicks"
      />
    </div>
  );
}
