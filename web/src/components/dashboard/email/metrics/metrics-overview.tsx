// src/components/dashboard/email/metrics/metrics-overview.tsx

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useEmailAnalytics } from "@/hooks/queries/use-emails-api";
import { queryKeys } from "@/lib/api/query-keys";
import { DeliverabilityOverviewCard } from "./deliverability-overview-card";
import { EngagementGrid } from "./engagement-grid";
import { LastUpdatedNote } from "./last-updated-note";
import { MetricsHeader } from "./metrics-header";
import { MetricsToolbar } from "./metrics-toolbar";
import {
  computeBounceStat,
  computeClickStat,
  computeDeliverabilityStat,
  computeOpenStat,
  type EventFilter,
  METRICS_RANGE_DAYS,
  type MetricsRange,
  sumTotal,
} from "./types";

function MetricsOverviewContent() {
  const queryClient = useQueryClient();
  const [range, setRange] = useState<MetricsRange>("30d");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data: analytics, isPending, isError } = useEmailAnalytics();

  const activeWindow = analytics?.windows.find(
    (w) => w.days === METRICS_RANGE_DAYS[range],
  );

  const deliverability = useMemo(
    () => (activeWindow ? computeDeliverabilityStat(activeWindow) : null),
    [activeWindow],
  );
  const bounce = useMemo(
    () => (activeWindow ? computeBounceStat(activeWindow) : null),
    [activeWindow],
  );
  const open = useMemo(
    () => (activeWindow ? computeOpenStat(activeWindow) : null),
    [activeWindow],
  );
  const click = useMemo(
    () => (activeWindow ? computeClickStat(activeWindow) : null),
    [activeWindow],
  );
  const totalEmails = activeWindow ? sumTotal(activeWindow) : 0;

  function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    queryClient
      .invalidateQueries({ queryKey: queryKeys.emailApi.analyticsAll() })
      .finally(() => {
        setLastUpdated(new Date());
        setRefreshing(false);
      });
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      <MetricsHeader deliverabilityPct={deliverability?.percentage ?? 0} />

      <div className="space-y-6">
        <div
          className="animate-fade-up"
          style={{
            animationDelay: "100ms",
            animationFillMode: "both",
          }}
        >
          <MetricsToolbar
            range={range}
            onRangeChange={setRange}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </div>

        {isError ? (
          <p className="py-16 text-center text-sm text-danger">
            Couldn&apos;t load email analytics. Try refreshing the page.
          </p>
        ) : isPending ||
          !activeWindow ||
          !deliverability ||
          !bounce ||
          !open ||
          !click ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading analytics…
          </div>
        ) : (
          <>
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
                series={activeWindow.series}
              />
            </div>

            <div
              className="animate-fade-up"
              style={{
                animationDelay: "200ms",
                animationFillMode: "both",
              }}
            >
              <EngagementGrid bounce={bounce} open={open} click={click} />
            </div>

            {lastUpdated && (
              <div
                className="flex animate-fade-up justify-end"
                style={{
                  animationDelay: "250ms",
                  animationFillMode: "both",
                }}
              >
                <LastUpdatedNote lastUpdated={lastUpdated} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function MetricsOverview() {
  return (
    <RequireActiveTeam description="Create or select a team to see your email metrics.">
      <MetricsOverviewContent />
    </RequireActiveTeam>
  );
}
