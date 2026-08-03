"use client";

import { useEffect, useState } from "react";
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
    const [url, setUrl] = useState("");
    const [events, setEvents] = useState<string[]>([]);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [eventsError, setEventsError] = useState<string | null>(null);

    // Reseed the draft whenever a different webhook is opened for editing.
    useEffect(() => {
        if (webhook) {
            setUrl(webhook.url);
            setEvents(webhook.events);
            setUrlError(null);
            setEventsError(null);
        }
    }, [webhook]);

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (!webhook) return;

        const urlProblem = validateWebhookUrl(url);
        const hasEvents = events.length > 0;

        setUrlError(urlProblem);
        setEventsError(hasEvents ? null : "Select at least one event.");

        if (urlProblem || !hasEvents) return;

        onSave(webhook.id, { url: url.trim(), events });
        onOpenChange(false);
    }

    return (
        <Dialog open={webhook !== null} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg border-border/40 shadow-xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit webhook endpoint</DialogTitle>
                        <DialogDescription>
                            Changes apply immediately. Your signing secret stays
                            the same.
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
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
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
            </DialogContent>
        </Dialog>
    );
}
