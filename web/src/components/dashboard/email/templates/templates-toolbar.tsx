import { TemplateSearchInput } from "./template-search-input";
import { TemplateFilters } from "./template-filters";
import { TemplateViewToggle } from "./template-view-toggle";
import { NewTemplateButton } from "./new-template-button";
import type {
    TemplateCategory,
    TemplateStatus,
    TemplateViewMode,
} from "./types";

interface TemplatesToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    category: TemplateCategory | "all";
    onCategoryChange: (value: TemplateCategory | "all") => void;
    status: TemplateStatus | "all";
    onStatusChange: (value: TemplateStatus | "all") => void;
    view: TemplateViewMode;
    onViewChange: (value: TemplateViewMode) => void;
}

export function TemplatesToolbar({
    search,
    onSearchChange,
    category,
    onCategoryChange,
    status,
    onStatusChange,
    view,
    onViewChange,
}: TemplatesToolbarProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <TemplateSearchInput value={search} onChange={onSearchChange} />
                <div className="flex items-center gap-2 sm:ml-auto">
                    <TemplateViewToggle value={view} onChange={onViewChange} />
                    <NewTemplateButton />
                </div>
            </div>
            <TemplateFilters
                category={category}
                onCategoryChange={onCategoryChange}
                status={status}
                onStatusChange={onStatusChange}
            />
        </div>
    );
}
