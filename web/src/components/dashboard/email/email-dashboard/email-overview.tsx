"use client";

import { useMemo } from "react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useEmailAnalytics } from "@/hooks/queries/use-emails-api";
import {
  computeClickStat,
  computeDeliverabilityStat,
  computeOpenStat,
  METRICS_RANGE_DAYS,
} from "../metrics/types";
import { EmailHeader } from "./email-header";
import { RecentEmailsCard } from "./recent-emails-card";
import { SendingDomainsCard } from "./sending-domains-card";
import { StatsGrid } from "./stats-grid";

const OVERVIEW_RANGE_DAYS = METRICS_RANGE_DAYS["30d"];

function EmailOverviewContent() {
  const { data: analytics, isPending, isError } = useEmailAnalytics();

  const activeWindow = analytics?.windows.find(
    (w) => w.days === OVERVIEW_RANGE_DAYS,
  );

  const deliverability = useMemo(
    () => (activeWindow ? computeDeliverabilityStat(activeWindow) : null),
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

  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      <EmailHeader deliverabilityPct={deliverability?.percentage ?? 0} />

      <div className="space-y-6">
        <div
          className="animate-fade-up"
          style={{
            animationDelay: "100ms",
            animationFillMode: "both",
          }}
        >
          {isError ? (
            <p className="py-8 text-center text-sm text-danger">
              Couldn&apos;t load email analytics. Try refreshing the page.
            </p>
          ) : isPending || !deliverability || !open || !click ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="h-32 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
              <div className="h-32 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
              <div className="h-32 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
            </div>
          ) : (
            <StatsGrid
              deliverability={deliverability}
              open={open}
              click={click}
            />
          )}
        </div>

        <div
          className="animate-fade-up"
          style={{
            animationDelay: "200ms",
            animationFillMode: "both",
          }}
        >
          <RecentEmailsCard />
        </div>

        <div
          className="animate-fade-up"
          style={{
            animationDelay: "250ms",
            animationFillMode: "both",
          }}
        >
          <SendingDomainsCard />
        </div>
      </div>
    </div>
  );
}

export function EmailOverview() {
  return (
    <RequireActiveTeam description="Create or select a team to see your email overview.">
      <EmailOverviewContent />
    </RequireActiveTeam>
  );
}
