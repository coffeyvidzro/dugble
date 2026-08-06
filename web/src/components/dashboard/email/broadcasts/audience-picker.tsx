import { Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { AUDIENCES } from "./types";

export function AudiencePicker({
    selectedId,
    onSelect,
}: {
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {AUDIENCES.map((audience) => {
                const active = audience.id === selectedId;
                return (
                    <button
                        key={audience.id}
                        type="button"
                        onClick={() => onSelect(audience.id)}
                        className={cn(
                            "flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                            active
                                ? "border-primary/40 bg-primary/5"
                                : "border-border/50 bg-muted/10 hover:bg-muted/20",
                        )}
                    >
                        <div
                            className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                                active
                                    ? "border-primary/30 bg-primary/10 text-primary"
                                    : "border-border/50 bg-muted/30 text-muted-foreground",
                            )}
                        >
                            <Users className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                                {audience.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {audience.description}
                            </p>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground/70">
                                {audience.recipientCount.toLocaleString(
                                    "en-US",
                                )}{" "}
                                recipients
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
