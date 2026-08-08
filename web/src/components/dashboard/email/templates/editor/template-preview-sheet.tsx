"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { InboxPreviewStrip } from "./inbox-preview-strip";
import { interpolateHtml, variablesForCategory } from "../template-content";
import type { EmailTemplate } from "../types";

export function TemplatePreviewSheet({
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>{template.name}</SheetTitle>
                </SheetHeader>

                <div className="space-y-6 px-4 pb-6 sm:px-6">
                    <div className="overflow-hidden rounded-lg border border-border/40">
                        <InboxPreviewStrip
                            subject={template.subject}
                            previewText={template.previewText}
                        />
                    </div>

                    <div>
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                            Preview
                        </p>
                        <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/20 p-4">
                            <iframe
                                title={`Preview of ${template.name}`}
                                srcDoc={compiledHtml}
                                sandbox=""
                                className="h-120 w-full rounded-lg border border-border/40 bg-white shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
