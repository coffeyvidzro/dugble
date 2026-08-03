import { InboxPreviewStrip } from "./inbox-preview-strip";
import type { PreviewViewport } from "./editor-types";
import { cn } from "@/lib/utils";

interface EmailPreviewPaneProps {
    subject: string;
    previewText: string;
    compiledHtml: string;
    viewport: PreviewViewport;
    isHiddenOnMobile: boolean;
}

export function EmailPreviewPane({
    subject,
    previewText,
    compiledHtml,
    viewport,
    isHiddenOnMobile,
}: EmailPreviewPaneProps) {
    return (
        <div
            className={cn(
                "min-w-0 flex-col",
                isHiddenOnMobile ? "hidden lg:flex" : "flex",
            )}
        >
            <div className="border-b border-border/40 bg-muted/10 px-4 py-2">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                    Preview
                </span>
            </div>
            <InboxPreviewStrip subject={subject} previewText={previewText} />
            <div className="flex min-w-0  flex-1 justify-center overflow-auto bg-muted/20 p-4 sm:p-6">
                <iframe
                    title="Email preview"
                    srcDoc={compiledHtml}
                    sandbox=""
                    className={cn(
                        "h-full min-h-96 rounded-lg border border-border/40 bg-white shadow-sm transition-all duration-300",
                        viewport === "mobile"
                            ? "w-full max-w-80"
                            : "w-full max-w-2xl",
                    )}
                />
            </div>
        </div>
    );
}
