"use client";

import { Loader2 } from "lucide-react";
import type { TemplateStatus } from "../types";

interface EditorActionsProps {
    status: TemplateStatus;
    isSaving: boolean;
    onSaveDraft: () => void;
    onPublish: () => void;
}

export function EditorActions({
    status,
    isSaving,
    onSaveDraft,
    onPublish,
}: EditorActionsProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="rounded-full border border-border/60 px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
            >
                Save draft
            </button>
            <button
                type="button"
                onClick={onPublish}
                disabled={isSaving}
                className="group/button relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 disabled:pointer-events-none disabled:opacity-60 dark:hover:shadow-black/20"
            >
                {isSaving && <Loader2 className="size-3.5 animate-spin" />}
                {status === "published" ? "Save changes" : "Publish"}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
            </button>
        </div>
    );
}
