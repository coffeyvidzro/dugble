"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { validateWebhookUrl, type Webhook } from "./types";
import { WebhookFormFields } from "./webhook-form-fields";

export function EditWebhookDialog({
    webhook,
    onOpenChange,
    onSave,
}: {
    webhook: Webhook | null;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, input: { url: string; events: string[] }) => void;
}) {
    return (
        <Dialog open={webhook !== null} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg border-border/40 shadow-xl">
                {webhook && (
                    <EditWebhookForm
                        key={webhook.id}
                        webhook={webhook}
                        onSave={onSave}
                        onCancel={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function EditWebhookForm({
    webhook,
    onSave,
    onCancel,
}: {
    webhook: Webhook;
    onSave: (id: string, input: { url: string; events: string[] }) => void;
    onCancel: () => void;
}) {
    const [url, setUrl] = useState(webhook.url);
    const [events, setEvents] = useState<string[]>(webhook.events);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [eventsError, setEventsError] = useState<string | null>(null);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        const urlProblem = validateWebhookUrl(url);
        const hasEvents = events.length > 0;

        setUrlError(urlProblem);
        setEventsError(hasEvents ? null : "Select at least one event.");

        if (urlProblem || !hasEvents) return;

        onSave(webhook.id, { url: url.trim(), events });
        onCancel();
    }

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Edit webhook endpoint</DialogTitle>
                <DialogDescription>
                    Changes apply immediately. Your signing secret stays the
                    same.
                </DialogDescription>
            </DialogHeader>

            <div className="py-6">
                <WebhookFormFields
                    idPrefix="edit-webhook"
                    url={url}
                    onUrlChange={(value) => {
                        setUrl(value);
                        setUrlError(null);
                    }}
                    urlError={urlError}
                    events={events}
                    onEventsChange={(next) => {
                        setEvents(next);
                        setEventsError(null);
                    }}
                    eventsError={eventsError}
                />
            </div>

            <DialogFooter className="border-t border-border/40 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                >
                    Save changes
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Button>
            </DialogFooter>
        </form>
    );
}
