"use client";

import { ChevronRight, Info, Send } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { DashboardRangeSelector } from "@/components/dashboard/shared/dashboard-range-selector";
import { SparklineChart } from "@/components/dashboard/shared/sparkline-chart";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEmailAnalytics } from "@/hooks/queries/use-emails-api";
import { useSmsAnalytics } from "@/hooks/queries/use-sms-api";
import { useTeamTokens } from "@/hooks/queries/use-team-tokens";
import { cn } from "@/lib/utils";
import {
  combineDeliverySeries,
  type DeliveryPoint,
  OVERVIEW_RANGE_DAYS,
  OVERVIEW_RANGE_LABEL,
  type OverviewRange,
  sumDelivery,
} from "./overview/delivery-series";
import { DeliveryVolumeCard } from "./overview/delivery-volume-card";
import { WorkspaceHealthRow } from "./overview/workspace-health-row";
import { QuickStartCard } from "./quick-start-card";
import { RecentActivityCard } from "./recent-activity-card";

const RANGES: OverviewRange[] = ["today", "7d", "30d"];

function signed(value: string, n: number): string {
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${value}`;
}

function rateOf(point: DeliveryPoint | undefined): number | null {
  if (!point || point.total === 0) return null;
  return (point.delivered / point.total) * 100;
}

export function DashboardOverviewClient({
  displayName,
}: {
  displayName: string;
}) {
  const [range, setRange] = useState<OverviewRange>("today");
  const { data: tokens } = useTeamTokens();
  const smsQuery = useSmsAnalytics();
  const emailQuery = useEmailAnalytics();
  const isPending = smsQuery.isPending && emailQuery.isPending;

  const seriesFor = (days: number) =>
    combineDeliverySeries(
      smsQuery.data?.windows.find((w) => w.days === days)?.series,
      emailQuery.data?.windows.find((w) => w.days === days)?.series,
    );
  const weekSeries = seriesFor(7);
  const series =
    OVERVIEW_RANGE_DAYS[range] === 7
      ? weekSeries
      : seriesFor(OVERVIEW_RANGE_DAYS[range]);

  // "Today" is the most recent day of the 7-day window, as before.
  const isToday = range === "today";
  const current = isToday ? series[series.length - 1] : sumDelivery(series);
  const previous = isToday ? series[series.length - 2] : undefined;

  const sent = current?.total ?? 0;
  const failed = current?.failed ?? 0;
  const deliveryRate = rateOf(current);
  const activeTokens = (tokens ?? []).filter((t) => !t.revoked_at).length;
  const comparison = isToday ? "vs yesterday" : OVERVIEW_RANGE_LABEL[range];

  let sentDelta: string | null = null;
  let rateDelta: string | null = null;
  let rateDown = false;
  let failedDelta: string | null = null;
  let failedUp = false;
  if (previous) {
    if (previous.total > 0) {
      const pct = ((sent - previous.total) / previous.total) * 100;
      sentDelta = signed(`${Math.abs(pct).toFixed(1)}%`, pct);
    }
    const prevRate = rateOf(previous);
    if (deliveryRate !== null && prevRate !== null) {
      const diff = deliveryRate - prevRate;
      rateDelta = signed(`${Math.abs(diff).toFixed(1)} pts`, diff);
      rateDown = diff < 0;
    }
    const diff = failed - previous.failed;
    failedDelta = signed(Math.abs(diff).toLocaleString(), diff);
    failedUp = diff > 0;
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 space-y-1">
          <h1 className="font-heading text-2xl leading-8 font-semibold tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {displayName}. Delivery across SMS and email.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DashboardRangeSelector
            ranges={RANGES}
            labels={OVERVIEW_RANGE_LABEL}
            value={range}
            onChange={setRange}
          />
          <Link
            href="/dashboard/email/emails"
            className={buttonVariants({ variant: "outline" })}
          >
            Email logs
          </Link>
          <Link
            href="/dashboard/sms/send"
            className={cn(buttonVariants(), "gap-1.5")}
          >
            <Send className="size-4" />
            Send SMS
          </Link>
        </div>
      </div>

      <section
        aria-label="Key numbers"
        className="grid grid-cols-2 overflow-hidden rounded-xl border bg-card shadow-xs xl:grid-cols-4"
      >
        <KpiCell
          label="Messages sent"
          info="Combined across SMS and email. Today is the most recent day in your 7-day analytics window."
          isPending={isPending}
          value={sent.toLocaleString()}
          delta={sentDelta}
          deltaBad={sentDelta?.startsWith("−") ?? false}
          comparison={comparison}
          spark={weekSeries.map((p) => p.total)}
        />
        <KpiCell
          className="border-l"
          label="Delivery rate"
          isPending={isPending}
          value={
            deliveryRate === null ? (
              "—"
            ) : (
              <>
                {deliveryRate.toFixed(1)}
                <span className="text-lg text-muted-foreground">%</span>
              </>
            )
          }
          delta={rateDelta}
          deltaBad={rateDown}
          comparison={comparison}
          spark={weekSeries.map((p) =>
            p.total > 0 ? (p.delivered / p.total) * 100 : 0,
          )}
        />
        <KpiCell
          className="border-t xl:border-t-0 xl:border-l"
          label="Failed"
          isPending={isPending}
          value={
            <span className={cn(failed > 0 && "text-danger")}>
              {failed.toLocaleString()}
            </span>
          }
          delta={failedDelta}
          deltaBad={failedUp}
          comparison={comparison}
          spark={weekSeries.map((p) => p.failed)}
          sparkTone="negative"
        />
        <Link
          href="/dashboard/developers/api-tokens"
          className="group flex flex-col gap-1.5 border-t border-l px-5 py-4 transition-colors hover:bg-muted/40 xl:border-t-0"
        >
          <span className="text-[13px] text-muted-foreground">
            Active API tokens
          </span>
          <span className="font-heading text-[28px] leading-8 font-semibold tabular-nums">
            {activeTokens.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-signal">
            Manage tokens
            <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <DeliveryVolumeCard
          series={series}
          isPending={isPending}
          caption={
            range === "30d"
              ? "Last 30 days, SMS and email combined"
              : "Last 7 days, SMS and email combined"
          }
        />
        <QuickStartCard />
      </div>

      <RecentActivityCard />
      <WorkspaceHealthRow />
    </div>
  );
}

function KpiCell({
  label,
  info,
  value,
  isPending,
  delta,
  deltaBad,
  comparison,
  spark,
  sparkTone = "neutral",
  className,
}: {
  label: string;
  info?: string;
  value: ReactNode;
  isPending: boolean;
  delta: string | null;
  deltaBad: boolean;
  comparison: string;
  spark: number[];
  sparkTone?: "neutral" | "negative";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 px-5 py-4", className)}>
      <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
        {label}
        {info && (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label={`About ${label.toLowerCase()}`}
                  className="rounded text-muted-foreground/70 transition-colors hover:text-foreground"
                />
              }
            >
              <Info className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{info}</TooltipContent>
          </Tooltip>
        )}
      </span>
      {isPending ? (
        <>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-28" />
        </>
      ) : (
        <>
          <div className="flex items-end justify-between gap-3">
            <span className="font-heading text-[28px] leading-8 font-semibold tabular-nums">
              {value}
            </span>
            {spark.length > 1 && (
              <SparklineChart
                values={spark}
                tone={sparkTone}
                className="h-7 w-24 shrink-0"
              />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {delta && (
              <span
                className={cn(
                  "mr-1 font-medium",
                  deltaBad ? "text-danger" : "text-signal",
                )}
              >
                {delta}
              </span>
            )}
            {comparison}
          </span>
        </>
      )}
    </div>
  );
}
