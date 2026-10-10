"use client";

import { Pencil, RefreshCw, Send, Trash2 } from "lucide-react";
import { CopyButton } from "@/components/dashboard/shared/copy-button";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDateTime } from "@/lib/format-date";
import { WEBHOOK_EVENT_GROUPS } from "@/lib/webhook-events";
import { getWebhookStatusDisplay } from "@/lib/webhook-status";
import type { WebhookEndpoint } from "@/types/webhook";

/**
 * Endpoint detail: health, subscribed events and actions. Every action
 * hands off to the existing dialogs, so behavior is unchanged.
 */
export function WebhookEndpointSheet({
  webhook,
  canManage,
  onOpenChange,
  onEdit,
  onTest,
  onRollSecret,
  onDelete,
}: {
  webhook: WebhookEndpoint | null;
  canManage: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (webhook: WebhookEndpoint) => void;
  onTest: (webhook: WebhookEndpoint) => void;
  onRollSecret: (webhook: WebhookEndpoint) => void;
  onDelete: (webhook: WebhookEndpoint) => void;
}) {
  return (
    <Sheet open={webhook !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-[520px]">
        {webhook && (
          <SheetBody
            webhook={webhook}
            canManage={canManage}
            onEdit={onEdit}
            onTest={onTest}
            onRollSecret={onRollSecret}
            onDelete={onDelete}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function SheetBody({
  webhook,
  canManage,
  onEdit,
  onTest,
  onRollSecret,
  onDelete,
}: {
  webhook: WebhookEndpoint;
  canManage: boolean;
  onEdit: (webhook: WebhookEndpoint) => void;
  onTest: (webhook: WebhookEndpoint) => void;
  onRollSecret: (webhook: WebhookEndpoint) => void;
  onDelete: (webhook: WebhookEndpoint) => void;
}) {
  const status = getWebhookStatusDisplay(webhook);
  const subscribed = new Set(webhook.subscribed_events);
  const known = new Set(WEBHOOK_EVENT_GROUPS.flatMap((g) => g.events));
  const groups = WEBHOOK_EVENT_GROUPS.map((group) => ({
    ...group,
    events: group.events.filter((event) => subscribed.has(event)),
  })).filter((group) => group.events.length > 0);
  const other = webhook.subscribed_events.filter((event) => !known.has(event));

  const health: { label: string; value: string; warn?: boolean }[] = [
    {
      label: "Consecutive failures",
      value: webhook.consecutive_failures.toLocaleString(),
      warn: webhook.consecutive_failures > 0,
    },
    {
      label: "Last failure",
      value: webhook.last_failure_at
        ? formatDateTime(webhook.last_failure_at)
        : "None",
    },
    { label: "Disabled reason", value: webhook.disabled_reason ?? "None" },
    { label: "Added", value: formatDateTime(webhook.created_at) },
  ];

  return (
    <>
      <SheetHeader className="gap-2.5 border-b px-5 pt-5 pr-14 pb-4">
        <SheetTitle className="text-xs font-normal text-muted-foreground">
          Endpoint
        </SheetTitle>
        <div className="flex items-start gap-1">
          <code className="min-w-0 font-mono text-sm leading-5 break-all text-foreground">
            {webhook.url}
          </code>
          <CopyButton value={webhook.url} label="endpoint URL" />
        </div>
        <SheetDescription>
          <StatusBadge tone={status.tone} size="md">
            {status.label}
          </StatusBadge>
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        <section aria-labelledby="wh-health" className="space-y-2">
          <h3 id="wh-health" className="font-heading text-sm font-semibold">
            Health
          </h3>
          <dl className="grid grid-cols-[11rem_minmax(0,1fr)] border-t text-[13px]">
            {health.map((row) => (
              <div key={row.label} className="contents">
                <dt className="border-b py-2 text-muted-foreground">
                  {row.label}
                </dt>
                <dd
                  className={
                    row.warn
                      ? "border-b py-2 font-medium text-pending"
                      : "border-b py-2"
                  }
                  suppressHydrationWarning
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="wh-events" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 id="wh-events" className="font-heading text-sm font-semibold">
              Subscribed events
            </h3>
            <span className="text-xs text-muted-foreground">
              {webhook.subscribed_events.length} of {known.size}
            </span>
          </div>
          {groups.map((group) => (
            <div key={group.id} className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.events.map((event) => (
                  <span
                    key={event}
                    className="rounded-md border bg-muted/60 px-2 py-0.5 font-mono text-xs"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {other.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {other.map((event) => (
                <span
                  key={event}
                  className="rounded-md border bg-muted/60 px-2 py-0.5 font-mono text-xs"
                >
                  {event}
                </span>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="wh-secret" className="space-y-2">
          <h3 id="wh-secret" className="font-heading text-sm font-semibold">
            Signing secret
          </h3>
          <p className="text-[13px] text-muted-foreground">
            The full secret is shown only when the endpoint is created or the
            secret is rolled.
          </p>
          {canManage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onRollSecret(webhook)}
            >
              <RefreshCw className="size-3.5" />
              Roll secret
            </Button>
          )}
        </section>
      </div>

      {canManage && (
        <div className="flex flex-wrap items-center gap-2 border-t px-5 py-3.5">
          <Button
            type="button"
            variant="destructive"
            className="gap-1.5"
            onClick={() => onDelete(webhook)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={() => onEdit(webhook)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            type="button"
            className="gap-1.5"
            onClick={() => onTest(webhook)}
          >
            <Send className="size-4" />
            Send test event
          </Button>
        </div>
      )}
    </>
  );
}
