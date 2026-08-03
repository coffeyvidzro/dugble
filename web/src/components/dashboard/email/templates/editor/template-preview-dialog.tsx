"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { InboxPreviewStrip } from "./inbox-preview-strip";
import { interpolateHtml, variablesForCategory } from "../template-content";
import type { EmailTemplate } from "../types";

export function TemplatePreviewDialog({
    template,
    open,
    onOpenChange,
}: {
    template: EmailTemplate;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const compiledHtml = interpolateHtml(
        template.htmlBody,
        variablesForCategory(template.category),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden border-border/40 p-0 shadow-xl sm:max-w-lg">
                <DialogHeader className="border-b border-border/40 px-6 pt-6 pb-4">
                    <DialogTitle>{template.name}</DialogTitle>
                </DialogHeader>
                <InboxPreviewStrip
                    subject={template.subject}
                    previewText={template.previewText}
                />
                <div className="max-h-[60vh] overflow-auto bg-muted/20 p-4 sm:p-6">
                    <iframe
                        title={`Preview of ${template.name}`}
                        srcDoc={compiledHtml}
                        sandbox=""
                        className="h-120 w-full rounded-lg border border-border/40 bg-white shadow-sm"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
