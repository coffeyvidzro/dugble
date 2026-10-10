import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/shared/status-badge";
import {
  DOMAIN_STATUS_LABEL,
  type DomainStatus,
} from "@/types/sender-domain-api";

const STATUS_TONE: Record<DomainStatus, StatusTone> = {
  not_started: "neutral",
  pending: "progress",
  verified: "success",
  partially_verified: "warning",
  partially_failed: "danger",
  failed: "danger",
  temporary_failure: "warning",
  disabled: "neutral",
};

export function DomainStatusBadge({
  status,
  size,
}: {
  status: DomainStatus;
  size?: "sm" | "md";
}) {
  return (
    <StatusBadge tone={STATUS_TONE[status]} size={size}>
      {DOMAIN_STATUS_LABEL[status]}
    </StatusBadge>
  );
}
