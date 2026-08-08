"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
    value,
    className,
    label = "Copy to clipboard",
}: {
    value: string;
    className?: string;
    label?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            // Clipboard permission denied or unavailable — fail silently.
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : label}
            className={cn(
                "inline-flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
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
