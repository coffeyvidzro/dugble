"use client";

import { useEffect, useRef, useState } from "react";

import { KeyRound, Laptop2, ScrollText, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

export type SecurityTabValue =
    | "authentication"
    | "sessions"
    | "advanced"
    | "activity";

const TABS: {
    value: SecurityTabValue;
    label: string;
    icon: typeof KeyRound;
}[] = [
    { value: "authentication", label: "Authentication", icon: KeyRound },
    { value: "sessions", label: "Sessions", icon: Laptop2 },
    { value: "advanced", label: "Advanced", icon: SlidersHorizontal },
    { value: "activity", label: "Activity", icon: ScrollText },
];

export function SecurityTabBar({
    value,
    onValueChange,
    sessionCount,
}: {
    value: SecurityTabValue;
    onValueChange: (value: SecurityTabValue) => void;
    sessionCount: number;
}) {
    const listRef = useRef<HTMLDivElement>(null);
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLButtonElement>(
            `[data-tab="${value}"]`,
        );
        if (el) {
            setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
        }
    }, [value]);

    return (
        <div className="relative border-b border-border/40">
            <div
                ref={listRef}
                role="tablist"
                className="flex gap-1 overflow-x-auto"
            >
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = tab.value === value;
                    return (
                        <button
                            key={tab.value}
                            data-tab={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => onValueChange(tab.value)}
                            className={cn(
                                "flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                                active
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <Icon className="size-4" />
                            {tab.label}
                            {tab.value === "sessions" && sessionCount > 0 && (
                                <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                    {sessionCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            <div
                aria-hidden="true"
                className="absolute bottom-0 h-0.5 rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ left: indicator.left, width: indicator.width }}
            />
        </div>
    );
}
