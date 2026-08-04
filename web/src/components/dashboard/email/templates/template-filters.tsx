import { TemplateCategoryFilterSelect } from "./template-category-filter-select";
import { TemplateStatusFilter } from "./template-status-filter";
import type { TemplateCategory, TemplateStatus } from "./types";

interface TemplateFiltersProps {
    category: TemplateCategory | "all";
    onCategoryChange: (value: TemplateCategory | "all") => void;
    status: TemplateStatus | "all";
    onStatusChange: (value: TemplateStatus | "all") => void;
}

export function TemplateFilters({
    category,
    onCategoryChange,
    status,
    onStatusChange,
}: TemplateFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <TemplateCategoryFilterSelect
                value={category}
                onChange={onCategoryChange}
            />
            <TemplateStatusFilter value={status} onChange={onStatusChange} />
        </div>
    );
}
