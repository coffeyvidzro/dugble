import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import type { CampaignScheduleMode } from "./campaign-builder-types";

const SCHEDULE_MODES: CampaignScheduleMode[] = ["now", "later"];
const SCHEDULE_MODE_LABEL: Record<CampaignScheduleMode, string> = {
  now: "Send now",
  later: "Schedule",
};

export function StepSchedule({
  mode,
  onModeChange,
  sendAt,
  onSendAtChange,
  minDateTime,
}: {
  mode: CampaignScheduleMode;
  onModeChange: (mode: CampaignScheduleMode) => void;
  sendAt: string;
  onSendAtChange: (value: string) => void;
  minDateTime: string;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Delivery</Label>
        <DashboardRangeSelector
          ranges={SCHEDULE_MODES}
          labels={SCHEDULE_MODE_LABEL}
          value={mode}
          onChange={onModeChange}
        />
      </div>

      {mode === "later" && (
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
      )}
    </div>
  );
}
