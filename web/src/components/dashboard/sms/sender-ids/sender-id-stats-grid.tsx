"use client";

import { CheckCircle2, Clock, Layers, XCircle } from "lucide-react";
import { LoadingBlock } from "@/components/dashboard/shared/data-states";
import { useSenderIds } from "@/hooks/queries/use-sender-ids";
import { computeSenderIdStats } from "@/types/sender-id";
import { StatTile } from "../../shared/stat-tile";

export function SenderIdStatsGrid() {
  const { data: senderIds, isPending } = useSenderIds();

  if (isPending) {
    return <LoadingBlock label="Loading…" />;
  }

  const stats = computeSenderIdStats(senderIds ?? []);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatTile label="Total Sender IDs" value={stats.total} icon={Layers} />
      <StatTile
        label="Approved"
        value={stats.approved}
        icon={CheckCircle2}
        tone="positive"
      />
      <StatTile label="Pending" value={stats.pending} icon={Clock} />
      <StatTile
        label="Rejected"
        value={stats.rejected}
        icon={XCircle}
        tone={stats.rejected > 0 ? "negative" : "default"}
      />
    </div>
  );
}
