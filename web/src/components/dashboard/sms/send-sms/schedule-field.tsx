import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import type { ScheduleMode } from "./types";

const MODES: ScheduleMode[] = ["now", "later"];
const MODE_LABEL: Record<ScheduleMode, string> = {
    now: "Send now",
    later: "Schedule",
};

export function ScheduleField({
    mode,
    onModeChange,
    scheduledAt,
    onScheduledAtChange,
    minDateTime,
}: {
    mode: ScheduleMode;
    onModeChange: (mode: ScheduleMode) => void;
    scheduledAt: string;
    onScheduledAtChange: (value: string) => void;
    minDateTime: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="scheduledAt">Delivery</Label>
                <DashboardRangeSelector
                    ranges={MODES}
                    labels={MODE_LABEL}
                    value={mode}
                    onChange={onModeChange}
                />
            </div>
            {mode === "later" && (
                <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={scheduledAt}
                    min={minDateTime}
                    onChange={(event) => onScheduledAtChange(event.target.value)}
                />
            )}
        </div>
    );
}
