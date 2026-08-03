import Link from "next/link";

import { Send } from "lucide-react";

import { TemplatePreviewThumbnail } from "./template-preview-thumbnail";
import { TemplateCategoryBadge } from "./template-category-badge";
import { TemplateStatusBadge } from "./template-status-badge";
import { TemplateActionsMenu } from "./template-actions-menu";
import { formatRelativeTime } from "../email-dashboard/types";
import { Card } from "@/components/ui/card";
import type { EmailTemplate } from "./types";

export function TemplateCard({ template }: { template: EmailTemplate }) {
    return (
        <Card className="group flex flex-col overflow-hidden border-border/40 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
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
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                            {template.subject}
                        </p>
                    </Link>
                    <TemplateActionsMenu template={template} />
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {template.description}
                </p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <TemplateCategoryBadge category={template.category} />
                        <TemplateStatusBadge status={template.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <Send className="size-3" />
                            {template.sentLast30d.toLocaleString()}
                        </span>
                        <span suppressHydrationWarning>
                            {formatRelativeTime(template.updatedAt)}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
