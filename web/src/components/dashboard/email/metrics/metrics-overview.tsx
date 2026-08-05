"use client";

import { useMemo, useState } from "react";
import { DeliverabilityOverviewCard } from "./deliverability-overview-card";
import { EngagementGrid } from "./engagement-grid";
import { LastUpdatedNote } from "./last-updated-note";
import { MetricsHeader } from "./metrics-header";
import { MetricsToolbar } from "./metrics-toolbar";
import {
    computeBounceStat,
    computeClickStat,
    computeComplainStat,
    computeDeliverabilityStat,
    computeOpenStat,
    filterSeriesByDomain,
    generateMetricsSeries,
    METRICS_RANGE_DAYS,
    sumSeries,
    type EventFilter,
    type MetricsDomainFilter,
    type MetricsRange,
} from "./types";

const SERIES_SEED = 101;

export function MetricsOverview() {
    const [range, setRange] = useState<MetricsRange>("15d");
    const [domainFilter, setDomainFilter] =
        useState<MetricsDomainFilter>("all");
    const [eventFilter, setEventFilter] = useState<EventFilter>("all");
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(() => new Date());

    const daily = useMemo(() => {
        const raw = generateMetricsSeries(
            METRICS_RANGE_DAYS[range],
            SERIES_SEED,
        );
        return filterSeriesByDomain(raw, domainFilter);
    }, [range, domainFilter]);

    const deliverability = useMemo(
        () => computeDeliverabilityStat(daily),
        [daily],
    );
    const bounce = useMemo(() => computeBounceStat(daily), [daily]);
    const complain = useMemo(() => computeComplainStat(daily), [daily]);
    const open = useMemo(() => computeOpenStat(daily), [daily]);
    const click = useMemo(() => computeClickStat(daily), [daily]);
    const totalEmails = useMemo(() => sumSeries(daily, "sent"), [daily]);

    function handleRefresh() {
        if (refreshing) return;
        setRefreshing(true);
        window.setTimeout(() => {
            setLastUpdated(new Date());
            setRefreshing(false);
        }, 700);
    }

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <MetricsHeader deliverabilityPct={deliverability.percentage} />

            <div className="space-y-6">
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "100ms",
                        animationFillMode: "both",
                    }}
                >
                    <MetricsToolbar
                        domainFilter={domainFilter}
                        onDomainFilterChange={setDomainFilter}
                        range={range}
                        onRangeChange={setRange}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "150ms",
                        animationFillMode: "both",
                    }}
                >
                    <DeliverabilityOverviewCard
                        totalEmails={totalEmails}
                        deliverabilityPct={deliverability.percentage}
                        eventFilter={eventFilter}
                        onEventFilterChange={setEventFilter}
                        daily={daily}
                    />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "200ms",
                        animationFillMode: "both",
                    }}
                >
                    <EngagementGrid
                        bounce={bounce}
                        complain={complain}
                        open={open}
                        click={click}
                    />
                </div>

                <div
                    className="flex animate-fade-up justify-end"
                    style={{
                        animationDelay: "250ms",
                        animationFillMode: "both",
                    }}
                >
                    <LastUpdatedNote lastUpdated={lastUpdated} />
                </div>
            </div>
        </div>
    );
}
