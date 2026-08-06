import { Check, X } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { formatDate } from "../../email-dashboard/types";
import { cn } from "@/lib/utils";
import type { WebhookAttempt } from "../types";

export function LogWebhookAttempts({
    attempts,
}: {
    attempts: WebhookAttempt[];
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-lg">Webhook attempts</CardTitle>
                <CardDescription>
                    Delivery attempts to your configured endpoint.
                </CardDescription>
            </CardHeader>
            <div className="divide-y divide-border/40">
                {attempts.map((attempt) => (
                    <div
                        key={attempt.id}
                        className="flex flex-wrap items-center justify-between gap-2 p-4 sm:px-6"
                    >
                        <div className="min-w-0">
                            <p className="truncate font-mono text-xs text-foreground">
                                {attempt.endpoint}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(attempt.attemptedAt)}
                            </p>
                        </div>
                        <span
                            className={cn(
                                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-xs font-medium",
                                attempt.success
                                    ? "border-signal/30 bg-signal/10 text-signal"
                                    : "border-danger/30 bg-danger/10 text-danger",
                            )}
                        >
                            {attempt.success ? (
                                <Check className="size-3" />
                            ) : (
                                <X className="size-3" />
                            )}
                            {attempt.statusCode}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
