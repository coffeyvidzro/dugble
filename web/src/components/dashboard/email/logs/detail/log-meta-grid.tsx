import { Card } from "@/components/ui/card";
import type { LogEntry } from "../types";

export function LogMetaGrid({ log }: { log: LogEntry }) {
    const items = [
        { label: "API key", value: log.apiKeyLabel },
        { label: "IP address", value: log.ipAddress, mono: true },
        { label: "SDK", value: log.sdk, mono: true },
        { label: "Latency", value: `${log.latencyMs}ms`, mono: true },
    ];

    return (
        <Card className="grid grid-cols-2 gap-4 border-border/40 p-4 shadow-sm sm:grid-cols-4">
            {items.map((item) => (
                <div key={item.label} className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                        {item.label}
                    </p>
                    <p
                        className={`mt-1 truncate text-sm font-medium text-foreground ${
                            item.mono ? "font-mono" : ""
                        }`}
                    >
                        {item.value}
                    </p>
                </div>
            ))}
        </Card>
    );
}
