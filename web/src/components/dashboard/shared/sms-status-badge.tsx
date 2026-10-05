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
import { SMS_API_STATUS_LABEL, type SmsApiStatus } from "@/types/sms-api";

const STATUS_CONFIG: Record<
  SmsApiStatus,
  { icon: typeof Check; className: string; pulse?: boolean; spin?: boolean }
> = {
  queued: { icon: Clock, className: "text-pending", pulse: true },
  processing: { icon: Loader2, className: "text-pending", spin: true },
  submitted: { icon: Send, className: "text-pending" },
  sent: { icon: Send, className: "text-pending" },
  delivered: { icon: Check, className: "text-signal" },
  undelivered: { icon: AlertTriangle, className: "text-danger" },
  rejected: { icon: X, className: "text-danger" },
  failed: { icon: X, className: "text-danger" },
  expired: { icon: AlertTriangle, className: "text-danger" },
  unknown: { icon: HelpCircle, className: "text-muted-foreground" },
  canceled: { icon: Ban, className: "text-muted-foreground" },
};

export function SmsStatusBadge({ status }: { status: SmsApiStatus }) {
  const config = STATUS_CONFIG[status];
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
      {SMS_API_STATUS_LABEL[status]}
    </span>
  );
}
