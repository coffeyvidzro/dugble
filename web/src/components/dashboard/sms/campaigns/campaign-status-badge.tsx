import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/shared/status-badge";
import { campaignStatusLabel } from "@/types/campaign-api";

const STATUS_TONE: Record<string, StatusTone> = {
  draft: "neutral",
  scheduled: "progress",
  queued: "progress",
  sending: "progress",
  completed: "success",
  failed: "danger",
  canceled: "neutral",
};

export function CampaignStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge tone={STATUS_TONE[status] ?? "neutral"}>
      {campaignStatusLabel(status)}
    </StatusBadge>
  );
}
