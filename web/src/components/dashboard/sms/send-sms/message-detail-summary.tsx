import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SmsStatusBadge } from "../sms-dashboard/sms-status-badge";
import type { SmsStatus } from "../sms-dashboard/types";
import type { MessageDetail } from "./types";

export function MessageDetailSummary({
    message,
    currentStatus,
}: {
    message: MessageDetail;
    currentStatus: SmsStatus;
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/40 bg-muted/10 pb-4">
                <div className="space-y-1">
                    <CardTitle className="font-mono text-base">
                        {message.id}
                    </CardTitle>
                    <CardDescription>Sent to {message.to}</CardDescription>
                </div>
                <SmsStatusBadge status={currentStatus} />
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
                        value={message.encoding === "gsm7" ? "GSM-7" : "Unicode"}
                    />
                    <Field
                        label="Cost"
                        value={`$${message.cost.toFixed(4)}`}
                        mono
                    />
                </div>
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
                    mono
                        ? "font-mono text-sm text-foreground"
                        : "text-sm text-foreground"
                }
            >
                {value}
            </p>
        </div>
    );
}
