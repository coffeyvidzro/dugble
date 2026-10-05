"use client";

import { CheckCircle2, Clock, Layers, Loader2, XCircle } from "lucide-react";
import { useSenderIds } from "@/hooks/queries/use-sender-ids";
import { computeSenderIdStats } from "@/types/sender-id";
import { StatTile } from "../../shared/stat-tile";

export function SenderIdStatsGrid() {
  const { data: senderIds, isPending } = useSenderIds();

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading…
      </div>
    );
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
