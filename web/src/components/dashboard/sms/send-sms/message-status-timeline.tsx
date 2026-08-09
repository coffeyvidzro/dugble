import { AlertTriangle, Check, Clock, MousePointerClick, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SMS_STATUS_LABEL, type SmsStatus } from "../sms-dashboard/types";
import type { MessageEvent } from "./types";

const STATUS_ICON: Record<SmsStatus, typeof Check> = {
    queued: Clock,
    sent: Send,
    delivered: Check,
    clicked: MousePointerClick,
    failed: X,
    undelivered: AlertTriangle,
};

export function MessageStatusTimeline({
    events,
    isSettling,
}: {
    events: MessageEvent[];
    isSettling: boolean;
}) {
    return (
        <ol className="space-y-4">
            {events.map((event, index) => {
                const Icon = STATUS_ICON[event.status];
                const isError =
                    event.status === "failed" || event.status === "undelivered";
                const isLast = index === events.length - 1;

                return (
                    <li key={`${event.status}-${index}`} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <span
                                className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-full border",
                                    isError
                                        ? "border-danger/40 bg-danger/10 text-danger"
                                        : "border-signal/40 bg-signal/10 text-signal",
                                )}
                            >
                                <Icon className="size-3.5" />
                            </span>
                            {!isLast && (
                                <span
                                    aria-hidden="true"
                                    className="mt-1 h-full w-px flex-1 bg-border/60"
                                />
                            )}
                        </div>
                        <div className="pb-4">
                            <p className="text-sm font-medium text-foreground">
                                {SMS_STATUS_LABEL[event.status]}
                            </p>
                            <p className="font-mono text-xs text-muted-foreground">
                                {event.at.toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </li>
                );
            })}
            {isSettling && (
                <li className="flex items-center gap-3 pl-1 text-xs text-muted-foreground">
                    <span className="relative flex size-2" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pending opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-pending" />
                    </span>
                    Waiting for carrier update…
                </li>
            )}
        </ol>
    );
}
