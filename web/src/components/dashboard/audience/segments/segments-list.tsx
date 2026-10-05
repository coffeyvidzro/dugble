// src/components/dashboard/audience/segments/segments-list.tsx

"use client";

import { Layers, Trash2 } from "lucide-react";
import { formatDate } from "@/components/dashboard/sms/sms-dashboard/types";
import { Card } from "@/components/ui/card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteSegment, useSegments } from "@/hooks/queries/use-segments";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import type { Segment } from "@/types/segment";
import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog";
import { EmptyState } from "../shared/empty-state";
import { ListCardHeader } from "../shared/list-card-header";
import { ListErrorState, ListLoadingState } from "../shared/list-status";
import { RowActionsMenu } from "../shared/row-actions-menu";
import { CreateSegmentButton } from "./create-segment-button";
import { SegmentContactsCell } from "./segment-contacts-cell";

export function SegmentsList() {
  const { data: segments = [], isLoading, isError } = useSegments();
  const deleteMutation = useDeleteSegment();
  const {
    pendingItem: deletingSegment,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useDeleteConfirmation<Segment>((segment) =>
    deleteMutation.mutateAsync(segment.id),
  );

  if (isLoading) {
    return <ListLoadingState label="Loading segments…" />;
  }

  if (isError) {
    return <ListErrorState label="Failed to load segments. Try refreshing." />;
  }

  return (
    <>
      <Card className="border-border/40 shadow-sm">
        <ListCardHeader
          title="All segments"
          description={`${segments.length} segment${
            segments.length === 1 ? "" : "s"
          } in this workspace.`}
          action={segments.length > 0 && <CreateSegmentButton />}
        />

        {segments.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No segments yet"
            description="Create a segment to target contacts in campaigns and broadcasts."
            action={<CreateSegmentButton label="Create first segment" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Contacts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {segments.map((segment) => (
                  <TableRow
                    key={segment.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    <TableCell className="font-medium text-foreground">
                      {segment.name}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      <SegmentContactsCell segmentId={segment.id} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(new Date(segment.created_at))}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu>
                        {/* Edit removed: PATCH /segments/:id is not a supported route */}
                        <DropdownMenuItem
                          className="text-danger focus:text-danger"
                          onClick={() => requestDelete(segment)}
                        >
                          <Trash2 className="mr-2 size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </RowActionsMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ConfirmDeleteDialog
        open={Boolean(deletingSegment)}
        onOpenChange={(open) => !open && cancelDelete()}
        title="Delete segment?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-mono font-medium text-foreground">
              {deletingSegment?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete segment"
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
