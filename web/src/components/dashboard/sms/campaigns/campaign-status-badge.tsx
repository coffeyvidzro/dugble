import { AlertTriangle, Check, Clock, Pause, PlayCircle, Send, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAMPAIGN_STATUS_LABEL, type CampaignStatus } from "./types";

const STATUS_CONFIG: Record<
    CampaignStatus,
    { icon: typeof Check; className: string; pulse?: boolean }
> = {
    draft: { icon: Clock, className: "text-muted-foreground" },
    scheduled: { icon: Clock, className: "text-pending" },
    sending: { icon: Send, className: "text-pending", pulse: true },
    active: { icon: PlayCircle, className: "text-signal" },
    paused: { icon: Pause, className: "text-muted-foreground" },
    completed: { icon: Check, className: "text-signal" },
    failed: { icon: AlertTriangle, className: "text-danger" },
    canceled: { icon: XCircle, className: "text-muted-foreground" },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
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
            {CAMPAIGN_STATUS_LABEL[status]}
        </span>
    );
}
