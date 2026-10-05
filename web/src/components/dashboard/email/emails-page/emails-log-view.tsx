// src/components/dashboard/email/emails-page/emails-log-view.tsx

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEmails } from "@/hooks/queries/use-emails-api";
import { queryKeys } from "@/lib/api/query-keys";
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

  const { data: emails, isPending, isError } = useEmails(params);
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
    <div className="mx-auto w-full max-w-6xl pb-6">
      <EmailsHeader />

      <div
        className="animate-fade-up"
        style={{ animationDelay: "100ms", animationFillMode: "both" }}
      >
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 bg-muted/10 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">Email Log</CardTitle>
              <CardDescription>
                Search and send transactional emails.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <RefreshButton
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
              <SendEmailDialog />
            </div>
          </CardHeader>

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
          />

          {isError ? (
            <p className="py-16 text-center text-sm text-danger">
              Couldn&apos;t load emails. Try refreshing the page.
            </p>
          ) : isPending ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading emails…
            </div>
          ) : (
            <EmailsTable
              emails={filtered}
              page={page}
              hasNextPage={hasNextPage}
              onPageChange={(next) => setPage(Math.max(1, next))}
              hasActiveFilters={hasActiveFilters}
            />
          )}
        </Card>
      </div>
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
