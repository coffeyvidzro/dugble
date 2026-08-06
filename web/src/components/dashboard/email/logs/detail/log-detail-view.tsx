import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LogDetailHeader } from "./log-detail-header";
import { LogErrorBanner } from "./log-error-banner";
import { LogMetaGrid } from "./log-meta-grid";
import { LogTimeline } from "./log-timeline";
import { LogWebhookAttempts } from "./log-webhook-attempts";
import { LogRequestPayload } from "./log-request-payload";
import { LogEmailPreviewCard } from "./log-email-preview-card";
import type { LogEntry } from "../types";

export function LogDetailView({ log }: { log: LogEntry }) {
    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <div className="animate-fade-up space-y-3">
                <Link
                    href="/dashboard/email/logs"
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ChevronLeft className="size-3.5" />
                    Logs
                </Link>
                <LogDetailHeader log={log} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div
                    className="animate-fade-up space-y-6 lg:col-span-2"
                    style={{
                        animationDelay: "100ms",
                        animationFillMode: "both",
                    }}
                >
                    {log.errorMessage && (
                        <LogErrorBanner message={log.errorMessage} />
                    )}
                    <LogMetaGrid log={log} />
                    <LogTimeline events={log.events} />
                    {log.webhookAttempts.length > 0 && (
                        <LogWebhookAttempts attempts={log.webhookAttempts} />
                    )}
                    <LogRequestPayload log={log} />
                </div>

                <div
                    className="animate-fade-up lg:col-span-1"
                    style={{
                        animationDelay: "150ms",
                        animationFillMode: "both",
                    }}
                >
                    <LogEmailPreviewCard log={log} />
                </div>
            </div>
        </div>
    );
}
