"use client";

import { Download } from "lucide-react";
import { downloadTextFile } from "../../shared/download-file";
import type { DailyVolumePoint } from "./types";

function toCsv(points: DailyVolumePoint[]): string {
    const header = "date,sent,delivered,failed";
    const rows = points.map((point) => {
        const date = point.date.toISOString().slice(0, 10);
        return `${date},${point.sent},${point.delivered},${point.failed}`;
    });
    return [header, ...rows].join("\n");
}

export function ExportCsvButton({
    points,
    filename,
}: {
    points: DailyVolumePoint[];
    filename: string;
}) {
    function handleExport() {
        downloadTextFile(toCsv(points), filename);
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
