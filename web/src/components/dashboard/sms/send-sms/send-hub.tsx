// src/components/dashboard/sms/send-sms/send-hub.tsx

"use client";

import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useSmsAnalytics } from "@/hooks/queries/use-sms-api";
import { MessageTemplatesGrid } from "./message-templates-grid";
import { NewMessageCta } from "./new-message-cta";
import { RecentSendsList } from "./recent-sends-list";
import { SendHeader } from "./send-header";

function SendHubContent() {
  const { data: analytics } = useSmsAnalytics();
  const sevenDayWindow = analytics?.windows.find((w) => w.days === 7);
  const todayPoint = sevenDayWindow?.series[sevenDayWindow.series.length - 1];
  const sentToday = todayPoint ? todayPoint.total : null;

  return (
    <div className="mx-auto w-full max-w-6xl pb-6 animate-fade-up">
      <SendHeader sentTodayCount={sentToday} />
      <div className="space-y-6">
        <NewMessageCta />
        <MessageTemplatesGrid />
        <RecentSendsList />
      </div>
    </div>
  );
}

export function SendHub() {
  return (
    <RequireActiveTeam description="Create or select a team to send SMS.">
      <SendHubContent />
    </RequireActiveTeam>
  );
}
