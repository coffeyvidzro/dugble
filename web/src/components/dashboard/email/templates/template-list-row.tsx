import Link from "next/link";

import { TemplateCategoryBadge } from "./template-category-badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { TemplateStatusBadge } from "./template-status-badge";
import { TemplateActionsMenu } from "./template-actions-menu";
import { formatRelativeTime } from "../email-dashboard/types";
import type { EmailTemplate } from "./types";

export function TemplateListRow({ template }: { template: EmailTemplate }) {
    return (
        <TableRow className="border-b border-border/40 last:border-0">
            <TableCell>
                <Link
                    href={`/dashboard/email/templates/${template.id}`}
                    className="block"
                >
                    <p className="font-medium text-foreground transition-colors hover:text-primary">
                        {template.name}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                        {template.subject}
                    </p>
                </Link>
            </TableCell>
            <TableCell>
                <TemplateCategoryBadge category={template.category} />
            </TableCell>
            <TableCell>
                <TemplateStatusBadge status={template.status} />
            </TableCell>
            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {template.sentLast30d.toLocaleString()}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
                {formatRelativeTime(template.updatedAt)}
            </TableCell>
            <TableCell className="text-right">
                <TemplateActionsMenu template={template} />
            </TableCell>
        </TableRow>
    );
}
