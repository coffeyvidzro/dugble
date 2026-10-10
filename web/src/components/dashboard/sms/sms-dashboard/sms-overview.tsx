"use client";

import { useState } from "react";
import { ErrorState } from "@/components/dashboard/shared/data-states";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useSmsAnalytics } from "@/hooks/queries/use-sms-api";
import { countryCodeToFlag } from "../../shared/country-flag";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import { DeliveryByCountryCard } from "./delivery-by-country-card";
import { QuickstartCard } from "./quickstart-card";
import { RecentMessagesCard } from "./recent-messages-card";
import { SenderNumbersCard } from "./sender-numbers-card";
import { SmsHeader } from "./sms-header";
import { StatsGrid } from "./stats-grid";
import {
  type CountryDelivery,
  computeSmsStats,
  SMS_RANGE_DAYS,
  SMS_RANGE_LABEL,
  type SmsRange,
} from "./types";
import { WebhookHealthCard } from "./webhook-health-card";

const RANGES: SmsRange[] = ["7d", "30d", "90d"];

function SmsOverviewContent() {
  const [range, setRange] = useState<SmsRange>("30d");
  const { data: analytics, isPending, isError } = useSmsAnalytics();

  const activeWindow = analytics?.windows.find(
    (w) => w.days === SMS_RANGE_DAYS[range],
  );
  const stats = activeWindow ? computeSmsStats(activeWindow) : [];
  const deliveryRate = stats.find((s) => s.id === "delivery_rate");

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
    <div className="mx-auto w-full max-w-7xl pb-6">
      <SmsHeader
        deliveryRatePct={deliveryRate?.percentage ?? 0}
        actions={
          <DashboardRangeSelector
            ranges={RANGES}
            labels={SMS_RANGE_LABEL}
            value={range}
            onChange={setRange}
          />
        }
      />

      <div className="space-y-6">
        <div>
          {isError ? (
            <ErrorState
              title="Couldn't load SMS analytics"
              description="Try refreshing the page."
            />
          ) : isPending ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-32 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
              <div className="h-32 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
            </div>
          ) : (
            <StatsGrid stats={stats} />
          )}
        </div>

        <div>
          <RecentMessagesCard />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DeliveryByCountryCard countries={countryDelivery} />
          </div>
          <div className="lg:col-span-2">
            <WebhookHealthCard />
          </div>
        </div>

        <div>
          <SenderNumbersCard />
        </div>

        <div>
          <QuickstartCard />
        </div>
      </div>
    </div>
  );
}

export function SmsOverview() {
  return (
    <RequireActiveTeam description="Create or select a team to see your SMS overview.">
      <SmsOverviewContent />
    </RequireActiveTeam>
  );
}
