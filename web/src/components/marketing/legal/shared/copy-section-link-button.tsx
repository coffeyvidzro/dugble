"use client";

import { Check, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function CopySectionLinkButton({ sectionId }: { sectionId: string }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {}
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy link to this section"
            className={cn(
                "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-signal focus-visible:opacity-100 group-hover:opacity-100",
                copied && "opacity-100 text-signal",
            )}
        >
            {copied ? (
                <Check className="size-3.5" />
            ) : (
                <LinkIcon className="size-3.5" />
            )}
        </button>
    );
}
