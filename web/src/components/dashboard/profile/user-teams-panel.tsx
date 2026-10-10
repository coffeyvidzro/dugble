"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeaveTeam } from "@/hooks/queries/use-team-members";
import { useDeleteTeam, useTeams } from "@/hooks/queries/use-teams";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { TeamListItem } from "@/types/team";
import { TeamRow } from "./team-row";
import { TypedConfirmDialog } from "./typed-confirm-dialog";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function UserTeamsPanel() {
  const [searchInput, setSearchInput] = useState("");
  // Search and page change together so a new query always starts at page 1.
  const [query, setQuery] = useState({ search: "", page: 1 });
  const { search, page } = query;
  const commitSearch = useDebouncedCallback(
    (value: string) => setQuery({ search: value, page: 1 }),
    SEARCH_DEBOUNCE_MS,
  );
  function handleSearchChange(value: string) {
    setSearchInput(value);
    commitSearch(value.trim());
  }
  const setPage = (update: (current: number) => number) =>
    setQuery((current) => ({ ...current, page: update(current.page) }));

  const [leavingTeam, setLeavingTeam] = useState<TeamListItem | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<TeamListItem | null>(null);

  const { data, isPending, isError, error } = useTeams({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });
  const leaveTeam = useLeaveTeam();
  const deleteTeam = useDeleteTeam();

  function handleConfirmLeave() {
    if (!leavingTeam) return;
    leaveTeam.mutate(leavingTeam.id, {
      onSuccess: () => {
        toast.success(`Left ${leavingTeam.name}.`);
        setLeavingTeam(null);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleConfirmDelete() {
    if (!deletingTeam) return;
    deleteTeam.mutate(deletingTeam.id, {
      onSuccess: () => {
        toast.success(`Deleted ${deletingTeam.name}.`);
        setDeletingTeam(null);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  if (isPending) {
    return (
      <div className="flex min-h-32 items-center justify-center py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center gap-1 py-10 text-center">
        <p className="text-sm font-medium text-danger">
          Couldn&apos;t load your teams.
        </p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const { items: teams, pagination } = data;
  const hasAnyTeams = pagination.total > 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/5 px-6 py-3">
        <p className="font-mono text-xs text-muted-foreground">
          {pagination.total} {pagination.total === 1 ? "team" : "teams"}
        </p>
        {hasAnyTeams && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search teams"
              className="w-full rounded-lg border border-border/60 bg-muted/20 py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {searchInput.length > 0 && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
            <Building2 className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-heading text-lg font-medium">
            {hasAnyTeams ? "No teams match your search" : "No teams yet"}
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {hasAnyTeams
              ? "Try a different search term."
              : "Teams you create or join will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="w-75">Team</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-10 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TeamRow
                    key={team.id}
                    team={team}
                    onRequestLeave={setLeavingTeam}
                    onRequestDelete={setDeletingTeam}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-border/40 px-6 py-3">
              <p className="font-mono text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.total_pages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="flex size-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.total_pages, p + 1))
                  }
                  disabled={pagination.page >= pagination.total_pages}
                  className="flex size-7 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={leavingTeam !== null}
        onOpenChange={(open) => !open && setLeavingTeam(null)}
        title={<>Leave {leavingTeam?.name}?</>}
        description={
          <>
            You&apos;ll lose access to this team&apos;s dashboard, logs, and API
            keys immediately.
          </>
        }
        confirmLabel="Leave team"
        onConfirm={handleConfirmLeave}
      />

      <TypedConfirmDialog
        open={deletingTeam !== null}
        onOpenChange={(open) => !open && setDeletingTeam(null)}
        title={<>Delete &ldquo;{deletingTeam?.name}&rdquo;?</>}
        description={
          <>
            This permanently deletes the team, including its API keys, webhooks,
            delivery workflows, and historical logs. This{" "}
            <strong>cannot</strong> be undone.
          </>
        }
        confirmPhrase={deletingTeam?.name ?? ""}
        cancelLabel="Keep Team"
        pending={deleteTeam.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
