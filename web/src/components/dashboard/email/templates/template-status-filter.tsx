import { cn } from "@/lib/utils";
import type { TemplateStatus } from "./types";

const STATUSES: (TemplateStatus | "all")[] = ["all", "published", "draft"];

export function TemplateStatusFilter({
    value,
    onChange,
}: {
    value: TemplateStatus | "all";
    onChange: (value: TemplateStatus | "all") => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1 py-1.5">
            {STATUSES.map((status) => {
                const selected = value === status;
                const label =
                    status === "all"
                        ? "All"
                        : status === "published"
                          ? "Published"
                          : "Draft";
                return (
                    <button
                        key={status}
                        type="button"
                        onClick={() => onChange(status)}
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
    );
}
