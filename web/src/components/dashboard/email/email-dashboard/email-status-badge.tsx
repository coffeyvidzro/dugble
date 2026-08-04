import {
    AlertTriangle,
    Check,
    Clock,
    Eye,
    Flag,
    MousePointerClick,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EMAIL_STATUS_LABEL, type EmailStatus } from "./types";

export const EMAIL_STATUS_CONFIG: Record<
    EmailStatus,
    { icon: typeof Check; className: string; pulse?: boolean }
> = {
    sent: { icon: Clock, className: "text-pending", pulse: true },
    delivered: { icon: Check, className: "text-signal" },
    opened: { icon: Eye, className: "text-signal" },
    clicked: { icon: MousePointerClick, className: "text-signal" },
    bounced: { icon: AlertTriangle, className: "text-danger" },
    failed: { icon: X, className: "text-danger" },
    complained: { icon: Flag, className: "text-danger" },
};

export function EmailStatusBadge({ status }: { status: EmailStatus }) {
    const config = EMAIL_STATUS_CONFIG[status];
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
            {EMAIL_STATUS_LABEL[status]}
        </span>
    );
}
