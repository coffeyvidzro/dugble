import { LogCardRow } from "./log-card-row";
import type { LogEntry } from "./types";

export function LogCardsList({ logs }: { logs: LogEntry[] }) {
    return (
        <div className="flex flex-col gap-3 md:hidden">
            {logs.map((log) => (
                <LogCardRow key={log.id} log={log} />
            ))}
        </div>
    );
}
