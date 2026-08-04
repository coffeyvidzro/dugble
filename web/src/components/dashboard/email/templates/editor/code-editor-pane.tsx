"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorPaneProps {
    value: string;
    onChange: (value: string) => void;
    isHiddenOnMobile: boolean;
}

export const CodeEditorPane = forwardRef<
    HTMLTextAreaElement,
    CodeEditorPaneProps
>(function CodeEditorPane({ value, onChange, isHiddenOnMobile }, ref) {
    return (
        <div
            className={cn(
                "min-w-0 flex-col",
                isHiddenOnMobile ? "hidden lg:flex" : "flex",
            )}
        >
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/10 px-4 py-2">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                    HTML source
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                    {value.length.toLocaleString()} chars
                </span>
            </div>
            <textarea
                ref={ref}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                aria-label="Template HTML source"
                className="min-w-0 flex-1 min-h-64 w-full resize-none whitespace-pre-wrap wrap-break-word bg-transparent p-4 font-mono text-xs leading-relaxed text-foreground focus:outline-none"
            />
        </div>
    );
});
