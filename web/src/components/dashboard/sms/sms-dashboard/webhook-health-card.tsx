import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, PauseCircle } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CopyButton } from "../../shared/copy-button";
import { formatRelativeTime, type WebhookHealth, type WebhookStatus } from "./types";

const STATUS_CONFIG: Record<
    WebhookStatus,
    { label: string; icon: typeof Check; className: string }
> = {
    active: { label: "Active", icon: Check, className: "text-signal" },
    failing: { label: "Failing", icon: AlertTriangle, className: "text-danger" },
    disabled: {
        label: "Disabled",
        icon: PauseCircle,
        className: "text-muted-foreground",
    },
};

export function WebhookHealthCard({ webhook }: { webhook: WebhookHealth }) {
    const config = STATUS_CONFIG[webhook.status];
    const StatusIcon = config.icon;

    return (
        <Card className="h-full border-border/40 shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/40 bg-muted/10 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl">Webhooks</CardTitle>
                    <CardDescription>
                        Delivery status for your configured endpoint.
                    </CardDescription>
                </div>
                <Link
                    href="/dashboard/developers/webhooks"
                    className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                >
                    Manage webhooks
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Link>
            </CardHeader>

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 text-sm font-medium",
                            config.className,
                        )}
                    >
                        <StatusIcon className="size-3.5" />
                        {config.label}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                        {webhook.successRatePct.toFixed(1)}% success
                    </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-2">
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                        {webhook.endpoint}
                    </span>
                    <CopyButton
                        value={webhook.endpoint}
                        label="Copy endpoint URL"
                        className="text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    />
                </div>

                <p className="text-xs text-muted-foreground">
                    Last event{" "}
                    <span className="font-mono text-foreground">
                        {webhook.lastEventType}
                    </span>{" "}
                    · {formatRelativeTime(webhook.lastEventAt)}
                </p>
            </div>
        </Card>
    );
}
