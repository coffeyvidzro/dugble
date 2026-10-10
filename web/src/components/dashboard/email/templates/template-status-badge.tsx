import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/shared/status-badge";
import {
  TEMPLATE_STATUS_LABEL,
  type TemplateApiStatus,
} from "@/types/template-api";

const STATUS_TONE: Record<TemplateApiStatus, StatusTone> = {
  published: "success",
  draft: "neutral",
};

export function TemplateStatusBadge({ status }: { status: TemplateApiStatus }) {
  return (
    <StatusBadge tone={STATUS_TONE[status]}>
      {TEMPLATE_STATUS_LABEL[status]}
    </StatusBadge>
  );
}
