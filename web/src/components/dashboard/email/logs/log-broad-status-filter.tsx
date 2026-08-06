"use client";

import { cn } from "@/lib/utils";
import type { LogStatusFilterValue } from "./types";

const BROAD_OPTIONS: {
    value: "all" | "success" | "client_error";
    label: string;
}[] = [
    { value: "all", label: "All" },
    { value: "success", label: "Success" },
    { value: "client_error", label: "Errors" },
];

export function LogBroadStatusFilter({
    value,
    onChange,
}: {
    value: LogStatusFilterValue;
    onChange: (value: LogStatusFilterValue) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
            {BROAD_OPTIONS.map((option) => {
                const selected = value === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        aria-pressed={selected}
                        className={cn(
                            "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                            selected
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
