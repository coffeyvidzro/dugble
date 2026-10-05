// src/components/dashboard/sms/reports/export-csv-button.tsx

"use client";

import { Download } from "lucide-react";
import { downloadTextFile } from "@/components/dashboard/shared/download-file";
import { toCsv } from "@/lib/csv";
import type { DailyVolumePoint } from "./types";

const CSV_HEADER = ["date", "sent", "delivered", "failed"] as const;

function pointsToCsv(points: DailyVolumePoint[]): string {
  return toCsv(
    CSV_HEADER,
    points.map((point) => [
      point.date.toISOString().slice(0, 10),
      point.sent,
      point.delivered,
      point.failed,
    ]),
  );
}

export function ExportCsvButton({
  points,
  filename,
}: {
  points: DailyVolumePoint[];
  filename: string;
}) {
  function handleExport() {
    downloadTextFile(pointsToCsv(points), filename);
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
