import { Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUDIENCE_SEGMENTS } from "./types";

export function StepAudience({
    value,
    onChange,
}: {
    value: string;
    onChange: (id: string) => void;
}) {
    return (
        <div className="space-y-3">
            {AUDIENCE_SEGMENTS.map((segment) => {
                const isSelected = segment.id === value;
                return (
                    <button
                        key={segment.id}
                        type="button"
                        onClick={() => onChange(segment.id)}
                        aria-pressed={isSelected}
                        className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition-all",
                            isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border/40 hover:border-border hover:bg-muted/20",
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={cn(
                                    "flex size-9 shrink-0 items-center justify-center rounded-md",
                                    isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/60 text-foreground",
                                )}
                            >
                                <Users className="size-4" />
                            </span>
                            <div>
                                <p className="font-medium text-foreground">{segment.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {segment.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <span className="font-mono text-sm text-muted-foreground">
                                {segment.size.toLocaleString()}
                            </span>
                            <span
                                className={cn(
                                    "flex size-5 items-center justify-center rounded-full border",
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border/60",
                                )}
                            >
                                {isSelected && <Check className="size-3" />}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
