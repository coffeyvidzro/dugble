import { Activity, CircleCheck, CircleX, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { LogEntry } from "./types";

export function LogsStats({ logs }: { logs: LogEntry[] }) {
    const total = logs.length;
    const successCount = logs.filter((log) => log.statusCode < 400).length;
    const errorCount = total - successCount;
    const avgLatency =
        total === 0
            ? 0
            : Math.round(
                  logs.reduce((sum, log) => sum + log.latencyMs, 0) / total,
              );
    const successRate = total === 0 ? 0 : (successCount / total) * 100;
    const errorRate = total === 0 ? 0 : (errorCount / total) * 100;

    const stats = [
        { label: "Requests", value: total.toLocaleString(), icon: Activity },
        {
            label: "Success rate",
            value: `${successRate.toFixed(1)}%`,
            icon: CircleCheck,
        },
        {
            label: "Error rate",
            value: `${errorRate.toFixed(1)}%`,
            icon: CircleX,
        },
        { label: "Avg latency", value: `${avgLatency}ms`, icon: Timer },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
                <Card
                    key={stat.label}
                    className="border-border/40 p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <stat.icon className="size-3.5" />
                        {stat.label}
                    </div>
                    <p className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
                        {stat.value}
                    </p>
                </Card>
            ))}
        </div>
    );
}
