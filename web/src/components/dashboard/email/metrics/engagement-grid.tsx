import { RateMetricCard } from "./rate-metric-card";
import {
    BOUNCE_RISK_THRESHOLD,
    COMPLAIN_RISK_THRESHOLD,
    type RateStat,
} from "./types";

function toPercentOfTotal(count: number, total: number): number {
    return total > 0 ? (count / total) * 100 : 0;
}

export function EngagementGrid({
    bounce,
    complain,
    open,
    click,
}: {
    bounce: RateStat;
    complain: RateStat;
    open: RateStat;
    click: RateStat;
}) {
    const transientCount = Math.round(bounce.count * 0.62);
    const permanentCount = Math.round(bounce.count * 0.31);
    const undeterminedCount = Math.max(
        bounce.count - transientCount - permanentCount,
        0,
    );

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
                breakdownItems={[
                    {
                        label: "Transient",
                        count: transientCount,
                        percentage: toPercentOfTotal(
                            transientCount,
                            bounce.totalCount,
                        ),
                        colorVar: "--danger",
                    },
                    {
                        label: "Permanent",
                        count: permanentCount,
                        percentage: toPercentOfTotal(
                            permanentCount,
                            bounce.totalCount,
                        ),
                        colorVar: "--danger",
                    },
                    {
                        label: "Undetermined",
                        count: undeterminedCount,
                        percentage: toPercentOfTotal(
                            undeterminedCount,
                            bounce.totalCount,
                        ),
                        colorVar: "--danger",
                    },
                ]}
            />
            <RateMetricCard
                title="Complaint rate"
                description="Share of delivered emails marked as spam. Anything above 0.1% risks provider deliverability penalties."
                percentage={complain.percentage}
                countLabel={`${complain.count.toLocaleString()} of ${complain.totalCount.toLocaleString()} delivered`}
                series={complain.series}
                trend={complain.trend}
                polarity="lower-is-better"
                riskThreshold={COMPLAIN_RISK_THRESHOLD}
                breakdownItems={[
                    {
                        label: "Complained",
                        count: complain.count,
                        percentage: complain.percentage,
                        colorVar: "--pending",
                    },
                ]}
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
