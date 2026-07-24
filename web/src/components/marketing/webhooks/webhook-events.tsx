import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

const events = [
    {
        key: "delivered",
        label: "message.delivered",
        detail: "Confirmed on device or by the receiving server.",
        tone: "text-signal",
        dot: "bg-signal",
    },
    {
        key: "failed",
        label: "message.failed",
        detail: "Provider rejected or could not route the message.",
        tone: "text-danger",
        dot: "bg-danger",
    },
    {
        key: "bounced",
        label: "message.bounced",
        detail: "Rejected: invalid address or full mailbox.",
        tone: "text-danger",
        dot: "bg-danger/70",
    },
    {
        key: "retrying",
        label: "message.retrying",
        detail: "Your endpoint failed to acknowledge: retry queued.",
        tone: "text-pending",
        dot: "bg-pending",
    },
];

export function WebhookEvents() {
    return (
        <Reveal
            as="section"
            className="space-y-6 rounded-2xl border bg-card p-6 md:p-8"
        >
            <div className="flex items-center justify-between">
                <p className="font-medium">Webhook event types</p>
                <p className="hidden font-mono text-xs text-muted-foreground sm:block">
                    X-Dugble-Event
                </p>
            </div>

            <div className="relative grid gap-6 sm:grid-cols-4">
                <div
                    aria-hidden
                    className="absolute left-0 right-0 top-1 hidden bg-border sm:block"
                />
                {events.map((event, index) => (
                    <Reveal
                        key={event.key}
                        delay={index * 75}
                        className="relative space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    "relative z-10 size-2 rounded-full bg-background ring-4 ring-background",
                                    event.dot,
                                )}
                            />
                            <span
                                className={cn(
                                    "font-mono text-xs tracking-wide",
                                    event.tone,
                                )}
                            >
                                {event.label}
                            </span>
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">
                            {event.detail}
                        </p>
                    </Reveal>
                ))}
            </div>
        </Reveal>
    );
}
