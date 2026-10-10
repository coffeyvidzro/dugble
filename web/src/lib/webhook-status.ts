import type { StatusTone } from "@/components/dashboard/shared/status-badge";
import { formatDate } from "@/lib/format-date";
import type { WebhookEndpoint } from "@/types/webhook";

export type WebhookStatusDisplay = {
  tone: StatusTone;
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
      tone: webhook.disabled_reason ? "danger" : "neutral",
      dotClassName: "bg-muted-foreground/50",
      textClassName: "text-muted-foreground",
      label: webhook.disabled_reason ? "Auto-disabled" : "Disabled",
      tooltip: webhook.disabled_reason ?? undefined,
    };
  }

  if (webhook.consecutive_failures > 0) {
    return {
      tone: "warning",
      dotClassName: "bg-pending",
      textClassName: "text-pending",
      label: `Failing (${webhook.consecutive_failures})`,
      tooltip: webhook.last_failure_at
        ? `Last failure ${formatDate(webhook.last_failure_at)}`
        : undefined,
    };
  }

  return {
    tone: "success",
    dotClassName: "bg-signal",
    textClassName: "text-signal",
    label: "Active",
    tooltip: undefined,
  };
}
