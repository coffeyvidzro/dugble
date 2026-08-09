import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import { cn } from "@/lib/utils";
import { DAY_LABELS, type CampaignScheduleType, type RecurrenceFrequency } from "./types";

const SCHEDULE_TYPES: CampaignScheduleType[] = ["one_time", "recurring"];
const SCHEDULE_TYPE_LABEL: Record<CampaignScheduleType, string> = {
    one_time: "One-time",
    recurring: "Recurring",
};

const FREQUENCY_LABEL: Record<RecurrenceFrequency, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
};

export function StepSchedule({
    scheduleType,
    onScheduleTypeChange,
    sendAt,
    onSendAtChange,
    minDateTime,
    frequency,
    onFrequencyChange,
    time,
    onTimeChange,
    daysOfWeek,
    onToggleDay,
}: {
    scheduleType: CampaignScheduleType;
    onScheduleTypeChange: (type: CampaignScheduleType) => void;
    sendAt: string;
    onSendAtChange: (value: string) => void;
    minDateTime: string;
    frequency: RecurrenceFrequency;
    onFrequencyChange: (frequency: RecurrenceFrequency) => void;
    time: string;
    onTimeChange: (value: string) => void;
    daysOfWeek: number[];
    onToggleDay: (day: number) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Delivery</Label>
                <DashboardRangeSelector
                    ranges={SCHEDULE_TYPES}
                    labels={SCHEDULE_TYPE_LABEL}
                    value={scheduleType}
                    onChange={onScheduleTypeChange}
                />
            </div>

            {scheduleType === "one_time" ? (
                <div className="space-y-2">
                    <Label htmlFor="campaign-send-at">Send at</Label>
                    <Input
                        id="campaign-send-at"
                        type="datetime-local"
                        value={sendAt}
                        min={minDateTime}
                        onChange={(event) => onSendAtChange(event.target.value)}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="campaign-frequency">Frequency</Label>
                            <Select
                                value={frequency}
                                onValueChange={(value) =>
                                    onFrequencyChange(value as RecurrenceFrequency)
                                }
                            >
                                <SelectTrigger id="campaign-frequency" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(FREQUENCY_LABEL) as RecurrenceFrequency[]).map(
                                        (freq) => (
                                            <SelectItem key={freq} value={freq}>
                                                {FREQUENCY_LABEL[freq]}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="campaign-time">Time</Label>
                            <Input
                                id="campaign-time"
                                type="time"
                                value={time}
                                onChange={(event) => onTimeChange(event.target.value)}
                            />
                        </div>
                    </div>

                    {frequency === "weekly" && (
                        <div className="space-y-2">
                            <Label>Repeat on</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {DAY_LABELS.map((label, day) => {
                                    const isSelected = daysOfWeek.includes(day);
                                    return (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => onToggleDay(day)}
                                            aria-pressed={isSelected}
                                            className={cn(
                                                "flex size-9 items-center justify-center rounded-full border font-mono text-xs font-medium transition-colors",
                                                isSelected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                                            )}
                                        >
                                            {label[0]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
