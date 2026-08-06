import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmailStatusBadge } from "../email-dashboard/email-status-badge";
import { TemplateCategoryBadge } from "../templates/template-category-badge";
import { LogStatusCodeBadge } from "./log-status-code-badge";
import { LogRowActions } from "./log-row-actions";
import { formatRelativeTime } from "../email-dashboard/types";
import type { LogEntry } from "./types";

export function LogCardRow({ log }: { log: LogEntry }) {
    return (
        <Card className="border-border/40 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <Link
                    href={`/dashboard/email/logs/${log.id}`}
                    className="min-w-0 flex-1"
                >
                    <p className="truncate text-sm font-medium text-foreground">
                        {log.to}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {log.subject}
                    </p>
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(log.createdAt)}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                    <TemplateCategoryBadge category={log.category} />
                    <EmailStatusBadge status={log.deliveryStatus} />
                    <LogStatusCodeBadge code={log.statusCode} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                        {log.latencyMs}ms
                    </span>
                    <LogRowActions log={log} />
                </div>
            </div>
        </Card>
    );
}
