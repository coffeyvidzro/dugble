"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { WEBHOOK_EVENT_GROUPS } from "./types";

export function EventsMultiSelect({
    value,
    onChange,
    error,
}: {
    value: string[];
    onChange: (next: string[]) => void;
    error?: string | null;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event: PointerEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () =>
            document.removeEventListener("pointerdown", handlePointerDown);
    }, [open]);

    const filteredGroups = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return WEBHOOK_EVENT_GROUPS;
        return WEBHOOK_EVENT_GROUPS.map((group) => ({
            ...group,
            events: group.events.filter((event) =>
                event.toLowerCase().includes(q),
            ),
        })).filter((group) => group.events.length > 0);
    }, [query]);

    function toggleEvent(event: string) {
        onChange(
            value.includes(event)
                ? value.filter((e) => e !== event)
                : [...value, event],
        );
    }

    function toggleGroup(events: string[]) {
        const allSelected = events.every((e) => value.includes(e));
        onChange(
            allSelected
                ? value.filter((e) => !events.includes(e))
                : [...new Set([...value, ...events])],
        );
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                className={cn(
                    "flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50",
                    error ? "border-danger/50" : "border-input",
                )}
            >
                <span
                    className={cn(
                        value.length === 0 && "text-muted-foreground",
                    )}
                >
                    {value.length === 0
                        ? "Select events to listen"
                        : `${value.length} event${value.length === 1 ? "" : "s"} selected`}
                </span>
                <ChevronDown
                    className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>

            {value.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {value.map((event) => (
                        <span
                            key={event}
                            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-mono text-xs text-foreground"
                        >
                            {event}
                            <button
                                type="button"
                                onClick={() => toggleEvent(event)}
                                className="text-muted-foreground transition-colors hover:text-danger"
                                aria-label={`Remove ${event}`}
                            >
                                <X className="size-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {open && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-border/60 bg-popover shadow-lg animate-fade-up">
                    <div className="border-b border-border/40 p-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search events"
                                className="h-8 bg-background pl-8 text-sm"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-2">
                        {filteredGroups.length === 0 ? (
                            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                                No events match &ldquo;{query}&rdquo;.
                            </p>
                        ) : (
                            filteredGroups.map((group) => {
                                const allSelected = group.events.every((e) =>
                                    value.includes(e),
                                );
                                return (
                                    <div
                                        key={group.id}
                                        className="mb-3 last:mb-0"
                                    >
                                        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/40">
                                            <Checkbox
                                                checked={allSelected}
                                                onCheckedChange={() =>
                                                    toggleGroup(group.events)
                                                }
                                            />
                                            {group.label}
                                        </label>
                                        {group.events.map((event) => (
                                            <label
                                                key={event}
                                                className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 pl-7 pr-2 text-sm transition-colors hover:bg-muted/40"
                                            >
                                                <Checkbox
                                                    checked={value.includes(
                                                        event,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleEvent(event)
                                                    }
                                                />
                                                <span className="font-mono text-xs text-foreground">
                                                    {event}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-3 py-2">
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Clear all
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-1.5 text-xs font-medium text-danger animate-fade-up">
                    {error}
                </p>
            )}
        </div>
    );
}
