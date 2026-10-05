// src/components/dashboard/audience/suppressions/suppressions-list.tsx

"use client";

import { Ban, Trash2 } from "lucide-react";
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
import {
  useDeleteSuppression,
  useSuppressions,
} from "@/hooks/queries/use-suppressions";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import type { Suppression } from "@/types/suppression";
import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog";
import { EmptyState } from "../shared/empty-state";
import { ListCardHeader } from "../shared/list-card-header";
import { ListErrorState, ListLoadingState } from "../shared/list-status";
import { RowActionsMenu } from "../shared/row-actions-menu";
import { AddSuppressionButton } from "./add-suppression-button";

export function SuppressionsList() {
  const { data: items = [], isLoading, isError } = useSuppressions();
  const deleteMutation = useDeleteSuppression();
  const {
    pendingItem: deletingSuppression,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useDeleteConfirmation<Suppression>((item) =>
    deleteMutation.mutateAsync(item.id),
  );

  if (isLoading) {
    return <ListLoadingState label="Loading suppressions…" />;
  }

  if (isError) {
    return <ListErrorState label="Failed to load suppressions." />;
  }

  return (
    <>
      <Card className="border-border/40 shadow-sm">
        <ListCardHeader
          title="Suppressed addresses"
          description={`${items.length} suppression${
            items.length === 1 ? "" : "s"
          }.`}
          action={items.length > 0 && <AddSuppressionButton />}
        />

        {items.length === 0 ? (
          <EmptyState
            icon={Ban}
            title="No suppressions"
            description="Addresses you suppress will never receive email or SMS from this workspace."
            action={<AddSuppressionButton />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead>Email</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    <TableCell className="font-mono text-sm">
                      {item.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">
                      {item.origin ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.created_at
                        ? formatDate(new Date(item.created_at))
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActionsMenu>
                        <DropdownMenuItem
                          className="text-danger focus:text-danger"
                          onClick={() => requestDelete(item)}
                        >
                          <Trash2 className="mr-2 size-3.5" />
                          Remove
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
        open={Boolean(deletingSuppression)}
        onOpenChange={(open) => !open && cancelDelete()}
        title="Remove suppression?"
        description={
          <>
            Are you sure you want to remove{" "}
            <span className="font-mono font-medium text-foreground">
              {deletingSuppression?.email}
            </span>
            ? This address will become eligible to receive messages from this
            workspace again.
          </>
        }
        confirmLabel="Remove suppression"
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
