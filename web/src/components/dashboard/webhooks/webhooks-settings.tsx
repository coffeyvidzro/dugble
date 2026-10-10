"use client";

import { useWebhookEndpoints } from "@/hooks/queries/use-webhooks";
import { WebhookHeader } from "./webhook-header";
import { WebhooksCard } from "./webhooks-card";

export function WebhooksSettings() {
  const { data: webhooks, isLoading } = useWebhookEndpoints();

  return (
    <div className="mx-auto w-full max-w-7xl pb-8">
      <WebhookHeader
        endpointCount={webhooks?.length ?? 0}
        failingCount={
          webhooks?.filter((w) => w.enabled && w.consecutive_failures > 0)
            .length ?? 0
        }
        isLoading={isLoading}
      />
      <WebhooksCard />
    </div>
  );
}
