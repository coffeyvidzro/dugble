"use client";

import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  /** Optional leading mark, e.g. a status dot. */
  mark?: ReactNode;
  /** Renders the label in mono (IDs, sender names). */
  mono?: boolean;
};

/**
 * Compact "Label: Value" filter trigger with a checkable menu. The trigger
 * is emphasized when the value differs from `defaultValue`.
 */
export function FilterDropdown<T extends string>({
  label,
  icon: Icon,
  value,
  defaultValue,
  options,
  onChange,
  menuWidth = "w-56",
}: {
  label: string;
  icon?: LucideIcon;
  value: T;
  defaultValue: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
  menuWidth?: string;
}) {
  const selected = options.find((option) => option.value === value);
  const isActive = value !== defaultValue;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}: ${selected?.label ?? value}`}
        className={cn(
          "inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-lg border bg-background px-3 text-[13px] transition-colors hover:bg-muted/50 data-popup-open:bg-muted/50",
          isActive && "border-foreground/25",
        )}
      >
        {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
        <span className="text-muted-foreground">{label}:</span>
        {selected?.mark}
        <span
          className={cn(
            "max-w-36 truncate font-medium text-foreground",
            selected?.mono && "font-mono",
          )}
        >
          {selected?.label ?? value}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "max-h-80 overflow-y-auto bg-popover mask-none [-webkit-mask-image:none]",
          menuWidth,
        )}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center gap-2"
          >
            {option.mark}
            <span className={cn("flex-1 truncate", option.mono && "font-mono")}>
              {option.label}
            </span>
            {option.value === value && (
              <Check className="size-3.5 shrink-0 text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
