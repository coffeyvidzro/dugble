"use client";

import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PreviewViewport } from "./editor-types";

export function DeviceToggle({
    value,
    onChange,
}: {
    value: PreviewViewport;
    onChange: (value: PreviewViewport) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
            <button
                type="button"
                onClick={() => onChange("desktop")}
                aria-pressed={value === "desktop"}
                aria-label="Desktop preview"
                className={cn(
                    "rounded-md p-1.5 transition-all",
                    value === "desktop"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                )}
            >
                <Monitor className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => onChange("mobile")}
                aria-pressed={value === "mobile"}
                aria-label="Mobile preview"
                className={cn(
                    "rounded-md p-1.5 transition-all",
                    value === "mobile"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                )}
            >
                <Smartphone className="size-4" />
            </button>
        </div>
    );
}
