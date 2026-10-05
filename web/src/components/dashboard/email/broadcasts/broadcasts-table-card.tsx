// src/components/dashboard/email/broadcasts/broadcasts-table-card.tsx

"use client";

import { ArrowDown, ArrowUp, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCancelBroadcast,
  useDeleteBroadcast,
  useDuplicateBroadcast,
} from "@/hooks/queries/use-broadcasts-api";
import {
  type Broadcast,
  type BroadcastStatus,
  broadcastStatusSchema,
} from "@/types/broadcast-api";
import { BroadcastDetailDialog } from "./broadcast-detail-dialog";
import { BroadcastRow } from "./broadcast-row";
import { BroadcastsPagination } from "./broadcasts-pagination";
import { BroadcastsToolbar } from "./broadcasts-toolbar";

const broadcastSearchParams = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral([
    "all",
    ...broadcastStatusSchema.options,
  ] as const).withDefault("all"),
  sort: parseAsStringLiteral(["asc", "desc"] as const).withDefault("desc"),
  page: parseAsInteger.withDefault(1),
};

import type { Segment } from "@/types/segment";

const PAGE_SIZE = 8;

function getSortDate(broadcast: Broadcast): number {
  const value =
    broadcast.sent_at ?? broadcast.scheduled_at ?? broadcast.created_at;
  return new Date(value).getTime();
}

export function BroadcastsTableCard({
  broadcasts,
  segmentsById,
}: {
  broadcasts: Broadcast[];
  segmentsById: Map<string, Segment>;
}) {
  const router = useRouter();
  const duplicateBroadcast = useDuplicateBroadcast();
  const deleteBroadcast = useDeleteBroadcast();

  const [params, setParams] = useQueryStates(broadcastSearchParams, {
    history: "replace",
  });
  const { q: search, status: statusFilter, sort: sortDirection } = params;
  const page = Math.max(1, params.page);
  const setPage = (next: number) =>
    void setParams({ page: next > 1 ? next : null });
  const [viewing, setViewing] = useState<Broadcast | null>(null);
  const [canceling, setCanceling] = useState<Broadcast | null>(null);
  const [deleting, setDeleting] = useState<Broadcast | null>(null);

  const cancelBroadcast = useCancelBroadcast(canceling?.id ?? "");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return broadcasts.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return b.subject.toLowerCase().includes(q);
    });
  }, [broadcasts, search, statusFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) =>
      sortDirection === "desc"
        ? getSortDate(b) - getSortDate(a)
        : getSortDate(a) - getSortDate(b),
    );
    return list;
  }, [filtered, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearchChange(value: string) {
    void setParams({ q: value || null, page: null });
  }

  function handleStatusFilterChange(value: BroadcastStatus | "all") {
    void setParams({ status: value, page: null });
  }

  function handleEdit(broadcast: Broadcast) {
    router.push(`/dashboard/email/broadcasts/new?id=${broadcast.id}`);
  }

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
        <CardTitle className="text-xl">All Broadcasts</CardTitle>
        <CardDescription>
          Every announcement and campaign sent, scheduled, or drafted.
        </CardDescription>
      </CardHeader>
      <BroadcastsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
            <Megaphone className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-heading text-lg font-medium">
            No broadcasts found
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a different search term, clear your filters, or create your
            first broadcast.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="w-64">Broadcast</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Audience</TableHead>
                  <TableHead className="text-right">Queued</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() =>
                        void setParams({
                          sort: sortDirection === "desc" ? "asc" : "desc",
                        })
                      }
                      className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                      Date
                      {sortDirection === "desc" ? (
                        <ArrowDown className="size-3" />
                      ) : (
                        <ArrowUp className="size-3" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-10 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((broadcast) => (
                  <BroadcastRow
                    key={broadcast.id}
                    broadcast={broadcast}
                    segment={segmentsById.get(broadcast.segment_id)}
                    onView={setViewing}
                    onEdit={handleEdit}
                    onDuplicate={(b) =>
                      duplicateBroadcast.mutate({
                        broadcastId: b.id,
                      })
                    }
                    onCancel={setCanceling}
                    onRequestDelete={setDeleting}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <BroadcastsPagination
            page={safePage}
            totalPages={totalPages}
            totalCount={sorted.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      <BroadcastDetailDialog
        broadcast={viewing}
        segment={viewing ? segmentsById.get(viewing.segment_id) : undefined}
        onOpenChange={(open) => !open && setViewing(null)}
      />

      <ConfirmDialog
        open={canceling !== null}
        onOpenChange={(open) => !open && setCanceling(null)}
        title={
          <>
            Cancel &ldquo;{canceling?.subject || "this broadcast"}
            &rdquo;?
          </>
        }
        description="Scheduled broadcasts return to draft. Queued broadcasts stop remaining fanout — email already sent cannot be recalled."
        confirmLabel="Cancel broadcast"
        onConfirm={() => {
          if (!canceling) return;
          cancelBroadcast.mutate(undefined, {
            onSuccess: () => setCanceling(null),
          });
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={
          <>
            Delete &ldquo;{deleting?.subject || "this broadcast"}
            &rdquo;?
          </>
        }
        description="This can't be undone."
        confirmLabel="Delete broadcast"
        onConfirm={() => {
          if (!deleting) return;
          deleteBroadcast.mutate(deleting.id, {
            onSuccess: () => setDeleting(null),
          });
        }}
      />
    </Card>
  );
}
