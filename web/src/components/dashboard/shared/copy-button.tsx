// src/components/dashboard/shared/copy-button.tsx

"use client";

import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

type CopyButtonVariant = "ghost" | "outline";

const VARIANT_CLASSES: Record<
  CopyButtonVariant,
  { base: string; copied: string }
> = {
  ghost: {
    base: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
    copied: "text-signal",
  },
  outline: {
    base: "border border-border/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
    copied: "border-signal/40 text-signal",
  },
};

type CopyButtonProps = {
  value: string;
  /** What is being copied, e.g. "record value" → aria-label "Copy record value". */
  label?: string;
  variant?: CopyButtonVariant;
  className?: string;
};

/** Icon-only copy control. */
export function CopyButton({
  value,
  label,
  variant = "ghost",
  className,
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  const styles = VARIANT_CLASSES[variant];

  return (
    <button
      type="button"
      onClick={() => void copy(value)}
      aria-label={
        copied ? "Copied" : label ? `Copy ${label}` : "Copy to clipboard"
      }
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
        styles.base,
        copied && styles.copied,
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}
