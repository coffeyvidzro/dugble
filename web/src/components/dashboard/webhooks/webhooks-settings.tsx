// src/components/dashboard/webhooks/webhooks-settings.tsx

"use client";

import { useWebhookEndpoints } from "@/hooks/queries/use-webhooks";
import { WebhookHeader } from "./webhook-header";
import { WebhooksCard } from "./webhooks-card";

export function WebhooksSettings() {
    const { data: webhooks, isLoading } = useWebhookEndpoints();

    return (
        <div className="mx-auto w-full max-w-5xl  pb-6">
            <WebhookHeader
                endpointCount={webhooks?.length ?? 0}
                isLoading={isLoading}
            />
            <div
                className="animate-fade-up"
                style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
                <WebhooksCard />
            </div>
        </div>
    );
}
