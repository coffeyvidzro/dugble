import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isTerminalSmsStatus, type SmsApiResource } from "@/types/sms-api";
import { calculateSegments, estimateCost } from "../../shared/sms-segments";
import { SmsStatusBadge } from "../../shared/sms-status-badge";

export function MessageDetailSummary({ message }: { message: SmsApiResource }) {
  const segmentInfo = calculateSegments(message.body);
  const estimatedCost = estimateCost(message.segments, 1);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div className="space-y-1">
          <CardTitle className="font-mono text-base">{message.id}</CardTitle>
          <CardDescription>Sent to {message.to}</CardDescription>
        </div>
        <SmsStatusBadge
          status={message.last_event}
          live={!isTerminalSmsStatus(message.last_event)}
        />
      </CardHeader>
      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-border/40 bg-muted/10 p-3 text-sm text-foreground">
          {message.body}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Field label="From" value={message.from} mono />
          <Field label="Segments" value={String(message.segments)} />
          <Field
            label="Encoding"
            value={segmentInfo.encoding === "gsm7" ? "GSM-7" : "Unicode"}
          />
          <Field
            label="Est. cost"
            value={`$${estimatedCost.toFixed(4)}`}
            mono
          />
        </div>
        {message.failure && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <p className="font-medium">{message.failure.code}</p>
            <p>{message.failure.message}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          mono ? "font-mono text-sm text-foreground" : "text-sm text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}
