// src/components/dashboard/sms/sms-dashboard/sms-overview.tsx

"use client";

import { useState } from "react";
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
    <div className="mx-auto w-full max-w-6xl pb-6">
      <SmsHeader deliveryRatePct={deliveryRate?.percentage ?? 0} />

      <div className="space-y-6">
        <div
          className="flex flex-wrap items-center justify-between gap-3 animate-fade-up"
          style={{
            animationDelay: "100ms",
            animationFillMode: "both",
          }}
        >
          <p className="text-sm text-muted-foreground">
            Showing stats for the last{" "}
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

        <div
          className="animate-fade-up"
          style={{
            animationDelay: "150ms",
            animationFillMode: "both",
          }}
        >
          {isError ? (
            <p className="py-8 text-center text-sm text-danger">
              Couldn&apos;t load SMS analytics. Try refreshing the page.
            </p>
          ) : isPending ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-32 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
              <div className="h-32 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
            </div>
          ) : (
            <StatsGrid stats={stats} />
          )}
        </div>

        <div
          className="animate-fade-up"
          style={{
            animationDelay: "200ms",
            animationFillMode: "both",
          }}
        >
          <RecentMessagesCard />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div
            className="animate-fade-up lg:col-span-3"
            style={{
              animationDelay: "225ms",
              animationFillMode: "both",
            }}
          >
            <DeliveryByCountryCard countries={countryDelivery} />
          </div>
          <div
            className="animate-fade-up lg:col-span-2"
            style={{
              animationDelay: "250ms",
              animationFillMode: "both",
            }}
          >
            <WebhookHealthCard />
          </div>
        </div>

        <div
          className="animate-fade-up"
          style={{
            animationDelay: "275ms",
            animationFillMode: "both",
          }}
        >
          <SenderNumbersCard />
        </div>

        <div
          className="animate-fade-up"
          style={{
            animationDelay: "300ms",
            animationFillMode: "both",
          }}
        >
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
