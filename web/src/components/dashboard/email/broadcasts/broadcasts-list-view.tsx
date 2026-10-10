"use client";

import { useMemo } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
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
    <div className="mx-auto w-full max-w-7xl pb-6">
      <BroadcastsHeader scheduledCount={scheduledCount} />

      <div className="space-y-6">
        <div>
          {isError ? (
            <ErrorState title="Couldn't load broadcasts" />
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
        <div>
          {isPending ? (
            <LoadingBlock label="Loading broadcasts…" />
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
