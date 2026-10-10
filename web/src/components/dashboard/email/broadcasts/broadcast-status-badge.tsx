import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/shared/status-badge";
import {
  BROADCAST_STATUS_LABEL,
  type BroadcastStatus,
} from "@/types/broadcast-api";

const STATUS_TONE: Record<BroadcastStatus, StatusTone> = {
  draft: "neutral",
  scheduled: "progress",
  queued: "progress",
  sent: "success",
  failed: "danger",
  canceled: "neutral",
};

export function BroadcastStatusBadge({ status }: { status: BroadcastStatus }) {
  return (
    <StatusBadge tone={STATUS_TONE[status]}>
      {BROADCAST_STATUS_LABEL[status]}
    </StatusBadge>
  );
}
