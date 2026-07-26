"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, SearchX } from "lucide-react";

export type SiteLink = {
    group: string;
    title: string;
    description?: string;
    href: string;
};

const GROUP_ORDER = [
    "Features",
    "Resources",
    "Company",
    "Legal",
    "Account",
    "Blog",
];

export function SitemapExplorer({ links }: { links: SiteLink[] }) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const items = q
            ? links.filter(
                  (link) =>
                      link.title.toLowerCase().includes(q) ||
                      link.description?.toLowerCase().includes(q),
              )
            : links;

        return GROUP_ORDER.map((group) => ({
            group,
            items: items.filter((link) => link.group === group),
        })).filter((section) => section.items.length > 0);
    }, [query, links]);

    const total = filtered.reduce((n, section) => n + section.items.length, 0);

    return (
        <div className="space-y-8">
            <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-0 flex h-11 w-4 items-center text-muted-foreground" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter pages…"
                    className="h-11 w-full rounded-xl border bg-card/60 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-signal/40"
                />
            </div>

            {total === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card/60 px-6 py-16 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full border bg-background text-muted-foreground">
                        <SearchX className="size-4" />
                    </div>
                    <p className="text-sm font-medium">
                        No pages match &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Try a different term, or browse everything below by
                        clearing the filter.
                    </p>
                </div>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2">
                    {filtered.map((section) => (
                        <div key={section.group} className="space-y-3">
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                {section.group}
                            </p>
                            <ul className="space-y-1.5">
                                {section.items.map((link) => (
                                    <li key={link.href + link.title}>
                                        <Link
                                            href={link.href}
                                            className="group flex items-start justify-between gap-3 rounded-xl border bg-card/60 px-4 py-3 transition-colors hover:border-signal/40"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {link.title}
                                                </p>
                                                {link.description && (
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {link.description}
                                                    </p>
                                                )}
                                            </div>
                                            <ArrowRight className="mt-1 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
