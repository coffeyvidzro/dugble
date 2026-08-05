export function LastUpdatedNote({ lastUpdated }: { lastUpdated: Date }) {
    const formatted = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(lastUpdated);

    return (
        <p className="text-xs text-muted-foreground">
            Data refreshes every 15 minutes. Last updated{" "}
            <span className="font-medium text-foreground">{formatted}</span>.
        </p>
    );
}
