"use client";

import { useEffect, useState } from "react";

import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

type Status = "queued" | "sent" | "delivered";

const sequence: Status[] = ["queued", "sent", "delivered"];

const copy: Record<Status, string> = {
    queued: "Queued",
    sent: "Sent",
    delivered: "Delivered",
};

const dotClass: Record<Status, string> = {
    queued: "bg-pending",
    sent: "bg-foreground/50",
    delivered: "bg-signal",
};

const textClass: Record<Status, string> = {
    queued: "text-pending",
    sent: "text-foreground/70",
    delivered: "text-signal",
};

export function InboxPreview() {
    const [step, setStep] = useState(-1);
    const [highlight, setHighlight] = useState(false);
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        setStep(-1);
        setHighlight(false);
        const timers = [
            setTimeout(() => setStep(0), 450),
            setTimeout(() => setHighlight(true), 900),
            setTimeout(() => setHighlight(false), 2000),
            setTimeout(() => setStep(1), 2000),
            setTimeout(() => setStep(2), 3100),
            setTimeout(() => setCycle((c) => c + 1), 5800),
        ];
        return () => timers.forEach(clearTimeout);
    }, [cycle]);

    const status = step >= 0 ? sequence[step] : null;

    return (
        <Reveal className="overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/5 dark:shadow-2xl dark:shadow-black/40">
            <div className="flex items-center gap-1.5 border-b bg-muted/30 px-4 py-3">
                <span className="size-2.5 rounded-full bg-danger/70" />
                <span className="size-2.5 rounded-full bg-pending/70" />
                <span className="size-2.5 rounded-full bg-signal/70" />
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    receipts@dugble.com
                </span>
            </div>

            <div className="grid gap-0 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="hidden border-r p-3 sm:block">
                    <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                        Inbox
                    </p>
                    <div className="mt-1 space-y-0.5">
                        <div className="rounded-lg bg-muted/70 px-2 py-2">
                            <p className="text-xs font-medium">
                                Your receipt from Dugble
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                just now
                            </p>
                        </div>
                        <div className="px-2 py-2 opacity-40">
                            <p className="text-xs font-medium">
                                Weekly usage summary
                            </p>
                        </div>
                        <div className="px-2 py-2 opacity-40">
                            <p className="text-xs font-medium">
                                Password reset requested
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-5">
                    <div>
                        <p className="text-sm font-semibold">
                            Your receipt from Dugble
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                            template: order_receipt
                        </p>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                        Hi{" "}
                        <span
                            className={cn(
                                "rounded px-1 py-0.5 font-medium text-foreground transition-colors duration-500",
                                highlight && "bg-signal/20 text-signal",
                            )}
                        >
                            Coffrey
                        </span>
                        , your payment of{" "}
                        <span
                            className={cn(
                                "rounded px-1 py-0.5 font-mono font-medium text-foreground transition-colors duration-500",
                                highlight && "bg-signal/20 text-signal",
                            )}
                        >
                            GHS 420.00
                        </span>{" "}
                        was received. A copy of this receipt is attached for
                        your records.
                    </p>

                    <div className="flex h-4 items-center gap-2 border-t pt-3 font-mono text-[11px]">
                        <span
                            className={cn(
                                "size-1.5 rounded-full transition-colors duration-300",
                                status
                                    ? dotClass[status]
                                    : "bg-muted-foreground/30",
                            )}
                        />
                        <span
                            className={cn(
                                "transition-colors duration-300",
                                status ? textClass[status] : "text-transparent",
                            )}
                        >
                            {status ? copy[status] : "—"}
                        </span>
                    </div>
                </div>
            </div>
        </Reveal>
    );
}
