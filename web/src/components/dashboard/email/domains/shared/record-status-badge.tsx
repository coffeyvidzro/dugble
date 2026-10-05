import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationRecordStatus } from "@/types/sender-domain-api";

const CONFIG: Record<
  VerificationRecordStatus,
  { icon: typeof Check; className: string; pulse?: boolean }
> = {
  pending: { icon: Clock, className: "text-pending", pulse: true },
  verified: { icon: Check, className: "text-signal" },
  failed: { icon: X, className: "text-danger" },
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
  const config = CONFIG[status];
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
      {LABEL[status]}
    </span>
  );
}
