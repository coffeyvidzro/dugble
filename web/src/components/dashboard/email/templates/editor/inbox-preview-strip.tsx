export function InboxPreviewStrip({
    subject,
    previewText,
}: {
    subject: string;
    previewText: string;
}) {
    return (
        <div className="flex items-start gap-3 border-b border-border/40 px-4 py-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
                D
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                    {subject || "Untitled subject"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                    {previewText || "No preview text set"}
                </p>
            </div>
        </div>
    );
}
