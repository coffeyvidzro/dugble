// src/components/dashboard/sms/history/history-overview.tsx

"use client";

import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useMemo, useState } from "react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApprovedSenderIds } from "@/hooks/queries/use-approved-sender-ids";
import { useSmsMessages } from "@/hooks/queries/use-sms-api";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { ExportHistoryCsvButton } from "./export-history-csv-button";
import { HistoryFilters } from "./history-filters";
import { HistoryPagination } from "./history-pagination";
import { HistoryTable } from "./history-table";
import {
  dateFilterToStartDate,
  HISTORY_DATE_FILTERS,
  HISTORY_PAGE_SIZE,
  HISTORY_STATUS_FILTERS,
} from "./types";

const SEARCH_DEBOUNCE_MS = 300;

/** Filters and page live in the URL: shareable, back-button friendly, no sync effects. */
const historySearchParams = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(HISTORY_STATUS_FILTERS).withDefault("all"),
  range: parseAsStringLiteral(HISTORY_DATE_FILTERS).withDefault("30d"),
  sender: parseAsString.withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

function HistoryOverviewContent() {
  const [filters, setFilters] = useQueryStates(historySearchParams, {
    history: "replace",
  });
  const { q: search, status, range: dateRange, sender } = filters;
  const page = Math.max(1, filters.page);

  // The input is local so typing stays instant; the URL (and therefore the
  // request) updates once typing pauses. Every filter change resets paging
  // in the same update — no follow-up effect needed.
  const [searchInput, setSearchInput] = useState(search);
  const commitSearch = useDebouncedCallback((value: string) => {
    void setFilters({ q: value || null, page: null });
  }, SEARCH_DEBOUNCE_MS);

  const { data: approvedSenderIds } = useApprovedSenderIds();
  const senderOptions = useMemo(
    () => approvedSenderIds.map((senderId) => senderId.name),
    [approvedSenderIds],
  );

  const params = useMemo(
    () => ({
      limit: HISTORY_PAGE_SIZE,
      offset: (page - 1) * HISTORY_PAGE_SIZE,
      status: status === "all" ? undefined : status,
      sender: sender === "all" ? undefined : sender,
      start_date: dateFilterToStartDate(dateRange),
      search: search.trim().length > 0 ? search.trim() : undefined,
    }),
    [page, status, sender, dateRange, search],
  );

  const { data: messages, isPending, isError } = useSmsMessages(params);

  const pageItems = messages ?? [];
  const hasNextPage = pageItems.length === HISTORY_PAGE_SIZE;

  return (
    <Card className="border-border/40 shadow-sm animate-fade-up">
      <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl">Message history</CardTitle>
          <CardDescription>
            {isPending
              ? "Loading…"
              : `Showing ${pageItems.length} result${pageItems.length === 1 ? "" : "s"}`}
          </CardDescription>
        </div>
        <ExportHistoryCsvButton messages={pageItems} />
      </CardHeader>

      <div className="border-b border-border/40 p-4">
        <HistoryFilters
          search={searchInput}
          onSearchChange={(value) => {
            setSearchInput(value);
            commitSearch(value.trim());
          }}
          status={status}
          onStatusChange={(value) =>
            void setFilters({ status: value, page: null })
          }
          dateRange={dateRange}
          onDateRangeChange={(value) =>
            void setFilters({ range: value, page: null })
          }
          sender={sender}
          onSenderChange={(value) =>
            void setFilters({ sender: value, page: null })
          }
          senderOptions={senderOptions}
        />
      </div>

      {isError ? (
        <p className="py-16 text-center text-sm text-danger">
          Couldn&apos;t load message history. Try refreshing the page.
        </p>
      ) : (
        <HistoryTable messages={pageItems} />
      )}

      <HistoryPagination
        page={page}
        pageSize={HISTORY_PAGE_SIZE}
        itemCount={pageItems.length}
        hasNextPage={hasNextPage}
        onPageChange={(next) =>
          void setFilters({ page: next > 1 ? next : null })
        }
      />
    </Card>
  );
}

export function HistoryOverview() {
  return (
    <RequireActiveTeam description="Create or select a team to see message history.">
      <HistoryOverviewContent />
    </RequireActiveTeam>
  );
}
