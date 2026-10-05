// src/components/dashboard/sms/campaigns/step-review.tsx

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useSegment,
  useSegmentAudienceSize,
} from "@/hooks/queries/use-segments";
import { useSenderId } from "@/hooks/queries/use-sender-ids";
import { cn } from "@/lib/utils";
import { SmsPreviewBubble } from "../../shared/sms-preview-bubble";
import { calculateSegments, type SegmentInfo } from "../../shared/sms-segments";
import type { CampaignScheduleMode } from "./campaign-builder-types";

export function StepReview({
  name,
  senderId,
  segmentId,
  body,
  scheduleMode,
  sendAt,
}: {
  name: string;
  senderId: string;
  segmentId: string;
  body: string;
  scheduleMode: CampaignScheduleMode;
  sendAt: string;
}) {
  const { data: sender } = useSenderId(senderId);
  const { data: segment } = useSegment(segmentId);
  const { data: audienceSize } = useSegmentAudienceSize(segmentId || null);
  const segmentInfo: SegmentInfo = calculateSegments(body);

  const scheduleLabel =
    scheduleMode === "now"
      ? "Send immediately"
      : sendAt
        ? new Date(sendAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "Not scheduled";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
            <CardTitle className="text-xl">
              {name || "Untitled campaign"}
            </CardTitle>
            <CardDescription>
              Double-check everything before it goes out.
            </CardDescription>
          </CardHeader>
          <div className="space-y-3 p-4 text-sm">
            <ReviewRow label="From" value={sender?.name ?? "—"} mono />
            <ReviewRow
              label="Audience"
              value={`${segment?.name ?? "—"} (${(audienceSize?.count ?? 0).toLocaleString()})`}
            />
            <ReviewRow label="Schedule" value={scheduleLabel} />
            <ReviewRow
              label="Segments per message"
              value={String(segmentInfo.segmentCount)}
            />
          </div>
        </Card>
      </div>
      <div className="overflow-hidden rounded-lg border border-border/40 lg:col-span-2">
        <SmsPreviewBubble senderLabel={sender?.name ?? ""} message={body} />
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right text-foreground", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
