"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { Card } from "@/components/ui/card";
import { useSenderIds } from "@/hooks/queries/use-sender-ids";
import {
  matchesSenderIdFilter,
  SENDER_ID_FILTER_LABEL,
  type SenderId,
  type SenderIdFilter,
} from "@/types/sender-id";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import { SenderIdDetailSheet } from "./sender-id-detail-sheet";
import { SenderIdsTable } from "./sender-ids-table";

const FILTERS: SenderIdFilter[] = ["all", "approved", "pending", "rejected"];

function SenderIdsListContent() {
  const [filter, setFilter] = useQueryState(
    "status",
    parseAsStringLiteral(FILTERS).withDefault("all").withOptions({
      history: "replace",
    }),
  );
  const [selectedSenderId, setSelectedSenderId] = useState<SenderId | null>(
    null,
  );

  const { data: senderIds, isPending, isError } = useSenderIds();

  const filtered = useMemo(
    () =>
      (senderIds ?? []).filter((senderId) =>
        matchesSenderIdFilter(senderId.status, filter),
      ),
    [senderIds, filter],
  );

  return (
    <>
      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="max-w-full overflow-x-auto">
            <DashboardRangeSelector
              ranges={FILTERS}
              labels={SENDER_ID_FILTER_LABEL}
              value={filter}
              onChange={setFilter}
            />
          </div>
          {!isPending && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {(senderIds ?? []).length}{" "}
              {(senderIds ?? []).length === 1 ? "sender ID" : "sender IDs"}
            </span>
          )}
        </div>

        {isPending ? (
          <LoadingBlock label="Loading sender IDs…" />
        ) : isError ? (
          <ErrorState
            title="Couldn't load sender IDs"
            description="Try refreshing the page."
          />
        ) : (
          <SenderIdsTable
            senderIds={filtered}
            filterLabel={
              filter === "all"
                ? null
                : SENDER_ID_FILTER_LABEL[filter].toLowerCase()
            }
            onViewSenderId={setSelectedSenderId}
            onDeleteSenderId={setSelectedSenderId}
          />
        )}
      </Card>

      <SenderIdDetailSheet
        senderId={selectedSenderId}
        open={selectedSenderId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSenderId(null);
        }}
      />
    </>
  );
}

export function SenderIdsList() {
  return (
    <RequireActiveTeam description="Create or select a team to manage sender IDs.">
      <SenderIdsListContent />
    </RequireActiveTeam>
  );
}
