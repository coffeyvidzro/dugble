import { AlertTriangle } from "lucide-react";
import {
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard/shared/status-badge";
import { SMS_API_STATUS_LABEL, type SmsApiStatus } from "@/types/sms-api";

const STATUS_TONE: Record<SmsApiStatus, StatusTone> = {
  queued: "progress",
  processing: "progress",
  submitted: "progress",
  sent: "progress",
  delivered: "success",
  undelivered: "danger",
  rejected: "danger",
  failed: "danger",
  expired: "danger",
  unknown: "neutral",
  canceled: "neutral",
};

export function smsStatusTone(status: SmsApiStatus): StatusTone {
  return STATUS_TONE[status];
}

const TRIANGLE_STATUSES: SmsApiStatus[] = ["undelivered", "expired"];

export function SmsStatusBadge({
  status,
  live = false,
  size,
}: {
  status: SmsApiStatus;
  /** Pulse the mark while the message is being polled for updates. */
  live?: boolean;
  size?: "sm" | "md";
}) {
  const tone = STATUS_TONE[status];
  return (
    <StatusBadge
      tone={tone}
      size={size}
      live={live && tone === "progress"}
      icon={TRIANGLE_STATUSES.includes(status) ? AlertTriangle : undefined}
    >
      {SMS_API_STATUS_LABEL[status]}
    </StatusBadge>
  );
}
