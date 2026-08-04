"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateViewMode } from "./types";

export function TemplateViewToggle({
    value,
    onChange,
}: {
    value: TemplateViewMode;
    onChange: (value: TemplateViewMode) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
            <button
                type="button"
                onClick={() => onChange("grid")}
                aria-pressed={value === "grid"}
                aria-label="Grid view"
                className={cn(
                    "rounded-md p-1.5 transition-all",
                    value === "grid"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                )}
            >
                <LayoutGrid className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => onChange("list")}
                aria-pressed={value === "list"}
                aria-label="List view"
                className={cn(
                    "rounded-md p-1.5 transition-all",
                    value === "list"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                )}
            >
                <List className="size-4" />
            </button>
        </div>
    );
}
