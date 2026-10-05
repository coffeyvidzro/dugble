// src/components/dashboard/webhooks/webhooks-panel.tsx

"use client";

import { AlertTriangle, Radio } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/5 px-6 py-3">
        <p className="font-mono text-xs text-muted-foreground">
          {isLoading
            ? "Loading…"
            : count === 0
              ? "No webhooks yet"
              : `${count} ${count === 1 ? "endpoint" : "endpoints"}`}
        </p>
        {!isPermissionsLoading && canManageTeam && <AddWebhookDialog />}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Loading webhook endpoints…
          </p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center animate-fade-up">
          <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-danger/10 border border-dashed border-danger/40">
            <AlertTriangle className="size-5 text-danger" />
          </div>
          <h3 className="font-heading text-lg font-medium">
            Couldn&apos;t load webhooks
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Something went wrong while loading your webhook endpoints."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Try again
          </button>
        </div>
      ) : count === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
            <Radio className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-heading text-lg font-medium">
            No webhooks yet
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add an endpoint to receive real-time events, deliveries, opens,
            bounces, and more, the moment they happen.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="w-80">Endpoint</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks?.map((webhook) => (
                <WebhookRow
                  key={webhook.id}
                  webhook={webhook}
                  onEdit={setEditingWebhook}
                  onRollSecret={setRollingWebhook}
                  onTest={handleTest}
                  onDelete={setDeletingWebhook}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
            onSuccess: () => setDeletingWebhook(null),
          });
        }}
      />
    </>
  );
}
