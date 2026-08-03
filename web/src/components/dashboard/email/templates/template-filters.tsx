"use client";

import { cn } from "@/lib/utils";

import {
    CATEGORY_CONFIG,
    TEMPLATE_CATEGORIES,
    type TemplateCategory,
    type TemplateStatus,
} from "./types";

const CATEGORIES: (TemplateCategory | "all")[] = [
    "all",
    ...TEMPLATE_CATEGORIES,
];

const STATUSES: (TemplateStatus | "all")[] = ["all", "published", "draft"];

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
            <div className="flex flex-wrap items-center gap-1.5">
                {CATEGORIES.map((value) => {
                    const selected = category === value;
                    const label =
                        value === "all" ? "All" : CATEGORY_CONFIG[value].label;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onCategoryChange(value)}
                            aria-pressed={selected}
                            className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                                selected
                                    ? "border-foreground/20 bg-foreground text-background"
                                    : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
                {STATUSES.map((value) => {
                    const selected = status === value;
                    const label =
                        value === "all"
                            ? "All"
                            : value === "published"
                              ? "Published"
                              : "Draft";
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => onStatusChange(value)}
                            aria-pressed={selected}
                            className={cn(
                                "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                                selected
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
