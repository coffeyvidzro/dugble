// src/components/dashboard/email/broadcasts/broadcasts-stats-grid.tsx

import { Clock, FileEdit, Megaphone, Send } from "lucide-react";
import type { Broadcast } from "@/types/broadcast-api";
import { BroadcastCountCard } from "./broadcast-count-card";

export function BroadcastsStatsGrid({
  broadcasts,
}: {
  broadcasts: Broadcast[];
}) {
  const sentCount = broadcasts.filter((b) => b.status === "sent").length;
  const scheduledCount = broadcasts.filter(
    (b) => b.status === "scheduled",
  ).length;
  const draftCount = broadcasts.filter((b) => b.status === "draft").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <BroadcastCountCard
        icon={Megaphone}
        label="Total broadcasts"
        value={broadcasts.length.toLocaleString("en-US")}
        footer="Across every status"
      />
      <BroadcastCountCard
        icon={Send}
        label="Sent"
        value={sentCount.toLocaleString("en-US")}
        footer="Fully delivered"
      />
      <BroadcastCountCard
        icon={Clock}
        label="Scheduled"
        value={scheduledCount.toLocaleString("en-US")}
        footer={scheduledCount > 0 ? "Upcoming sends" : "Nothing queued"}
      />
      <BroadcastCountCard
        icon={FileEdit}
        label="Drafts"
        value={draftCount.toLocaleString("en-US")}
        footer="Not yet sent"
      />
    </div>
  );
}
