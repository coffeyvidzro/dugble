import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/shared/status-badge";
import type { VerificationRecordStatus } from "@/types/sender-domain-api";

const TONE: Record<VerificationRecordStatus, StatusTone> = {
  pending: "progress",
  verified: "success",
  failed: "danger",
};

const LABEL: Record<VerificationRecordStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  failed: "Failed",
};

export function RecordStatusBadge({
  status,
}: {
  status: VerificationRecordStatus;
}) {
  return <StatusBadge tone={TONE[status]}>{LABEL[status]}</StatusBadge>;
}
