"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
    value,
    label,
    className,
}: {
    value: string;
    label?: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {}
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={label ? `Copy ${label}` : "Copy to clipboard"}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
                className,
            )}
        >
            {copied ? (
                <Check className="size-3.5 text-signal" />
            ) : (
                <Copy className="size-3.5" />
            )}
        </button>
    );
}
