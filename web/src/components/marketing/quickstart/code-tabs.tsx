"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Snippet = { label: string; code: string };

export function CodeTabs({ snippets }: { snippets: Snippet[] }) {
    const [active, setActive] = useState(0);

    return (
        <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center gap-1 overflow-x-auto border-b bg-muted/30 px-2 py-1.5">
                {snippets.map((snippet, i) => (
                    <button
                        key={snippet.label}
                        type="button"
                        onClick={() => setActive(i)}
                        className={cn(
                            "shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
                            i === active
                                ? "bg-background text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {snippet.label}
                    </button>
                ))}
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground/90">
                {snippets[active].code}
            </pre>
        </div>
    );
}
