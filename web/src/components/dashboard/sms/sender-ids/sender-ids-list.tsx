// src/components/dashboard/sms/sender-ids/sender-ids-list.tsx

"use client";

import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  // Filter lives in the URL (?status=…) so the view is shareable and survives reloads.
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
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">All sender IDs</CardTitle>
            <CardDescription>
              {isPending
                ? "Loading…"
                : `${filtered.length} of ${(senderIds ?? []).length} requests`}
            </CardDescription>
          </div>
          <Link
            href="/dashboard/sms/sender-ids/new"
            className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
          >
            <Plus className="size-4" />
            Request sender ID
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
            />
          </Link>
        </CardHeader>

        <div className="border-b border-border/40 px-4 py-3">
          <div className="overflow-x-auto">
            <DashboardRangeSelector
              ranges={FILTERS}
              labels={SENDER_ID_FILTER_LABEL}
              value={filter}
              onChange={setFilter}
            />
          </div>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading sender IDs…
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-danger">
            Couldn&apos;t load sender IDs. Try refreshing the page.
          </p>
        ) : (
          <SenderIdsTable
            senderIds={filtered}
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
