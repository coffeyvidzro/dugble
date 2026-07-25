"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Command, CornerDownLeft, SearchX, X, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { commandItems, type CommandItem } from "./command-palette-data";
import { cn } from "@/lib/utils";

const GROUP_ORDER: CommandItem["group"][] = [
    "Features",
    "Resources",
    "Recent updates",
    "Company",
    "Legal",
    "Account",
];

function matchScore(item: CommandItem, query: string): number {
    const q = query.toLowerCase().trim();
    if (!q) return 0;

    const title = item.title.toLowerCase();
    if (title === q) return 0;
    if (title.startsWith(q)) return 1;
    if (title.includes(q)) return 2;
    if ((item.keywords ?? []).some((k) => k.toLowerCase().includes(q)))
        return 3;
    return -1;
}

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const results = useMemo(() => {
        const filtered = query.trim()
            ? commandItems
                  .map((item) => ({ item, score: matchScore(item, query) }))
                  .filter((x) => x.score >= 0)
                  .sort((a, b) => a.score - b.score)
                  .map((x) => x.item)
            : commandItems;

        return GROUP_ORDER.map((group) => ({
            group,
            items: filtered.filter((item) => item.group === group),
        })).filter((section) => section.items.length > 0);
    }, [query]);

    const flatResults = useMemo(
        () => results.flatMap((section) => section.items),
        [results],
    );

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        const onOpenEvent = () => setOpen(true);
        window.addEventListener("dugble:open-command-palette", onOpenEvent);
        return () =>
            window.removeEventListener(
                "dugble:open-command-palette",
                onOpenEvent,
            );
    }, []);

    useEffect(() => {
        if (open) {
            setQuery("");
            setActiveIndex(0);
            document.body.style.overflow = "hidden";
            const t = setTimeout(() => inputRef.current?.focus(), 10);
            return () => clearTimeout(t);
        }
        document.body.style.overflow = "";
    }, [open]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Escape") {
            setOpen(false);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        }
        if (e.key === "Enter") {
            const item = flatResults[activeIndex];
            if (item) window.location.href = item.href;
        }
    }

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="fixed inset-0 z-100 flex justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
            onClick={() => setOpen(false)}
        >
            <div
                className="h-fit w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/50"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={onKeyDown}
            >
                <div className="flex items-center gap-3 border-b px-4">
                    <SearchIcon />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search pages, docs, updates…"
                        className="h-14 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close search"
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {flatResults.length === 0 ? (
                        <EmptyState query={query} />
                    ) : (
                        results.map((section) => (
                            <div
                                key={section.group}
                                className="py-2 first:pt-1"
                            >
                                <p className="px-3 pb-1.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                                    {section.group}
                                </p>
                                <div className="space-y-0.5">
                                    {section.items.map((item) => {
                                        const index = flatResults.indexOf(item);
                                        return (
                                            <a
                                                key={item.href + item.title}
                                                href={item.href}
                                                onMouseEnter={() =>
                                                    setActiveIndex(index)
                                                }
                                                className={cn(
                                                    "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors",
                                                    index === activeIndex
                                                        ? "bg-muted"
                                                        : "hover:bg-muted/60",
                                                )}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {item.title}
                                                    </p>
                                                    {item.description && (
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {index === activeIndex && (
                                                    <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />
                                                )}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex items-center gap-4 border-t px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <kbd className="rounded border bg-background px-1.5 py-0.5">
                            ↑↓
                        </kbd>
                        navigate
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="rounded border bg-background px-1.5 py-0.5">
                            ↵
                        </kbd>
                        select
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="rounded border bg-background px-1.5 py-0.5">
                            esc
                        </kbd>
                        close
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                        <Command className="size-3" />K to reopen
                    </span>
                </div>
            </div>
        </div>
    );
}

function SearchIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 shrink-0 text-muted-foreground"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

function EmptyState({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full border bg-background text-muted-foreground">
                <SearchX className="size-4" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium">
                    No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground">
                    Try a different term, or reach out if you can&apos;t find
                    what you need.
                </p>
            </div>
            <Link
                href="/contact"
                className="group inline-flex items-center font-mono text-xs text-signal hover:underline"
            >
                Contact support
                <ArrowRight className="ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
        </div>
    );
}
