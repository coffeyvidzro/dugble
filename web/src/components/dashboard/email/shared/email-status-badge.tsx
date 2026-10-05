// src/components/dashboard/email/shared/email-status-badge.tsx

import {
  AlertTriangle,
  Ban,
  Check,
  Clock,
  HelpCircle,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EMAIL_API_STATUS_LABEL,
  type EmailApiStatus,
  emailApiStatusSchema,
} from "@/types/email-api";

const STATUS_CONFIG: Record<
  EmailApiStatus,
  { icon: typeof Check; className: string; pulse?: boolean; spin?: boolean }
> = {
  queued: { icon: Clock, className: "text-pending", pulse: true },
  processing: { icon: Loader2, className: "text-pending", spin: true },
  submitted: { icon: Send, className: "text-pending" },
  delivered: { icon: Check, className: "text-signal" },
  delayed: { icon: Clock, className: "text-pending" },
  bounced: { icon: AlertTriangle, className: "text-danger" },
  complained: { icon: AlertTriangle, className: "text-danger" },
  rejected: { icon: X, className: "text-danger" },
  failed: { icon: X, className: "text-danger" },
  canceled: { icon: Ban, className: "text-muted-foreground" },
};

function labelForRaw(status: string): string {
  return status.length > 0
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : status;
}

/**
 * `status` here is a plain `string` because the list endpoint
 * (EmailSummary) types it as a bare string, not the closed enum used by
 * the detail resource's `last_event`. Unknown values fall back to a
 * generic label instead of crashing.
 */
export function EmailStatusBadge({ status }: { status: string }) {
  const parsed = emailApiStatusSchema.safeParse(status);

  if (!parsed.success) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <HelpCircle className="size-3.5" />
        {labelForRaw(status)}
      </span>
    );
  }

  const config = STATUS_CONFIG[parsed.data];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium",
        config.className,
      )}
    >
      {config.pulse ? (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pending opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-pending" />
        </span>
      ) : (
        <Icon className={cn("size-3.5", config.spin && "animate-spin")} />
      )}
      {EMAIL_API_STATUS_LABEL[parsed.data]}
    </span>
  );
}
