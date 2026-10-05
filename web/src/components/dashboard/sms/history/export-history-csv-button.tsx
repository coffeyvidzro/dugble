// src/components/dashboard/sms/history/export-history-csv-button.tsx

"use client";

import { Download } from "lucide-react";
import { toCsv } from "@/lib/csv";
import type { SmsApiResource } from "@/types/sms-api";
import { downloadTextFile } from "../../shared/download-file";

const CSV_HEADER = [
  "id",
  "to",
  "from",
  "status",
  "segments",
  "created_at",
  "body",
] as const;

function messagesToCsv(messages: SmsApiResource[]): string {
  return toCsv(
    CSV_HEADER,
    messages.map((message) => [
      message.id,
      message.to,
      message.from,
      message.last_event,
      message.segments,
      message.created_at,
      message.body,
    ]),
  );
}

/**
 * Exports whatever page of results is currently loaded — there's no bulk
 * export endpoint documented, so the full history can't be pulled in one shot.
 */
export function ExportHistoryCsvButton({
  messages,
}: {
  messages: SmsApiResource[];
}) {
  function handleExport() {
    downloadTextFile(messagesToCsv(messages), "dugble-sms-history.csv");
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={messages.length === 0}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
    >
      <Download className="size-3.5" />
      Export CSV
    </button>
  );
}
