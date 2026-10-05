import {
  AlertTriangle,
  Ban,
  Check,
  Clock,
  HelpCircle,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SMS_API_STATUS_LABEL,
  type SmsApiStatus,
  type SmsDeliveryEvent,
  smsStatusSchema,
} from "@/types/sms-api";

const STATUS_ICON: Record<SmsApiStatus, typeof Check> = {
  queued: Clock,
  processing: Clock,
  submitted: Send,
  sent: Send,
  delivered: Check,
  undelivered: AlertTriangle,
  rejected: X,
  failed: X,
  expired: AlertTriangle,
  unknown: HelpCircle,
  canceled: Ban,
};

const ERROR_STATUSES: SmsApiStatus[] = [
  "undelivered",
  "rejected",
  "failed",
  "expired",
];

function normalizeEventStatus(rawType: string): SmsApiStatus {
  const withoutPrefix = rawType.startsWith("sms.") ? rawType.slice(4) : rawType;
  const parsed = smsStatusSchema.safeParse(withoutPrefix);
  return parsed.success ? parsed.data : "unknown";
}

function eventLabel(event: SmsDeliveryEvent, status: SmsApiStatus): string {
  if (status !== "unknown") return SMS_API_STATUS_LABEL[status];
  return event.message ?? event.type;
}

export function MessageStatusTimeline({
  events,
  isPolling,
}: {
  events: SmsDeliveryEvent[];
  isPolling: boolean;
}) {
  if (events.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No delivery events recorded for this message yet.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event, index) => {
        const status = normalizeEventStatus(event.type);
        const Icon = STATUS_ICON[status];
        const isError = ERROR_STATUSES.includes(status);
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border",
                  isError
                    ? "border-danger/40 bg-danger/10 text-danger"
                    : "border-signal/40 bg-signal/10 text-signal",
                )}
              >
                <Icon className="size-3.5" />
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="mt-1 h-full w-px flex-1 bg-border/60"
                />
              )}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-foreground">
                {eventLabel(event, status)}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {new Date(event.occurred_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              {event.code && (
                <p className="font-mono text-xs text-muted-foreground">
                  Code: {event.code}
                </p>
              )}
            </div>
          </li>
        );
      })}
      {isPolling && (
        <li className="flex items-center gap-3 pl-1 text-xs text-muted-foreground">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pending opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-pending" />
          </span>
          Waiting for carrier update…
        </li>
      )}
    </ol>
  );
}
