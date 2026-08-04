import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG, type TemplateCategory } from "./types";

export function TemplateCategoryBadge({
    category,
}: {
    category: TemplateCategory;
}) {
    const { label, dotClass } = CATEGORY_CONFIG[category];

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground">
            <span className={cn("size-1.5 rounded-full", dotClass)} />
            {label}
        </span>
    );
}
