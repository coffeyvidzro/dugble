"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({
    value,
    label = "Copy",
    copiedLabel = "Copied",
    className,
}: {
    value: string;
    label?: string;
    copiedLabel?: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Button
            type="button"
            variant={copied ? "default" : "secondary"}
            onClick={handleCopy}
            className={cn(
                "shrink-0 transition-all",
                copied && "bg-signal text-white hover:bg-signal/90",
                className,
            )}
        >
            {copied ? (
                <Check className="mr-2 size-4" />
            ) : (
                <Copy className="mr-2 size-4" />
            )}
            {copied ? copiedLabel : label}
        </Button>
    );
}
