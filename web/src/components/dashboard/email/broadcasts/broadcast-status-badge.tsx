import { AlertTriangle, Check, Clock, Pause, Pencil, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { BROADCAST_STATUS_LABEL, type BroadcastStatus } from "./types";

const STATUS_CONFIG: Record<
    BroadcastStatus,
    { icon: typeof Check; className: string; pulse?: boolean }
> = {
    draft: { icon: Pencil, className: "text-muted-foreground" },
    scheduled: { icon: Clock, className: "text-pending", pulse: true },
    sending: { icon: Send, className: "text-pending", pulse: true },
    sent: { icon: Check, className: "text-signal" },
    paused: { icon: Pause, className: "text-pending" },
    failed: { icon: AlertTriangle, className: "text-danger" },
};

export function BroadcastStatusBadge({ status }: { status: BroadcastStatus }) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium",
                config.className,
            )}
        >
            {config.pulse ? (
                <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pending opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-pending" />
                </span>
            ) : (
                <Icon className="size-3.5" />
            )}
            {BROADCAST_STATUS_LABEL[status]}
        </span>
    );
}
