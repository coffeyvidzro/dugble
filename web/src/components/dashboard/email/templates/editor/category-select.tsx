"use client";

import { Check, ChevronDown, Tag } from "lucide-react";
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
} from "../types";

export function CategorySelect({
    value,
    onChange,
}: {
    value: TemplateCategory;
    onChange: (value: TemplateCategory) => void;
}) {
    const current = CATEGORY_CONFIG[value];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Change template category"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
            >
                <Tag className="size-3.5 text-muted-foreground" />
                <span
                    className={cn("size-1.5 rounded-full", current.dotClass)}
                />
                {current.label}
                <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
                {TEMPLATE_CATEGORIES.map((category) => {
                    const config = CATEGORY_CONFIG[category];
                    const selected = category === value;
                    return (
                        <DropdownMenuItem
                            key={category}
                            onClick={() => onChange(category)}
                            className="flex items-center gap-2"
                        >
                            <span
                                className={cn(
                                    "size-1.5 rounded-full",
                                    config.dotClass,
                                )}
                            />
                            <span className="flex-1">{config.label}</span>
                            {selected && (
                                <Check className="size-3.5 text-muted-foreground" />
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
