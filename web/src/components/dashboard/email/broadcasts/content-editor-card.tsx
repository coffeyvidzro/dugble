"use client";

import { useRef, useState } from "react";

import {
    Bold,
    Eye,
    Heading2,
    Italic,
    Link2,
    List,
    Pencil,
    PenSquare,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ContentPreview } from "./content-preview";

type WrapSyntax = { prefix: string; suffix: string; placeholder: string };

const TOOLBAR_ACTIONS: {
    icon: typeof Bold;
    label: string;
    syntax: WrapSyntax;
}[] = [
    {
        icon: Bold,
        label: "Bold",
        syntax: { prefix: "**", suffix: "**", placeholder: "bold text" },
    },
    {
        icon: Italic,
        label: "Italic",
        syntax: { prefix: "_", suffix: "_", placeholder: "italic text" },
    },
    {
        icon: Heading2,
        label: "Heading",
        syntax: { prefix: "## ", suffix: "", placeholder: "Heading" },
    },
    {
        icon: List,
        label: "Bullet list",
        syntax: { prefix: "- ", suffix: "", placeholder: "List item" },
    },
    {
        icon: Link2,
        label: "Link",
        syntax: {
            prefix: "[",
            suffix: "](https://)",
            placeholder: "link text",
        },
    },
];

export function ContentEditorCard({
    content,
    onChange,
}: {
    content: string;
    onChange: (value: string) => void;
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [mode, setMode] = useState<"write" | "preview">("write");

    function applySyntax({ prefix, suffix, placeholder }: WrapSyntax) {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.slice(start, end) || placeholder;
        const next =
            content.slice(0, start) +
            prefix +
            selected +
            suffix +
            content.slice(end);

        onChange(next);

        window.requestAnimationFrame(() => {
            textarea.focus();
            const cursor = start + prefix.length + selected.length;
            textarea.setSelectionRange(cursor, cursor);
        });
    }

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
                        <PenSquare className="size-4" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-xl">Content</CardTitle>
                        <CardDescription>
                            Write in Markdown. We&apos;ll format it for the
                            inbox.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
                        {TOOLBAR_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                onClick={() => applySyntax(action.syntax)}
                                aria-label={action.label}
                                title={action.label}
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground hover:shadow-sm"
                            >
                                <action.icon className="size-3.5" />
                            </button>
                        ))}
                    </div>

                    <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
                        <button
                            type="button"
                            onClick={() => setMode("write")}
                            aria-pressed={mode === "write"}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                                mode === "write"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <Pencil className="size-3.5" />
                            Write
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("preview")}
                            aria-pressed={mode === "preview"}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                                mode === "preview"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <Eye className="size-3.5" />
                            Preview
                        </button>
                    </div>
                </div>

                {mode === "write" ? (
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder="Write your broadcast content in Markdown - **bold**, _italic_, ## headings, - lists, and [links](https://example.com)."
                        rows={12}
                        className="w-full resize-y rounded-lg border border-border bg-muted/20 p-3 font-mono text-sm text-foreground shadow-sm transition-colors focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                ) : (
                    <div className="min-h-72 rounded-lg border border-border/50 bg-muted/10 p-4">
                        <ContentPreview content={content} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
