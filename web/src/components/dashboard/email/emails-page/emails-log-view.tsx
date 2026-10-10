"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ErrorState,
  RefetchBar,
  TableSkeleton,
} from "@/components/dashboard/shared/data-states";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { UpdatedAgo } from "@/components/dashboard/shared/updated-ago";
import { Card } from "@/components/ui/card";
import { useEmails } from "@/hooks/queries/use-emails-api";
import { queryKeys } from "@/lib/api/query-keys";
import { EmailDetailSheet } from "./email-detail-sheet";
import { EmailsHeader } from "./emails-header";
import { EmailsTable } from "./emails-table";
import { EmailsToolbar } from "./emails-toolbar";
import { RefreshButton } from "./refresh-button";
import { SendEmailDialog } from "./send-email-dialog";
import {
  EMAILS_LIST_PAGE_SIZE,
  type EmailApiStatusFilter,
  matchesEmailApiStatusFilter,
} from "./types";

function EmailsLogViewContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EmailApiStatusFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const params = useMemo(
    () => ({
      limit: EMAILS_LIST_PAGE_SIZE,
      offset: (page - 1) * EMAILS_LIST_PAGE_SIZE,
    }),
    [page],
  );

  const {
    data: emails,
    isPending,
    isError,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useEmails(params);
  const [openEmailId, setOpenEmailId] = useState<string | null>(null);
  const pageItems = emails ?? [];
  const hasNextPage = pageItems.length === EMAILS_LIST_PAGE_SIZE;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pageItems.filter((email) => {
      if (!matchesEmailApiStatusFilter(email.status, statusFilter))
        return false;
      if (!q) return true;
      return (
        email.to_email.toLowerCase().includes(q) ||
        email.subject.toLowerCase().includes(q) ||
        (email.to_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [pageItems, query, statusFilter]);

  const hasActiveFilters = query.trim() !== "" || statusFilter !== "all";

  function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    queryClient
      .invalidateQueries({ queryKey: queryKeys.emailApi.lists() })
      .finally(() => setRefreshing(false));
  }

  return (
    <div className="mx-auto w-full max-w-7xl pb-8">
      <EmailsHeader
        actions={
          <>
            <UpdatedAgo updatedAt={dataUpdatedAt} />
            <RefreshButton refreshing={refreshing} onRefresh={handleRefresh} />
            <SendEmailDialog />
          </>
        }
      />

      <Card className="gap-0 py-0">
        <EmailsToolbar
          query={query}
          onQueryChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          resultLabel={
            isPending
              ? undefined
              : `${filtered.length} result${filtered.length === 1 ? "" : "s"}, page ${page}`
          }
        />
        <RefetchBar active={isFetching && !isPending} />

        {isError ? (
          <ErrorState
            title="Couldn't load emails"
            onRetry={() => void refetch()}
          />
        ) : isPending ? (
          <TableSkeleton
            rows={8}
            columns={["7rem", "14rem", "minmax(0,1fr)", "5rem"]}
          />
        ) : (
          <EmailsTable
            emails={filtered}
            page={page}
            hasNextPage={hasNextPage}
            onPageChange={(next) => setPage(Math.max(1, next))}
            hasActiveFilters={hasActiveFilters}
            selectedId={openEmailId}
            onOpen={setOpenEmailId}
          />
        )}
      </Card>

      <EmailDetailSheet
        emailId={openEmailId}
        onOpenChange={(open) => {
          if (!open) setOpenEmailId(null);
        }}
      />
    </div>
  );
}

export function EmailsLogView() {
  return (
    <RequireActiveTeam description="Create or select a team to see sent emails.">
      <EmailsLogViewContent />
    </RequireActiveTeam>
  );
}
