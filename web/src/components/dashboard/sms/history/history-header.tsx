"use client";

import { History, Send } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useSmsAnalytics } from "@/hooks/queries/use-sms-api";
import { cn } from "@/lib/utils";
import { PortalHeroHeader } from "../../portal-hero-header";

export function HistoryHeader() {
  const { data: analytics } = useSmsAnalytics();
  const thirtyDayWindow = analytics?.windows.find((w) => w.days === 30);
  const total = thirtyDayWindow
    ? thirtyDayWindow.series.reduce((sum, point) => sum + point.total, 0)
    : null;

  return (
    <PortalHeroHeader
      title="SMS logs"
      description="Search and review every SMS your workspace has sent."
      actions={
        <Link
          href="/dashboard/sms/send/new"
          className={cn(buttonVariants(), "gap-1.5")}
        >
          <Send className="size-4" />
          Send SMS
        </Link>
      }
      badge={
        <>
          <History className="size-3.5" />
          {total === null
            ? "Loading…"
            : `${total.toLocaleString()} in the last 30 days`}
        </>
      }
    />
  );
}
