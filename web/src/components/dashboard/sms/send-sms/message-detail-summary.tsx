// src/components/dashboard/sms/send-sms/message-detail-summary.tsx

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SmsApiResource } from "@/types/sms-api";
import { calculateSegments, estimateCost } from "../../shared/sms-segments";
import { SmsStatusBadge } from "../../shared/sms-status-badge";

export function MessageDetailSummary({ message }: { message: SmsApiResource }) {
  // `segments` is authoritative from the API; encoding and cost aren't
  // part of the response, so they're derived client-side with the same
  // heuristic used in the composer, and labeled as estimates.
  const segmentInfo = calculateSegments(message.body);
  const estimatedCost = estimateCost(message.segments, 1);

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/40 bg-muted/10 pb-4">
        <div className="space-y-1">
          <CardTitle className="font-mono text-base">{message.id}</CardTitle>
          <CardDescription>Sent to {message.to}</CardDescription>
        </div>
        <SmsStatusBadge status={message.last_event} />
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
