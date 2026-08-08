import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SENDER_ID_STATUS_LABEL, type SenderIdRequestStatus } from "./types";

const STATUS_CONFIG: Record<
    SenderIdRequestStatus,
    { icon: typeof Check; className: string; pulse?: boolean }
> = {
    pending: { icon: Clock, className: "text-pending", pulse: true },
    approved: { icon: Check, className: "text-signal" },
    rejected: { icon: X, className: "text-danger" },
};

export function SenderIdStatusBadge({ status }: { status: SenderIdRequestStatus }) {
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
            {SENDER_ID_STATUS_LABEL[status]}
        </span>
    );
}
