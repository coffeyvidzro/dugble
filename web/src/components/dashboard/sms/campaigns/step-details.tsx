import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SenderSelectField } from "../../shared/sender-select-field";
import { MessageField } from "../../shared/message-field";
import type { SegmentInfo } from "../../shared/sms-segments";
import type { SenderNumber } from "../sms-dashboard/types";

type SelectRootChangeEventDetails = {
    value?: string;
    type?: string;
    open?: boolean;
};

export function StepDetails({
    name,
    onNameChange,
    senders,
    sender,
    onSenderChange,
    message,
    onMessageChange,
    segmentInfo,
}: {
    name: string;
    onNameChange: (value: string) => void;
    senders: SenderNumber[];
    sender: string;
    onSenderChange: (
        value: string | null,
        eventDetails: SelectRootChangeEventDetails,
    ) => void;
    message: string;
    onMessageChange: (value: string) => void;
    segmentInfo: SegmentInfo;
}) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign name</Label>
                <Input
                    id="campaign-name"
                    placeholder="Monthly Billing Reminder"
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    For your reference only — recipients never see this.
                </p>
            </div>

            <SenderSelectField
                senders={senders}
                value={sender}
                onChange={onSenderChange}
            />

            <MessageField
                value={message}
                onChange={onMessageChange}
                segmentInfo={segmentInfo}
            />
            <p className="text-xs text-muted-foreground">
                Use{" "}
                <code className="rounded bg-muted/60 px-1 py-0.5 font-mono">
                    {"{{first_name}}"}
                </code>{" "}
                to personalize each message with the recipient&apos;s name.
            </p>
        </div>
    );
}
