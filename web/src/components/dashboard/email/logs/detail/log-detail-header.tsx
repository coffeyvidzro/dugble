import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EmailStatusBadge } from "../../email-dashboard/email-status-badge";
import { TemplateCategoryBadge } from "../../templates/template-category-badge";
import { formatDate } from "../../email-dashboard/types";
import { LogStatusCodeBadge } from "../log-status-code-badge";
import { CopyButton } from "../copy-button";
import type { LogEntry } from "../types";

export function LogDetailHeader({ log }: { log: LogEntry }) {
    return (
        <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1.5">
                <h1 className="truncate font-heading text-xl font-semibold text-foreground">
                    {log.subject}
                </h1>
                <p className="text-sm text-muted-foreground">
                    To{" "}
                    <span className="font-medium text-foreground">
                        {log.to}
                    </span>
                    {" · From "}
                    <span className="font-medium text-foreground">
                        {log.from}
                    </span>
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    <TemplateCategoryBadge category={log.category} />
                    <EmailStatusBadge status={log.deliveryStatus} />
                    <LogStatusCodeBadge code={log.statusCode} />
                </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
                <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5">
                    <span className="font-mono text-xs text-muted-foreground">
                        {log.requestId}
                    </span>
                    <CopyButton value={log.requestId} label="request ID" />
                </div>
                <p className="text-xs text-muted-foreground">
                    {formatDate(log.createdAt)}
                </p>
                <Link
                    href={`/dashboard/email/templates/${log.templateId}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
                >
                    {log.templateName}
                    <ArrowUpRight className="size-3" />
                </Link>
            </div>
        </div>
    );
}
