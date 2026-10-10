import { AlertTriangle } from "lucide-react";
import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/shared/status-badge";
import {
  EMAIL_API_STATUS_LABEL,
  type EmailApiStatus,
  emailApiStatusSchema,
} from "@/types/email-api";

const STATUS_TONE: Record<EmailApiStatus, StatusTone> = {
  queued: "progress",
  processing: "progress",
  submitted: "progress",
  delivered: "success",
  delayed: "warning",
  bounced: "danger",
  complained: "danger",
  rejected: "danger",
  failed: "danger",
  canceled: "neutral",
};

const TRIANGLE_STATUSES: EmailApiStatus[] = ["bounced", "complained"];

function labelForRaw(status: string): string {
  return status.length > 0
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : status;
}

export function EmailStatusBadge({
  status,
  live = false,
  size,
}: {
  status: string;
  /** Pulse the mark while the email is being polled for updates. */
  live?: boolean;
  size?: "sm" | "md";
}) {
  const parsed = emailApiStatusSchema.safeParse(status);

  if (!parsed.success) {
    return (
      <StatusBadge tone="neutral" size={size}>
        {labelForRaw(status)}
      </StatusBadge>
    );
  }

  const tone = STATUS_TONE[parsed.data];
  return (
    <StatusBadge
      tone={tone}
      size={size}
      live={live && tone === "progress"}
      icon={TRIANGLE_STATUSES.includes(parsed.data) ? AlertTriangle : undefined}
    >
      {EMAIL_API_STATUS_LABEL[parsed.data]}
    </StatusBadge>
  );
}
