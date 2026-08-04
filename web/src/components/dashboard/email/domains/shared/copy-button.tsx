"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
    value,
    label,
}: {
    value: string;
    label?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Clipboard API: TODO: Handle error 👌
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={label ? `Copy ${label}` : "Copy value"}
            className={cn(
                "inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-border/50 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground",
                copied && "border-signal/40 text-signal",
            )}
        >
            {copied ? (
                <Check className="size-3" />
            ) : (
                <Copy className="size-3" />
            )}
        </button>
    );
}
