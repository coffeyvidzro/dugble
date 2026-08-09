import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SmsPreviewBubble } from "../../shared/sms-preview-bubble";
import { resolvePreviewMessage } from "../../shared/message-templates";
import { estimateCost, type SegmentInfo } from "../../shared/sms-segments";
import {
    formatSchedule,
    getAudienceById,
    type CampaignSchedule,
    type CampaignScheduleType,
    type RecurrenceFrequency,
} from "./types";

export function StepReview({
    name,
    sender,
    message,
    segmentInfo,
    audienceId,
    scheduleType,
    sendAt,
    frequency,
    time,
    daysOfWeek,
}: {
    name: string;
    sender: string;
    message: string;
    segmentInfo: SegmentInfo;
    audienceId: string;
    scheduleType: CampaignScheduleType;
    sendAt: string;
    frequency: RecurrenceFrequency;
    time: string;
    daysOfWeek: number[];
}) {
    const audience = getAudienceById(audienceId);
    const schedule: CampaignSchedule | null =
        scheduleType === "one_time"
            ? sendAt
                ? { type: "one_time", sendAt: new Date(sendAt) }
                : null
            : { type: "recurring", frequency, time, daysOfWeek, endsAt: null };
    const estimatedCost = estimateCost(segmentInfo.segmentCount, audience?.size ?? 0);

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
                        <ReviewRow label="From" value={sender} mono />
                        <ReviewRow
                            label="Audience"
                            value={`${audience?.name ?? "—"} (${(audience?.size ?? 0).toLocaleString()})`}
                        />
                        <ReviewRow label="Schedule" value={formatSchedule(schedule)} />
                        <ReviewRow
                            label="Segments per message"
                            value={String(segmentInfo.segmentCount)}
                        />
                        <ReviewRow
                            label="Estimated cost"
                            value={`$${estimatedCost.toFixed(2)}`}
                            emphasis
                        />
                    </div>
                </Card>
            </div>
            <div className="overflow-hidden rounded-lg border border-border/40 lg:col-span-2">
                <SmsPreviewBubble
                    senderLabel={sender}
                    message={resolvePreviewMessage(message)}
                />
            </div>
        </div>
    );
}

function ReviewRow({
    label,
    value,
    mono,
    emphasis,
}: {
    label: string;
    value: string;
    mono?: boolean;
    emphasis?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span
                className={cn(
                    "text-right",
                    mono && "font-mono",
                    emphasis ? "font-semibold text-foreground" : "text-foreground",
                )}
            >
                {value}
            </span>
        </div>
    );
}
