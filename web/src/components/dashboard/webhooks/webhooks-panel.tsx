"use client";

import { Radio } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "@/components/dashboard/shared/data-states";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeamPermissions } from "@/hooks/queries/use-team-permissions";
import {
  useDeleteWebhookEndpoint,
  useSendTestWebhookEvent,
  useWebhookEndpoints,
} from "@/hooks/queries/use-webhooks";
import type { WebhookEndpoint } from "@/types/webhook";
import { AddWebhookDialog } from "./add-webhook-dialog";
import { EditWebhookDialog } from "./edit-webhook-dialog";
import { RollSecretDialog } from "./roll-secret-dialog";
import { TestWebhookDialog } from "./test-webhook-dialog";
import { WebhookEndpointSheet } from "./webhook-endpoint-sheet";
import { WebhookRow } from "./webhook-row";

export function WebhooksPanel() {
  const {
    data: webhooks,
    isLoading,
    isError,
    error,
    refetch,
  } = useWebhookEndpoints();
  const { canManageTeam, isLoading: isPermissionsLoading } =
    useTeamPermissions();

  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(
    null,
  );
  const [rollingWebhook, setRollingWebhook] = useState<WebhookEndpoint | null>(
    null,
  );
  const [testingWebhook, setTestingWebhook] = useState<WebhookEndpoint | null>(
    null,
  );
  const [deletingWebhook, setDeletingWebhook] =
    useState<WebhookEndpoint | null>(null);
  const [openWebhookId, setOpenWebhookId] = useState<string | null>(null);
  // Read the open endpoint from the list so the sheet reflects updates.
  const openWebhook = webhooks?.find((w) => w.id === openWebhookId) ?? null;
  const testWebhook = useSendTestWebhookEvent();

  function handleTest(webhook: WebhookEndpoint) {
    setTestingWebhook(webhook);
    testWebhook.reset();
    testWebhook.mutate(webhook.id);
  }

  const {
    mutate: deleteWebhook,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteWebhookEndpoint();

  const count = webhooks?.length ?? 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Loading…"
            : count === 0
              ? "No endpoints yet"
              : `${count} ${count === 1 ? "endpoint" : "endpoints"}`}
        </p>
        {!isPermissionsLoading && canManageTeam && <AddWebhookDialog />}
      </div>

      {isLoading ? (
        <TableSkeleton
          rows={3}
          columns={["minmax(0,2fr)", "5rem", "7rem", "3rem"]}
        />
      ) : isError ? (
        <ErrorState
          title="Couldn't load webhooks"
          description={
            error instanceof Error
              ? error.message
              : "Something went wrong while loading your webhook endpoints."
          }
          onRetry={() => void refetch()}
        />
      ) : count === 0 ? (
        <EmptyState
          icon={Radio}
          title="No endpoints yet"
          description="Add an HTTPS endpoint to receive deliveries, opens, bounces and more the moment they happen."
          actions={
            !isPermissionsLoading && canManageTeam ? <AddWebhookDialog /> : null
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Endpoint</TableHead>
              <TableHead className="w-28">Events</TableHead>
              <TableHead className="w-44">Status</TableHead>
              <TableHead className="w-24">Enabled</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks?.map((webhook) => (
              <WebhookRow
                key={webhook.id}
                webhook={webhook}
                selected={webhook.id === openWebhookId}
                onOpen={(w) => setOpenWebhookId(w.id)}
                onEdit={setEditingWebhook}
                onRollSecret={setRollingWebhook}
                onTest={handleTest}
                onDelete={setDeletingWebhook}
              />
            ))}
          </TableBody>
        </Table>
      )}

      <WebhookEndpointSheet
        webhook={openWebhook}
        canManage={!isPermissionsLoading && canManageTeam}
        onOpenChange={(open) => !open && setOpenWebhookId(null)}
        onEdit={setEditingWebhook}
        onTest={handleTest}
        onRollSecret={setRollingWebhook}
        onDelete={setDeletingWebhook}
      />

      <EditWebhookDialog
        webhook={editingWebhook}
        onOpenChange={(open) => !open && setEditingWebhook(null)}
      />

      <RollSecretDialog
        webhook={rollingWebhook}
        onOpenChange={(open) => !open && setRollingWebhook(null)}
      />

      <TestWebhookDialog
        webhook={testingWebhook}
        result={testWebhook}
        onOpenChange={(open) => {
          if (!open) {
            setTestingWebhook(null);
            testWebhook.reset();
          }
        }}
      />

      <ConfirmDialog
        open={deletingWebhook !== null}
        onOpenChange={(open) => !open && setDeletingWebhook(null)}
        title="Delete this webhook?"
        description={
          <>
            Dugble will stop sending events to{" "}
            <span className="font-mono text-xs">{deletingWebhook?.url}</span>.
            This cannot be undone.
            {deleteError && (
              <span className="mt-2 block text-danger">
                {deleteError instanceof Error
                  ? deleteError.message
                  : "Failed to delete the webhook."}
              </span>
            )}
          </>
        }
        confirmLabel="Delete webhook"
        pending={isDeleting}
        pendingLabel="Deleting…"
        onConfirm={() => {
          if (!deletingWebhook) return;
          deleteWebhook(deletingWebhook.id, {
            onSuccess: () => {
              if (deletingWebhook.id === openWebhookId) {
                setOpenWebhookId(null);
              }
              setDeletingWebhook(null);
            },
          });
        }}
      />
    </>
  );
}
