import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SmsPreviewBubble } from "../../shared/sms-preview-bubble";
import type { SegmentInfo } from "../../shared/sms-segments";

export function SendSidebar({
    senderLabel,
    message,
    recipientCount,
    segmentInfo,
    estimatedCost,
}: {
    senderLabel: string;
    message: string;
    recipientCount: number;
    segmentInfo: SegmentInfo;
    estimatedCost: number;
}) {
    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-border/40 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                    <CardTitle className="text-xl">Preview</CardTitle>
                    <CardDescription>
                        How it lands on their phone.
                    </CardDescription>
                </CardHeader>
                <SmsPreviewBubble senderLabel={senderLabel} message={message} />
            </Card>

            <Card className="border-border/40 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                    <CardTitle className="text-xl">Summary</CardTitle>
                    <CardDescription>
                        Segments and cost for this send.
                    </CardDescription>
                </CardHeader>
                <div className="space-y-3 p-4 text-sm">
                    <SummaryRow
                        label="Encoding"
                        value={segmentInfo.encoding === "gsm7" ? "GSM-7" : "Unicode"}
                    />
                    <SummaryRow
                        label="Segments per message"
                        value={String(segmentInfo.segmentCount)}
                    />
                    <SummaryRow
                        label="Recipients"
                        value={String(recipientCount)}
                    />
                    <SummaryRow
                        label="Estimated cost"
                        value={`$${estimatedCost.toFixed(4)}`}
                        emphasis
                    />
                </div>
            </Card>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    emphasis,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span
                className={cn(
                    "font-mono",
                    emphasis ? "font-semibold text-foreground" : "text-foreground",
                )}
            >
                {value}
            </span>
        </div>
    );
}
