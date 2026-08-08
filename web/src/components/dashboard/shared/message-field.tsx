import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SegmentInfo } from "./sms-segments";

export function MessageField({
    value,
    onChange,
    segmentInfo,
}: {
    value: string;
    onChange: (value: string) => void;
    segmentInfo: SegmentInfo;
}) {
    const isNearLimit =
        segmentInfo.characterCount > 0 && segmentInfo.charsRemainingInSegment <= 10;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="message">Message</Label>
                <span
                    className={cn(
                        "font-mono text-xs text-muted-foreground",
                        isNearLimit && "text-pending",
                    )}
                >
                    {segmentInfo.characterCount} chars ·{" "}
                    {segmentInfo.segmentCount || 1} segment
                    {segmentInfo.segmentCount === 1 ? "" : "s"}
                </span>
            </div>
            <Textarea
                id="message"
                placeholder="Your Dugble verification code is 482913. It expires in 5 minutes."
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={6}
                className="resize-none"
            />
            {segmentInfo.encoding === "unicode" && (
                <p className="text-xs text-pending">
                    Contains special characters — this message will send as
                    Unicode (70 characters per segment instead of 160).
                </p>
            )}
        </div>
    );
}
