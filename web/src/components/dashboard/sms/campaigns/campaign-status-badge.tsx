// src/components/dashboard/sms/campaigns/campaign-status-badge.tsx

import {
  AlertTriangle,
  Check,
  Clock,
  PlayCircle,
  Send,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { campaignStatusLabel } from "@/types/campaign-api";

type StatusConfig = {
  icon: typeof Check;
  className: string;
  pulse?: boolean;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: { icon: Clock, className: "text-muted-foreground" },
  scheduled: { icon: Clock, className: "text-pending" },
  queued: { icon: Send, className: "text-pending", pulse: true },
  sending: { icon: Send, className: "text-pending", pulse: true },
  completed: { icon: Check, className: "text-signal" },
  failed: { icon: AlertTriangle, className: "text-danger" },
  canceled: { icon: XCircle, className: "text-muted-foreground" },
};

const DEFAULT_STATUS_CONFIG: StatusConfig = {
  icon: PlayCircle,
  className: "text-muted-foreground",
};

export function CampaignStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? DEFAULT_STATUS_CONFIG;
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
      {campaignStatusLabel(status)}
    </span>
  );
}
