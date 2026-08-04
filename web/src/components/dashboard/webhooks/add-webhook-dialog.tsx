"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { SecretReveal } from "./secret-reveal";
import { validateWebhookUrl } from "./types";
import { WebhookFormFields } from "./webhook-form-fields";

type Step = "form" | "reveal";

export function AddWebhookDialog({
    onCreate,
}: {
    onCreate: (input: { url: string; events: string[] }) => string;
}) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("form");
    const [url, setUrl] = useState("");
    const [events, setEvents] = useState<string[]>([]);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [eventsError, setEventsError] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);

    function reset() {
        setStep("form");
        setUrl("");
        setEvents([]);
        setUrlError(null);
        setEventsError(null);
        setSecret(null);
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        const urlProblem = validateWebhookUrl(url);
        const hasEvents = events.length > 0;

        setUrlError(urlProblem);
        setEventsError(hasEvents ? null : "Select at least one event.");

        if (urlProblem || !hasEvents) return;

        const full = onCreate({ url: url.trim(), events });
        setSecret(full);
        setStep("reveal");
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) reset();
            }}
        >
            <DialogTrigger
                render={
                    <Button className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20" />
                }
            >
                <Plus className="size-4" />
                Add webhook
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg border-border/40 shadow-xl">
                {step === "form" ? (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Add webhook endpoint</DialogTitle>
                            <DialogDescription>
                                Dugble will POST a JSON payload to this URL for
                                every event you select below.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6">
                            <WebhookFormFields
                                idPrefix="add-webhook"
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
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                            >
                                Add webhook
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                                />
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="animate-fade-up">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Check className="size-5 text-signal" />
                                Webhook added
                            </DialogTitle>
                            <DialogDescription>
                                This is the only time your signing secret will
                                be shown in full.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6">
                            <SecretReveal secret={secret ?? ""} />
                        </div>

                        <DialogFooter className="border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="group/button relative inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                            >
                                I&apos;ve saved it securely
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                                />
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
