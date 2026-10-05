// src/components/dashboard/email/templates/template-list-row.tsx

import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatRelativeTime } from "@/lib/format-date";
import type { TemplateListItem } from "@/types/template-api";
import { TemplateActionsMenu } from "./template-actions-menu";
import { TemplateCategoryBadge } from "./template-category-badge";
import { TemplateStatusBadge } from "./template-status-badge";

export function TemplateListRow({ template }: { template: TemplateListItem }) {
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
          {template.alias && (
            <p className="line-clamp-1 font-mono text-xs text-muted-foreground">
              {template.alias}
            </p>
          )}
        </Link>
      </TableCell>
      <TableCell>
        <TemplateCategoryBadge category={template.category} />
      </TableCell>
      <TableCell>
        <TemplateStatusBadge status={template.status} />
      </TableCell>
      <TableCell
        className="text-xs text-muted-foreground"
        suppressHydrationWarning
      >
        {formatRelativeTime(template.updated_at)}
      </TableCell>
      <TableCell className="text-right">
        <TemplateActionsMenu template={template} />
      </TableCell>
    </TableRow>
  );
}
