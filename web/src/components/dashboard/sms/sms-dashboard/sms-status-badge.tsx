import { AlertTriangle, Check, Clock, MousePointerClick, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SMS_STATUS_LABEL, type SmsStatus } from "./types";

export const SMS_STATUS_CONFIG: Record<
    SmsStatus,
    { icon: typeof Check; className: string; pulse?: boolean }
> = {
    queued: { icon: Clock, className: "text-pending", pulse: true },
    sent: { icon: Send, className: "text-pending" },
    delivered: { icon: Check, className: "text-signal" },
    clicked: { icon: MousePointerClick, className: "text-signal" },
    failed: { icon: X, className: "text-danger" },
    undelivered: { icon: AlertTriangle, className: "text-danger" },
};

export function SmsStatusBadge({ status }: { status: SmsStatus }) {
    const config = SMS_STATUS_CONFIG[status];
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
            {SMS_STATUS_LABEL[status]}
        </span>
    );
}
