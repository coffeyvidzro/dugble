"use client";

import { AlertTriangle, ArrowRight, PlusCircle } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/dashboard/shared/copy-button";
import { LoadingBlock } from "@/components/dashboard/shared/data-states";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWebhookEndpoints } from "@/hooks/queries/use-webhooks";
import { getWebhookStatusDisplay } from "@/lib/webhook-status";
import { formatRelativeTime } from "./types";

export function WebhookHealthCard() {
  const { data: endpoints, isPending, isError } = useWebhookEndpoints();
  const endpoint = endpoints?.[0];
  const extraCount = endpoints ? Math.max(endpoints.length - 1, 0) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div className="space-y-1">
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Delivery status for your configured endpoint.
          </CardDescription>
        </div>
        <Link
          href="/dashboard/developers/webhooks"
          className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          Manage webhooks
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <div className="space-y-4 p-4">
        {isPending ? (
          <LoadingBlock label="Loading…" />
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertTriangle className="size-4 shrink-0" />
            Couldn&apos;t load webhook status.
          </div>
        ) : !endpoint ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <PlusCircle className="size-4" />
            </span>
            <p className="text-sm text-muted-foreground">
              No webhook endpoint configured yet.
            </p>
            <Link
              href="/dashboard/developers/webhooks"
              className="text-sm font-medium text-foreground underline underline-offset-2"
            >
              Add one
            </Link>
          </div>
        ) : (
          <WebhookHealthDetails endpoint={endpoint} extraCount={extraCount} />
        )}
      </div>
    </Card>
  );
}

function WebhookHealthDetails({
  endpoint,
  extraCount,
}: {
  endpoint: NonNullable<ReturnType<typeof useWebhookEndpoints>["data"]>[number];
  extraCount: number;
}) {
  const display = getWebhookStatusDisplay(endpoint);

  return (
    <>
      <div className="flex items-center justify-between">
        <StatusBadge tone={display.tone} title={display.tooltip}>
          {display.label}
        </StatusBadge>
        {extraCount > 0 && (
          <span className="font-mono text-xs text-muted-foreground">
            +{extraCount} more
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
          {endpoint.url}
        </span>
        <CopyButton value={endpoint.url} label="endpoint URL" />
      </div>

      <p className="text-xs text-muted-foreground">
        Subscribed to{" "}
        <span className="font-mono text-foreground">
          {endpoint.subscribed_events.length}
        </span>{" "}
        event{endpoint.subscribed_events.length === 1 ? "" : "s"}
        {endpoint.last_failure_at && (
          <> · Last failure {formatRelativeTime(endpoint.last_failure_at)}</>
        )}
      </p>
    </>
  );
}
