import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { EmailStatusBadge } from "../email-dashboard/email-status-badge";
import { TemplateCategoryBadge } from "../templates/template-category-badge";
import { LogStatusCodeBadge } from "./log-status-code-badge";
import { LogRowActions } from "./log-row-actions";
import { formatRelativeTime } from "../email-dashboard/types";
import type { LogEntry } from "./types";

export function LogTableRow({ log }: { log: LogEntry }) {
    return (
        <TableRow className="border-b border-border/40 last:border-0">
            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {formatRelativeTime(log.createdAt)}
            </TableCell>
            <TableCell className="max-w-64">
                <Link
                    href={`/dashboard/email/logs/${log.id}`}
                    className="block"
                >
                    <p className="truncate text-sm font-medium text-foreground transition-colors hover:text-primary">
                        {log.to}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {log.subject}
                    </p>
                </Link>
            </TableCell>
            <TableCell>
                <TemplateCategoryBadge category={log.category} />
            </TableCell>
            <TableCell>
                <EmailStatusBadge status={log.deliveryStatus} />
            </TableCell>
            <TableCell>
                <LogStatusCodeBadge code={log.statusCode} />
            </TableCell>
            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {log.latencyMs}ms
            </TableCell>
            <TableCell className="text-right">
                <LogRowActions log={log} />
            </TableCell>
        </TableRow>
    );
}
