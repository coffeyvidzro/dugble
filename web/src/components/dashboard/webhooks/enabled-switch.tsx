"use client";

import { Switch } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

/**
 * Small on/off switch (Base UI). While the mutation it triggers is running,
 * the thumb shows a spinner and the control is inert.
 */
export function EnabledSwitch({
  checked,
  pending = false,
  disabled = false,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  pending?: boolean;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={(next) => onCheckedChange(next)}
      disabled={disabled || pending}
      aria-label={label}
      aria-busy={pending || undefined}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-muted-foreground/30 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-signal/30 data-checked:bg-signal data-disabled:cursor-not-allowed",
        disabled && !pending && "opacity-50",
      )}
    >
      <Switch.Thumb className="flex size-4 translate-x-0.5 items-center justify-center rounded-full bg-background shadow-xs transition-transform duration-200 data-checked:translate-x-[18px]">
        {pending && (
          <span className="size-2.5 animate-spin rounded-full border-[1.5px] border-muted-foreground border-t-transparent" />
        )}
      </Switch.Thumb>
    </Switch.Root>
  );
}
