import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { VolumeChart } from "./volume-chart";
import { ExportCsvButton } from "./export-csv-button";
import type { DailyVolumePoint } from "./types";

export function VolumeChartCard({ points }: { points: DailyVolumePoint[] }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/40 bg-muted/10 pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl">Messages over time</CardTitle>
                    <CardDescription>
                        Sent vs. delivered for the selected period.
                    </CardDescription>
                </div>
                <ExportCsvButton points={points} filename="dugble-sms-volume.csv" />
            </CardHeader>
            <div className="p-4">
                <VolumeChart points={points} />
            </div>
        </Card>
    );
}
