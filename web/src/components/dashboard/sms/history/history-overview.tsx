"use client";

import { Inbox, SearchX, X } from "lucide-react";
import Link from "next/link";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useMemo, useState } from "react";
import {
  EmptyState,
  ErrorState,
  RefetchBar,
  TableSkeleton,
} from "@/components/dashboard/shared/data-states";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { UpdatedAgo } from "@/components/dashboard/shared/updated-ago";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useApprovedSenderIds } from "@/hooks/queries/use-approved-sender-ids";
import { useSmsMessages } from "@/hooks/queries/use-sms-api";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { ExportHistoryCsvButton } from "./export-history-csv-button";
import { HistoryFilters } from "./history-filters";
import { HistoryPagination } from "./history-pagination";
import { HistoryTable } from "./history-table";
import { SmsDetailSheet } from "./sms-detail-sheet";
import {
  dateFilterToStartDate,
  HISTORY_DATE_FILTERS,
  HISTORY_DATE_LABEL,
  HISTORY_PAGE_SIZE,
  HISTORY_STATUS_FILTERS,
  HISTORY_STATUS_LABEL,
} from "./types";

const SEARCH_DEBOUNCE_MS = 300;

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

  const {
    data: messages,
    isPending,
    isError,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useSmsMessages(params);
  const [openMessageId, setOpenMessageId] = useState<string | null>(null);

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (search.trim() !== "") {
    chips.push({
      key: "q",
      label: `Search: ${search.trim()}`,
      onRemove: () => {
        setSearchInput("");
        void setFilters({ q: null, page: null });
      },
    });
  }
  if (status !== "all") {
    chips.push({
      key: "status",
      label: `Status: ${HISTORY_STATUS_LABEL[status]}`,
      onRemove: () => void setFilters({ status: null, page: null }),
    });
  }
  if (sender !== "all") {
    chips.push({
      key: "sender",
      label: `Sender: ${sender}`,
      onRemove: () => void setFilters({ sender: null, page: null }),
    });
  }
  if (dateRange !== "30d") {
    chips.push({
      key: "range",
      label: HISTORY_DATE_LABEL[dateRange],
      onRemove: () => void setFilters({ range: null, page: null }),
    });
  }
  const narrowedBySearchOrFacet =
    search.trim() !== "" || status !== "all" || sender !== "all";

  function clearAll() {
    setSearchInput("");
    void setFilters({
      q: null,
      status: null,
      sender: null,
      range: null,
      page: null,
    });
  }

  const emptyState = narrowedBySearchOrFacet ? (
    <EmptyState
      icon={SearchX}
      title="No messages match these filters"
      description="Try a different search, status or sender, or widen the period."
      actions={
        <Button type="button" variant="outline" onClick={clearAll}>
          Clear filters
        </Button>
      }
    />
  ) : dateRange !== "all" ? (
    <EmptyState
      icon={Inbox}
      title={`No messages in the ${HISTORY_DATE_LABEL[dateRange].toLowerCase()}`}
      description="Older messages may still be in your history."
      actions={
        <Button
          type="button"
          variant="outline"
          onClick={() => void setFilters({ range: "all", page: null })}
        >
          Show all time
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Inbox}
      title="No messages sent yet"
      description="SMS sent from the dashboard or through the Dugble API will show up here."
      actions={
        <Link href="/dashboard/sms/send/new" className={buttonVariants()}>
          Send SMS
        </Link>
      }
    />
  );

  const pageItems = messages ?? [];
  const hasNextPage = pageItems.length === HISTORY_PAGE_SIZE;

  return (
    <>
      <Card className="gap-0 py-0">
        <div className="space-y-2.5 border-b px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="min-w-0 flex-1">
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
            <div className="flex items-center gap-3">
              <UpdatedAgo updatedAt={dataUpdatedAt} />
              <ExportHistoryCsvButton messages={pageItems} />
            </div>
          </div>
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {chips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex h-6 max-w-64 items-center gap-1 rounded-full border bg-muted/60 pr-1 pl-2.5 text-xs"
                >
                  <span className="truncate">{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Remove filter ${chip.label}`}
                    className="flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="ml-1 text-xs font-medium text-signal hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
        <RefetchBar active={isFetching && !isPending} />

        {isError ? (
          <ErrorState
            title="Couldn't load message history"
            onRetry={() => void refetch()}
          />
        ) : isPending ? (
          <TableSkeleton
            rows={8}
            columns={["7rem", "11rem", "minmax(0,1fr)", "7rem", "4rem"]}
          />
        ) : (
          <HistoryTable
            messages={pageItems}
            emptyState={emptyState}
            selectedId={openMessageId}
            onOpen={setOpenMessageId}
          />
        )}

        {(pageItems.length > 0 || page > 1) && (
          <HistoryPagination
            page={page}
            pageSize={HISTORY_PAGE_SIZE}
            itemCount={pageItems.length}
            hasNextPage={hasNextPage}
            onPageChange={(next) =>
              void setFilters({ page: next > 1 ? next : null })
            }
          />
        )}
      </Card>

      <SmsDetailSheet
        messageId={openMessageId}
        onOpenChange={(open) => {
          if (!open) setOpenMessageId(null);
        }}
      />
    </>
  );
}

export function HistoryOverview() {
  return (
    <RequireActiveTeam description="Create or select a team to see message history.">
      <HistoryOverviewContent />
    </RequireActiveTeam>
  );
}
