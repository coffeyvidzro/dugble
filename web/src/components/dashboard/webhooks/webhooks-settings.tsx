"use client";

import { useState } from "react";
import { generateWebhookSecret, type Webhook } from "./types";
import { WebhookHeader } from "./webhook-header";
import { WebhooksCard } from "./webhooks-card";

export function WebhooksSettings() {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);

    function handleCreate(input: { url: string; events: string[] }): string {
        const { full, masked } = generateWebhookSecret();
        setWebhooks((prev) => [
            {
                id: crypto.randomUUID(),
                url: input.url,
                events: input.events,
                status: "active",
                createdAt: new Date(),
                maskedSecret: masked,
                lastDelivery: null,
            },
            ...prev,
        ]);
        return full;
    }

    function handleEdit(id: string, input: { url: string; events: string[] }) {
        setWebhooks((prev) =>
            prev.map((webhook) =>
                webhook.id === id
                    ? { ...webhook, url: input.url, events: input.events }
                    : webhook,
            ),
        );
    }

    function handleRollSecret(id: string): string {
        const { full, masked } = generateWebhookSecret();
        setWebhooks((prev) =>
            prev.map((webhook) =>
                webhook.id === id
                    ? { ...webhook, maskedSecret: masked }
                    : webhook,
            ),
        );
        return full;
    }

    function handleToggleStatus(id: string) {
        setWebhooks((prev) =>
            prev.map((webhook) =>
                webhook.id === id
                    ? {
                          ...webhook,
                          status:
                              webhook.status === "active"
                                  ? "disabled"
                                  : "active",
                      }
                    : webhook,
            ),
        );
    }

    function handleDelete(id: string) {
        setWebhooks((prev) => prev.filter((webhook) => webhook.id !== id));
    }

    return (
        <div className="mx-auto w-full max-w-5xl  pb-6">
            <WebhookHeader endpointCount={webhooks.length} />
            <div
                className="animate-fade-up"
                style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
                <WebhooksCard
                    webhooks={webhooks}
                    onCreate={handleCreate}
                    onEdit={handleEdit}
                    onRollSecret={handleRollSecret}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}
