"use client";

import { Download } from "lucide-react";
import { downloadTextFile } from "../../shared/download-file";
import type { SmsLogEntry } from "../sms-dashboard/types";

function escapeCsvField(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(messages: SmsLogEntry[]): string {
    const header = "id,to,from,status,segments,sent_at,body";
    const rows = messages.map((message) =>
        [
            message.id,
            message.to,
            message.from,
            message.status,
            message.segments,
            message.sentAt.toISOString(),
            escapeCsvField(message.body),
        ].join(","),
    );
    return [header, ...rows].join("\n");
}

export function ExportHistoryCsvButton({ messages }: { messages: SmsLogEntry[] }) {
    function handleExport() {
        downloadTextFile(toCsv(messages), "dugble-sms-history.csv");
    }

    return (
        <button
            type="button"
            onClick={handleExport}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
        >
            <Download className="size-3.5" />
            Export CSV
        </button>
    );
}
