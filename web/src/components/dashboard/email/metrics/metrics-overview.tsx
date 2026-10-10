"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
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
    <div className="mx-auto w-full max-w-7xl pb-6">
      <MetricsHeader deliverabilityPct={deliverability?.percentage ?? 0} />

      <div className="space-y-6">
        <div>
          <MetricsToolbar
            range={range}
            onRangeChange={setRange}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </div>

        {isError ? (
          <ErrorState
            title="Couldn't load email analytics"
            description="Try refreshing the page."
          />
        ) : isPending ||
          !activeWindow ||
          !deliverability ||
          !bounce ||
          !open ||
          !click ? (
          <LoadingBlock label="Loading analytics…" />
        ) : (
          <>
            <div>
              <DeliverabilityOverviewCard
                totalEmails={totalEmails}
                deliverabilityPct={deliverability.percentage}
                eventFilter={eventFilter}
                onEventFilterChange={setEventFilter}
                series={activeWindow.series}
              />
            </div>

            <div>
              <EngagementGrid bounce={bounce} open={open} click={click} />
            </div>

            {lastUpdated && (
              <div className="flex justify-end">
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
