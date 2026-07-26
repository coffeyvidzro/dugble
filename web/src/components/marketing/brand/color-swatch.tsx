"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ColorSwatch({
  name,
  hex,
  swatchClassName,
  usage,
}: {
  name: string;
  hex: string;
  swatchClassName: string;
  usage: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy color hex to clipboard:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex items-center gap-3 rounded-xl border bg-card/60 p-3 text-left transition-colors hover:border-foreground/25"
    >
      <span
        className={cn("size-10 shrink-0 rounded-lg border", swatchClassName)}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {usage}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
        {hex}
        {copied ? (
          <Check className="size-3.5 text-signal" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </span>
    </button>
  );
}
