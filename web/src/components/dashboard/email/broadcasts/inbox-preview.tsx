function initialFromName(name: string): string {
    const trimmed = name.trim();
    return trimmed ? trimmed[0].toUpperCase() : "D";
}

export function InboxPreview({
    fromName,
    fromEmail,
    subject,
    previewText,
}: {
    fromName: string;
    fromEmail: string;
    subject: string;
    previewText: string;
}) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
                Inbox preview
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background p-3 shadow-sm">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                    {initialFromName(fromName)}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {fromName || "Dugble"}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                            now
                        </span>
                    </div>
                    <p className="truncate text-sm text-foreground">
                        {subject || "Your subject line will appear here"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {previewText ||
                            "Preview text shows up next to the subject"}
                    </p>
                </div>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground/70">
                from {fromEmail}
            </p>
        </div>
    );
}
