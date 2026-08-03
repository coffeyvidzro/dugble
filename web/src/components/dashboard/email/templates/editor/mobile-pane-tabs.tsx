"use client";

import { cn } from "@/lib/utils";
import type { MobilePane } from "./editor-types";

export function MobilePaneTabs({
    value,
    onChange,
}: {
    value: MobilePane;
    onChange: (value: MobilePane) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1 lg:hidden">
            {(["code", "preview"] as const).map((pane) => (
                <button
                    key={pane}
                    type="button"
                    onClick={() => onChange(pane)}
                    aria-pressed={value === pane}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all",
                        value === pane
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    {pane}
                </button>
            ))}
        </div>
    );
}
