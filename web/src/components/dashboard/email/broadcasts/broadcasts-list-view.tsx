// src/components/dashboard/email/broadcasts/broadcasts-list-view.tsx

"use client";

import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { useBroadcastsApi } from "@/hooks/queries/use-broadcasts-api";
import { useSegments } from "@/hooks/queries/use-segments";
import { BroadcastsHeader } from "./broadcasts-header";
import { BroadcastsStatsGrid } from "./broadcasts-stats-grid";
import { BroadcastsTableCard } from "./broadcasts-table-card";

const SKELETON_SLOTS = [0, 1, 2, 3] as const;

function BroadcastsListViewContent() {
  const {
    data: broadcasts,
    isPending,
    isError,
  } = useBroadcastsApi({
    limit: 100,
  });
  const { data: segments } = useSegments();

  const list = broadcasts ?? [];
  const scheduledCount = list.filter((b) => b.status === "scheduled").length;

  const segmentsById = useMemo(
    () => new Map((segments ?? []).map((segment) => [segment.id, segment])),
    [segments],
  );

  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      <BroadcastsHeader scheduledCount={scheduledCount} />

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
              Couldn&apos;t load broadcasts.
            </p>
          ) : isPending ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {SKELETON_SLOTS.map((slot) => (
                <div
                  key={slot}
                  className="h-24 animate-pulse rounded-xl border border-border/40 bg-muted/20"
                />
              ))}
            </div>
          ) : (
            <BroadcastsStatsGrid broadcasts={list} />
          )}
        </div>
        <div
          className="animate-fade-up"
          style={{
            animationDelay: "150ms",
            animationFillMode: "both",
          }}
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading broadcasts…
            </div>
          ) : (
            <BroadcastsTableCard
              broadcasts={list}
              segmentsById={segmentsById}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function BroadcastsListView() {
  return (
    <RequireActiveTeam description="Create or select a team to manage broadcasts.">
      <BroadcastsListViewContent />
    </RequireActiveTeam>
  );
}
