"use client";

import { useState } from "react";

import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyField({
    label,
    value,
    mono = true,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/10 px-4 py-3">
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p
                    className={cn(
                        "truncate text-sm text-foreground",
                        mono && "font-mono",
                    )}
                >
                    {value}
                </p>
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className={cn(
                    "h-7 shrink-0 px-2 text-xs transition-colors",
                    copied && "text-signal",
                )}
            >
                {copied ? (
                    <Check className="mr-1.5 size-3.5" />
                ) : (
                    <Copy className="mr-1.5 size-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
            </Button>
        </div>
    );
}
