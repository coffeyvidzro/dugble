import {
  AlertTriangle,
  Ban,
  Check,
  Clock,
  HelpCircle,
  Send,
  X,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  EMAIL_API_STATUS_LABEL,
  type EmailApiStatus,
  type EmailDeliveryEvent,
  emailApiStatusSchema,
} from "@/types/email-api";

const STATUS_ICON: Record<EmailApiStatus, typeof Check> = {
  queued: Clock,
  processing: Clock,
  submitted: Send,
  delivered: Check,
  delayed: Clock,
  bounced: AlertTriangle,
  complained: AlertTriangle,
  rejected: X,
  failed: X,
  canceled: Ban,
};

const ERROR_STATUSES: EmailApiStatus[] = [
  "bounced",
  "complained",
  "rejected",
  "failed",
];

function normalizeEventStatus(rawType: string): EmailApiStatus | null {
  const withoutPrefix = rawType.startsWith("email.")
    ? rawType.slice(6)
    : rawType;
  const parsed = emailApiStatusSchema.safeParse(withoutPrefix);
  return parsed.success ? parsed.data : null;
}

export function EmailTimeline({
  events,
  isPolling,
  isPending,
}: {
  events: EmailDeliveryEvent[];
  isPolling: boolean;
  isPending: boolean;
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Delivery timeline</CardTitle>
        <CardDescription>
          {isPolling
            ? "In progress. New events appear when you refresh this page."
            : "Full delivery history for this email."}
        </CardDescription>
      </CardHeader>
      <div className="p-4 sm:p-6">
        {isPending ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Loading delivery events…
          </p>
        ) : events.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No delivery events recorded for this email yet.
          </p>
        ) : (
          <ol className="space-y-4">
            {events.map((event, index) => {
              const status = normalizeEventStatus(event.type);
              const Icon = status ? STATUS_ICON[status] : HelpCircle;
              const isError = status ? ERROR_STATUSES.includes(status) : false;
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
                      {status
                        ? EMAIL_API_STATUS_LABEL[status]
                        : (event.message ?? event.type)}
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
                <span
                  className="size-2 rounded-full border-2 border-dashed border-pending"
                  aria-hidden="true"
                />
                Waiting for the provider to report the next update
              </li>
            )}
          </ol>
        )}
      </div>
    </Card>
  );
}
