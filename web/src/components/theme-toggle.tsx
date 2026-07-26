"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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
          <label
            key={option.value}
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors",
              active ? "bg-muted text-signal" : "hover:text-foreground",
            )}
          >
            <input
              type="radio"
              name="theme"
              value={option.value}
              checked={active}
              onChange={() => setTheme(option.value)}
              aria-label={option.label}
              className="peer sr-only"
            />
            <option.icon className="size-3.5" />
          </label>
        );
      })}
    </div>
  );
}
