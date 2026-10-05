"use client";

import { History } from "lucide-react";
import Link from "next/link";
import { useSmsAnalytics } from "@/hooks/queries/use-sms-api";
import { PortalHeroHeader } from "../../portal-hero-header";

export function HistoryHeader() {
  const { data: analytics } = useSmsAnalytics();
  const thirtyDayWindow = analytics?.windows.find((w) => w.days === 30);
  const total = thirtyDayWindow
    ? thirtyDayWindow.series.reduce((sum, point) => sum + point.total, 0)
    : null;

  return (
    <PortalHeroHeader
      breadcrumb={
        <>
          <Link
            href="/dashboard/sms"
            className="transition-colors hover:text-foreground"
          >
            SMS
          </Link>
          {" > History"}
        </>
      }
      title="History"
      description="Search and review every SMS your workspace has sent."
      badge={
        <>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-signal" />
          </span>
          <History className="size-3.5" />
          {total === null
            ? "Loading…"
            : `${total.toLocaleString()} in the last 30 days`}
        </>
      }
    />
  );
}
