import { RateMetricCard } from "./rate-metric-card";
import { BOUNCE_RISK_THRESHOLD, type RateStat } from "./types";

export function EngagementGrid({
  bounce,
  open,
  click,
}: {
  bounce: RateStat;
  open: RateStat;
  click: RateStat;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <RateMetricCard
        title="Bounce rate"
        description="Share of sent emails that bounced. Sustained rates above 4% put your sending reputation at risk."
        percentage={bounce.percentage}
        countLabel={`${bounce.count.toLocaleString()} of ${bounce.totalCount.toLocaleString()} sent`}
        series={bounce.series}
        trend={bounce.trend}
        polarity="lower-is-better"
        riskThreshold={BOUNCE_RISK_THRESHOLD}
      />
      <RateMetricCard
        title="Open rate"
        description="Share of delivered emails that were opened at least once."
        percentage={open.percentage}
        countLabel={`${open.count.toLocaleString()} of ${open.totalCount.toLocaleString()} delivered`}
        series={open.series}
        trend={open.trend}
        polarity="higher-is-better"
        breakdownItems={[
          {
            label: "Opened",
            count: open.count,
            percentage: open.percentage,
            colorVar: "--signal",
          },
        ]}
      />
      <RateMetricCard
        title="Click rate"
        description="Share of delivered emails with at least one link click."
        percentage={click.percentage}
        countLabel={`${click.count.toLocaleString()} of ${click.totalCount.toLocaleString()} delivered`}
        series={click.series}
        trend={click.trend}
        polarity="higher-is-better"
        breakdownItems={[
          {
            label: "Clicked",
            count: click.count,
            percentage: click.percentage,
            colorVar: "--chart-1",
          },
        ]}
      />
    </div>
  );
}
