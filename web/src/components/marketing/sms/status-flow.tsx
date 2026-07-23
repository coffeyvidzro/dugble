import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

const statuses = [
    {
        key: "queued",
        label: "Queued",
        detail: "Accepted, waiting on the carrier.",
        tone: "text-pending",
        dot: "bg-pending",
    },
    {
        key: "sent",
        label: "Sent",
        detail: "Handed off to the carrier network.",
        tone: "text-foreground/80",
        dot: "bg-foreground/50",
    },
    {
        key: "delivered",
        label: "Delivered",
        detail: "Confirmed on the recipient's device.",
        tone: "text-signal",
        dot: "bg-signal",
    },
    {
        key: "failed",
        label: "Failed",
        detail: "Carrier rejected or could not route it.",
        tone: "text-danger",
        dot: "bg-danger",
    },
    {
        key: "expired",
        label: "Expired",
        detail: "OTP window closed before it was used.",
        tone: "text-muted-foreground",
        dot: "bg-muted-foreground/50",
    },
];

export function StatusFlow() {
    return (
        <Reveal
            as="section"
            className="space-y-6 rounded-2xl border bg-card p-6 md:p-8"
        >
            <div className="flex items-center justify-between">
                <p className="font-medium">Expected SMS states</p>
                <p className="hidden font-mono text-xs text-muted-foreground sm:block">
                    message.&#123;status&#125;
                </p>
            </div>

            <div className="relative grid gap-6 sm:grid-cols-5">
                <div
                    aria-hidden
                    className="absolute left-0 right-0 top-1 hidden bg-border sm:block"
                />
                {statuses.map((status, index) => (
                    <Reveal
                        key={status.key}
                        delay={index * 75}
                        className="relative space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    "relative z-10 size-2 rounded-full bg-background ring-4 ring-background",
                                    status.dot,
                                )}
                            />
                            <span
                                className={cn(
                                    "font-mono text-xs uppercase tracking-wide",
                                    status.tone,
                                )}
                            >
                                {status.label}
                            </span>
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">
                            {status.detail}
                        </p>
                    </Reveal>
                ))}
            </div>
        </Reveal>
    );
}
