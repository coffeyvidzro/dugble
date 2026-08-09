type SelectRootChangeEventDetails = {
    value?: string;
    [key: string]: unknown;
};

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    SENDER_TYPE_LABEL,
    type SenderNumber,
} from "../sms/sms-dashboard/types";

export function SenderSelectField({
    senders,
    value,
    onChange,
}: {
    senders: SenderNumber[];
    value: string;
    onChange: (
        value: string | null,
        eventDetails: SelectRootChangeEventDetails,
    ) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor="sender">From</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger id="sender" className="w-full">
                    <SelectValue placeholder="Choose a sender ID" />
                </SelectTrigger>
                <SelectContent>
                    {senders.map((sender) => (
                        <SelectItem key={sender.id} value={sender.number}>
                            <span className="font-mono">{sender.number}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                                {SENDER_TYPE_LABEL[sender.type]}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
