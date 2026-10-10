import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format-date";
import type { TemplateListItem } from "@/types/template-api";
import { TemplateActionsMenu } from "./template-actions-menu";
import { TemplateCategoryBadge } from "./template-category-badge";
import { TemplatePreviewThumbnail } from "./template-preview-thumbnail";
import { TemplateStatusBadge } from "./template-status-badge";

export function TemplateCard({ template }: { template: TemplateListItem }) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all">
      <Link
        href={`/dashboard/email/templates/${template.id}`}
        className="block p-3 pb-0"
      >
        <TemplatePreviewThumbnail category={template.category} />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/dashboard/email/templates/${template.id}`}
            className="min-w-0 flex-1"
          >
            <h3 className="truncate font-heading text-base font-medium text-foreground transition-colors group-hover:text-primary">
              {template.name}
            </h3>
            {template.alias && (
              <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                {template.alias}
              </p>
            )}
          </Link>
          <TemplateActionsMenu template={template} />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <TemplateCategoryBadge category={template.category} />
            <TemplateStatusBadge status={template.status} />
          </div>
          <span
            className="text-xs text-muted-foreground"
            suppressHydrationWarning
          >
            {formatRelativeTime(template.updated_at)}
          </span>
        </div>
      </div>
    </Card>
  );
}
