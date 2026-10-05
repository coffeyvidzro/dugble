// src/components/dashboard/email/domains/shared/domain-status-badge.tsx

import {
  AlertTriangle,
  Ban,
  Check,
  Clock,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DOMAIN_STATUS_LABEL,
  type DomainStatus,
} from "@/types/sender-domain-api";

const STATUS_CONFIG: Record<
  DomainStatus,
  { icon: typeof Check; className: string; pulse?: boolean }
> = {
  not_started: { icon: HelpCircle, className: "text-muted-foreground" },
  pending: { icon: Clock, className: "text-pending", pulse: true },
  verified: { icon: Check, className: "text-signal" },
  partially_verified: { icon: AlertTriangle, className: "text-pending" },
  partially_failed: { icon: AlertTriangle, className: "text-danger" },
  failed: { icon: XCircle, className: "text-danger" },
  temporary_failure: { icon: AlertTriangle, className: "text-pending" },
  disabled: { icon: Ban, className: "text-muted-foreground" },
};

export function DomainStatusBadge({ status }: { status: DomainStatus }) {
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
        <Icon className="size-3.5" />
      )}
      {DOMAIN_STATUS_LABEL[status]}
    </span>
  );
}
