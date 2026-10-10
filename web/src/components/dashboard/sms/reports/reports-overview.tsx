"use client";

import { useState } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useSmsAnalytics } from "@/hooks/queries/use-sms-api";
import { useActiveTeamId } from "@/store/active-team-store";
import { countryCodeToFlag } from "../../shared/country-flag";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import { StatsGrid } from "../sms-dashboard/stats-grid";
import {
  type CountryDelivery,
  computeSmsStats,
  SMS_RANGE_DAYS,
  SMS_RANGE_LABEL,
  type SmsRange,
} from "../sms-dashboard/types";
import { CountryBreakdownTable } from "./country-breakdown-table";
import { ReportsHeader } from "./reports-header";
import { toDailyVolumePoints } from "./types";
import { VolumeChartCard } from "./volume-chart-card";

const RANGES: SmsRange[] = ["7d", "30d", "90d"];

function ReportsOverviewContent() {
  const [range, setRange] = useState<SmsRange>("30d");
  const { data: analytics, isPending, isError } = useSmsAnalytics();

  const activeWindow = analytics?.windows.find(
    (w) => w.days === SMS_RANGE_DAYS[range],
  );
  const stats = activeWindow ? computeSmsStats(activeWindow) : [];
  const dailyVolume = activeWindow ? toDailyVolumePoints(activeWindow) : [];

  const countryDelivery: CountryDelivery[] = (
    analytics?.delivery_by_country ?? []
  )
    .map((country) => ({
      country: country.country,
      flag: countryCodeToFlag(country.country),
      messages: country.total,
      deliveryRate:
        country.total > 0 ? (country.delivered / country.total) * 100 : 0,
    }))
    .sort((a, b) => b.messages - a.messages);

  return (
    <div className="space-y-6">
      <ReportsHeader
        actions={
          <DashboardRangeSelector
            ranges={RANGES}
            labels={SMS_RANGE_LABEL}
            value={range}
            onChange={setRange}
          />
        }
      />

      {isError ? (
        <ErrorState
          title="Couldn't load SMS analytics"
          description="Try refreshing the page."
        />
      ) : isPending ? (
        <LoadingBlock label="Loading analytics…" />
      ) : (
        <>
          <StatsGrid stats={stats} />
          <VolumeChartCard points={dailyVolume} />
          <CountryBreakdownTable countries={countryDelivery} />
        </>
      )}
    </div>
  );
}

export function ReportsOverview() {
  const activeTeamId = useActiveTeamId();
  return (
    <>
      {/* With a team, the content renders the header with its range control. */}
      {!activeTeamId && <ReportsHeader />}
      <RequireActiveTeam description="Create or select a team to see SMS reports.">
        <ReportsOverviewContent />
      </RequireActiveTeam>
    </>
  );
}
