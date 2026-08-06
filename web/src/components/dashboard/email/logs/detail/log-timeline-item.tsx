import { cn } from "@/lib/utils";
import { EMAIL_STATUS_CONFIG } from "../../email-dashboard/email-status-badge";
import { EMAIL_STATUS_LABEL, formatDate } from "../../email-dashboard/types";
import type { LogTimelineEvent } from "../types";

export function LogTimelineItem({
    event,
    isLast,
}: {
    event: LogTimelineEvent;
    isLast: boolean;
}) {
    const config = EMAIL_STATUS_CONFIG[event.status];
    const Icon = config.icon;

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <span
                    className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card",
                        config.className,
                    )}
                >
                    <Icon className="size-3.5" />
                </span>
                {!isLast && <span className="w-px flex-1 bg-border/60" />}
            </div>
            <div className="min-w-0 flex-1 pb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                        {EMAIL_STATUS_LABEL[event.status]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatDate(event.timestamp)}
                    </p>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    {event.detail}
                </p>
            </div>
        </div>
    );
}
