"use client";

import { Gauge, KeyRound, MessagesSquare, XCircle } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEmailAnalytics } from "@/hooks/queries/use-emails-api";
import { useSmsAnalytics } from "@/hooks/queries/use-sms-api";
import { useTeamTokens } from "@/hooks/queries/use-team-tokens";
import { QuickStartCard } from "./quick-start-card";
import { RecentActivityCard } from "./recent-activity-card";

const SEVEN_DAY_WINDOW = 7;

export function DashboardOverviewClient({
  displayName,
}: {
  displayName: string;
}) {
  const { data: tokens } = useTeamTokens();
  const { data: smsAnalytics } = useSmsAnalytics();
  const { data: emailAnalytics } = useEmailAnalytics();

  const smsWindow = smsAnalytics?.windows.find(
    (w) => w.days === SEVEN_DAY_WINDOW,
  );
  const emailWindow = emailAnalytics?.windows.find(
    (w) => w.days === SEVEN_DAY_WINDOW,
  );
  const smsToday = smsWindow?.series[smsWindow.series.length - 1];
  const emailToday = emailWindow?.series[emailWindow.series.length - 1];

  const hasAnalytics = Boolean(smsToday || emailToday);
  const sentToday = (smsToday?.total ?? 0) + (emailToday?.total ?? 0);
  const deliveredToday =
    (smsToday?.delivered ?? 0) + (emailToday?.delivered ?? 0);
  const failedToday = (smsToday?.failed ?? 0) + (emailToday?.bounced ?? 0);
  const deliveryRate =
    sentToday > 0 ? ((deliveredToday / sentToday) * 100).toFixed(1) : null;

  const stats = [
    {
      label: "Messages sent today",
      value: hasAnalytics ? sentToday.toLocaleString() : "0",
      icon: MessagesSquare,
    },
    {
      label: "Delivery rate",
      value: deliveryRate ? `${deliveryRate}%` : "—",
      icon: Gauge,
    },
    {
      label: "Failed messages",
      value: hasAnalytics ? failedToday.toLocaleString() : "0",
      icon: XCircle,
    },
    {
      label: "Active API tokens",
      value: (tokens ?? [])
        .filter((token) => !token.revoked_at)
        .length.toLocaleString(),
      icon: KeyRound,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-sm">Overview</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome back, {displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Create your team, generate API keys, and send your first customer
          notification.
        </p>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat, i) => (
            <Card
              key={stat.label}
              size="sm"
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.label}</CardDescription>
                  <div className="flex size-7 items-center justify-center rounded-md border bg-background text-muted-foreground">
                    <stat.icon className="size-3.5" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Messages, delivery, and failure figures reflect the most recent day in
          your 7-day analytics window, combined across SMS and email.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr] lg:gap-6">
        <QuickStartCard />
        <RecentActivityCard />
      </div>
    </div>
  );
}
