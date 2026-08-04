import { AlertTriangle, Check, Clock } from "lucide-react";

import type { DomainStatus } from "@/components/dashboard/email/domains/utils/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
    DomainStatus,
    { icon: typeof Check; label: string; className: string; pulse?: boolean }
> = {
    verified: { icon: Check, label: "Verified", className: "text-signal" },
    pending: {
        icon: Clock,
        label: "Pending",
        className: "text-pending",
        pulse: true,
    },
    failed: { icon: AlertTriangle, label: "Failed", className: "text-danger" },
};

export function DomainStatusBadge({
    status,
    className,
}: {
    status: DomainStatus;
    className?: string;
}) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium sm:text-sm",
                config.className,
                className,
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
            {config.label}
        </span>
    );
}
