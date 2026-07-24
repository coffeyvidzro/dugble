"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

function openCommandPalette() {
    window.dispatchEvent(new Event("dugble:open-command-palette"));
}

export function SearchTrigger({ className }: { className?: string }) {
    return (
        <button
            type="button"
            onClick={openCommandPalette}
            className={cn(
                "group/button relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-full border bg-background px-3.5 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20",
                className,
            )}
        >
            <Search className="size-3.5" />
            Search
            <kbd className="ml-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
            </kbd>
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
            />
        </button>
    );
}

export function SearchHintText({ className }: { className?: string }) {
    return (
        <button
            type="button"
            onClick={openCommandPalette}
            className={cn(
                "inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                className,
            )}
        >
            Press
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground/80">
                ⌘K
            </kbd>
            to search
        </button>
    );
}
