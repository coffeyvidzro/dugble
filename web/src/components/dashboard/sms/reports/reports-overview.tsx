// src/components/dashboard/sms/reports/reports-overview.tsx

"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useSmsAnalytics } from "@/hooks/queries/use-sms-api";
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
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing data for the last{" "}
          <span className="font-medium text-foreground">
            {SMS_RANGE_DAYS[range]} days
          </span>
          .
        </p>
        <DashboardRangeSelector
          ranges={RANGES}
          labels={SMS_RANGE_LABEL}
          value={range}
          onChange={setRange}
        />
      </div>

      {isError ? (
        <p className="py-16 text-center text-sm text-danger">
          Couldn&apos;t load SMS analytics. Try refreshing the page.
        </p>
      ) : isPending ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading analytics…
        </div>
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
  return (
    <RequireActiveTeam description="Create or select a team to see SMS reports.">
      <ReportsOverviewContent />
    </RequireActiveTeam>
  );
}
