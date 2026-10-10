import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/shared/status-badge";
import { SENDER_ID_STATUS_LABEL, type SenderIdStatus } from "@/types/sender-id";

const STATUS_TONE: Record<SenderIdStatus, StatusTone> = {
  pending: "progress",
  approved: "success",
  rejected: "danger",
  suspended: "danger",
  inactive: "neutral",
};

export function SenderIdStatusBadge({ status }: { status: SenderIdStatus }) {
  return (
    <StatusBadge tone={STATUS_TONE[status]}>
      {SENDER_ID_STATUS_LABEL[status]}
    </StatusBadge>
  );
}
