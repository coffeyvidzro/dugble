"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
    { value: "light", label: "Light theme", icon: Sun },
    { value: "system", label: "System theme", icon: Monitor },
    { value: "dark", label: "Dark theme", icon: Moon },
] as const;

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <div
            role="radiogroup"
            aria-label="Theme"
            className="inline-flex items-center gap-0.5 rounded-full border bg-background p-0.5"
        >
            {options.map((option) => {
                const active = mounted && theme === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={option.label}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                            "flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors",
                            active
                                ? "bg-muted text-signal"
                                : "hover:text-foreground",
                        )}
                    >
                        <option.icon className="size-3.5" />
                    </button>
                );
            })}
        </div>
    );
}
