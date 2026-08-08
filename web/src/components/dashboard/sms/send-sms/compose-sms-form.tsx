"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SenderSelectField } from "../../shared/sender-select-field";
import { RecipientsField } from "./recipients-field";
import { MessageField } from "../../shared/message-field";
import { ScheduleField } from "./schedule-field";
import { SendSidebar } from "./send-sidebar";
import { calculateSegments, estimateCost } from "../../shared/sms-segments";
import { getApprovedSenders } from "../../shared/senders";
import type { MessageTemplate } from "../../shared/message-templates";
import {
    isValidRecipient,
    parseRecipients,
    type RecipientMode,
    type ScheduleMode,
} from "./types";

function toDateTimeLocalValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function generateMockMessageId(): string {
    return `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function ComposeSmsForm({
    initialTemplate,
}: {
    initialTemplate?: MessageTemplate;
}) {
    const router = useRouter();
    const senders = useMemo(() => getApprovedSenders(), []);
    const minDateTime = useMemo(
        () => toDateTimeLocalValue(new Date(Date.now() + 5 * 60 * 1000)),
        [],
    );

    const [sender, setSender] = useState(senders[0]?.number ?? "");
    const [recipientMode, setRecipientMode] = useState<RecipientMode>("single");
    const [recipientsRaw, setRecipientsRaw] = useState("");
    const [message, setMessage] = useState(initialTemplate?.body ?? "");
    const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
    const [scheduledAt, setScheduledAt] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [batchSuccess, setBatchSuccess] = useState<{ count: number } | null>(
        null,
    );

    const recipients = useMemo(
        () => parseRecipients(recipientsRaw, recipientMode),
        [recipientsRaw, recipientMode],
    );
    const invalidRecipients = useMemo(
        () => recipients.filter((recipient) => !isValidRecipient(recipient)),
        [recipients],
    );
    const segmentInfo = useMemo(() => calculateSegments(message), [message]);
    const estimatedCost = useMemo(
        () => estimateCost(segmentInfo.segmentCount, recipients.length),
        [segmentInfo, recipients],
    );

    const canSubmit =
        sender.length > 0 &&
        recipients.length > 0 &&
        invalidRecipients.length === 0 &&
        message.trim().length > 0 &&
        (scheduleMode === "now" || scheduledAt.length > 0) &&
        !isSubmitting;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canSubmit) return;

        setIsSubmitting(true);
        setBatchSuccess(null);

        // Simulated network round-trip
        await new Promise((resolve) => window.setTimeout(resolve, 900));

        if (recipients.length === 1) {
            router.push(
                `/dashboard/sms/send/${generateMockMessageId()}?live=1`,
            );
            return;
        }

        // Multiple recipients means there's no single message id to land on
        setBatchSuccess({ count: recipients.length });
        setRecipientsRaw("");
        setMessage("");
        setIsSubmitting(false);
    }

    const submitLabel = isSubmitting
        ? "Sending…"
        : scheduleMode === "later"
          ? `Schedule ${recipients.length > 1 ? `${recipients.length} messages` : "message"}`
          : `Send ${recipients.length > 1 ? `${recipients.length} messages` : "message"}`;

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <Card className="border-border/40 shadow-sm">
                    <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                        <CardTitle className="text-xl">Compose</CardTitle>
                        <CardDescription>
                            Fill in the details below — the preview updates as
                            you type.
                        </CardDescription>
                    </CardHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 p-4 sm:p-6"
                    >
                        {batchSuccess && (
                            <div className="flex items-center justify-between gap-3 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
                                <span>
                                    Queued {batchSuccess.count} messages
                                    successfully.
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setBatchSuccess(null)}
                                    className="shrink-0 text-xs underline underline-offset-2"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        <SenderSelectField
                            senders={senders}
                            value={sender}
                            onChange={(value) => setSender(value ?? "")}
                        />
                        <RecipientsField
                            mode={recipientMode}
                            onModeChange={setRecipientMode}
                            rawValue={recipientsRaw}
                            onRawValueChange={setRecipientsRaw}
                            recipients={recipients}
                            invalidRecipients={invalidRecipients}
                        />
                        <MessageField
                            value={message}
                            onChange={setMessage}
                            segmentInfo={segmentInfo}
                        />
                        <ScheduleField
                            mode={scheduleMode}
                            onModeChange={setScheduleMode}
                            scheduledAt={scheduledAt}
                            onScheduledAtChange={setScheduledAt}
                            minDateTime={minDateTime}
                        />

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={cn(
                                "group/button relative inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2.5 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 disabled:pointer-events-none disabled:opacity-50 dark:hover:shadow-black/20",
                            )}
                        >
                            {isSubmitting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )}
                            {submitLabel}
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                            />
                        </button>
                    </form>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-6">
                    <SendSidebar
                        senderLabel={sender}
                        message={message}
                        recipientCount={recipients.length}
                        segmentInfo={segmentInfo}
                        estimatedCost={estimatedCost}
                    />
                </div>
            </div>
        </div>
    );
}
