"use client";

import { Check, ChevronDown, Layers } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
    CATEGORY_CONFIG,
    TEMPLATE_CATEGORIES,
    type TemplateCategory,
} from "./types";

export function TemplateCategoryFilterSelect({
    value,
    onChange,
}: {
    value: TemplateCategory | "all";
    onChange: (value: TemplateCategory | "all") => void;
}) {
    const selectedConfig = value === "all" ? null : CATEGORY_CONFIG[value];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Filter by category"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
            >
                {selectedConfig ? (
                    <span
                        className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            selectedConfig.dotClass,
                        )}
                    />
                ) : (
                    <Layers className="size-3.5 text-muted-foreground" />
                )}
                <span className="max-w-32 truncate">
                    {selectedConfig ? selectedConfig.label : "All Categories"}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="max-h-80 w-52 overflow-y-auto bg-popover mask-none [-webkit-mask-image:none]"
            >
                <DropdownMenuItem
                    onClick={() => onChange("all")}
                    className="flex items-center gap-2"
                >
                    <Layers className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1">All Categories</span>
                    {value === "all" && (
                        <Check className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                </DropdownMenuItem>
                {TEMPLATE_CATEGORIES.map((category) => {
                    const config = CATEGORY_CONFIG[category];
                    const selected = value === category;
                    return (
                        <DropdownMenuItem
                            key={category}
                            onClick={() => onChange(category)}
                            className="flex items-center gap-2"
                        >
                            <span
                                className={cn(
                                    "size-1.5 shrink-0 rounded-full",
                                    config.dotClass,
                                )}
                            />
                            <span className="flex-1">{config.label}</span>
                            {selected && (
                                <Check className="size-3.5 shrink-0 text-muted-foreground" />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
