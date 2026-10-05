// src/lib/webhook-status.ts

import { formatDate } from "@/lib/format-date";
import type { WebhookEndpoint } from "@/types/webhook";

export type WebhookStatusDisplay = {
  dotClassName: string;
  textClassName: string;
  label: string;
  tooltip?: string;
};

export function getWebhookStatusDisplay(
  webhook: WebhookEndpoint,
): WebhookStatusDisplay {
  if (!webhook.enabled) {
    return {
      dotClassName: "bg-muted-foreground/50",
      textClassName: "text-muted-foreground",
      label: webhook.disabled_reason ? "Auto-disabled" : "Disabled",
      tooltip: webhook.disabled_reason ?? undefined,
    };
  }

  if (webhook.consecutive_failures > 0) {
    return {
      dotClassName: "bg-pending",
      textClassName: "text-pending",
      label: `Active — ${webhook.consecutive_failures} failing`,
      tooltip: webhook.last_failure_at
        ? `Last failure ${formatDate(webhook.last_failure_at)}`
        : undefined,
    };
  }

  return {
    dotClassName: "bg-signal",
    textClassName: "text-signal",
    label: "Active",
    tooltip: undefined,
  };
}
