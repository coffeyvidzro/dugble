"use client";

import { useEffect, useRef, useState } from "react";

import { CreditCard, Landmark, Receipt, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

export type WalletTabValue = "top_up" | "manual" | "transactions" | "settings";

const TABS: {
    value: WalletTabValue;
    label: string;
    icon: typeof CreditCard;
}[] = [
    { value: "top_up", label: "Top Up", icon: CreditCard },
    { value: "manual", label: "Manual Payment", icon: Landmark },
    { value: "transactions", label: "Transactions", icon: Receipt },
    { value: "settings", label: "Settings", icon: SlidersHorizontal },
];

export function WalletTabBar({
    value,
    onValueChange,
}: {
    value: WalletTabValue;
    onValueChange: (value: WalletTabValue) => void;
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
