"use client";

import { useState } from "react";

import type { TechnicalCodeExample } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { cn } from "@/lib/utils";

export function CapabilityCodeTabs({
    examples,
}: {
    examples: TechnicalCodeExample[];
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const active = examples[activeIndex];

    if (!active) return null;

    return (
        <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex items-center gap-1 overflow-x-auto border-b px-2 pt-2 no-scrollbar">
                {examples.map((example, index) => (
                    <button
                        key={example.label}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-pressed={index === activeIndex}
                        className={cn(
                            "shrink-0 rounded-t-lg px-3.5 py-2 font-mono text-xs transition-colors",
                            index === activeIndex
                                ? "border-x border-t border-border bg-background text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {example.label}
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-between px-4 pt-3 font-mono text-[11px] text-muted-foreground">
                <span>{active.filename}</span>
                <span className="text-signal">example</span>
            </div>
            <pre className="min-h-60 overflow-x-auto p-4 font-mono text-[13px] leading-6 text-foreground/90">
                {active.code}
            </pre>
        </div>
    );
}
