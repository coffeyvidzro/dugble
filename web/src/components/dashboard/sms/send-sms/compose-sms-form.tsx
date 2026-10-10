"use client";

import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageField } from "../../shared/message-field";
import type { MessageTemplate } from "../../shared/message-templates";
import { SenderSelectField } from "../../shared/sender-select-field";
import { RecipientsField } from "./recipients-field";
import { ScheduleField } from "./schedule-field";
import { SendSidebar } from "./send-sidebar";
import { SMS_BATCH_LIMIT, useSmsComposer } from "./use-sms-composer";

export function ComposeSmsForm({
  initialTemplate,
}: {
  initialTemplate?: MessageTemplate;
}) {
  const {
    batchSuccess,
    canSubmit,
    estimatedCost,
    exceedsBatchLimit,
    handleSubmit,
    invalidRecipients,
    isSubmitting,
    message,
    minDateTime,
    recipientMode,
    recipients,
    recipientsRaw,
    scheduleMode,
    scheduledAt,
    segmentInfo,
    sender,
    senders,
    setBatchSuccess,
    setMessage,
    setRecipientMode,
    setRecipientsRaw,
    setScheduleMode,
    setScheduledAt,
    setSender,
    setSubmitError,
    submitError,
    submitLabel,
  } = useSmsComposer(initialTemplate);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Compose</CardTitle>
            <CardDescription>
              Fill in the details below. The preview updates as you type.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
            {batchSuccess && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
                <span>Queued {batchSuccess.count} messages successfully.</span>
                <button
                  type="button"
                  onClick={() => setBatchSuccess(null)}
                  className="shrink-0 text-xs underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {exceedsBatchLimit && (
              <p role="alert" className="text-sm text-danger">
                You can send to at most {SMS_BATCH_LIMIT} recipients at once (
                {recipients.length} entered). Split the list, or use a campaign
                for larger audiences.
              </p>
            )}
            {submitError && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                <span>{submitError}</span>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="shrink-0 text-xs underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {senders.length === 0 ? (
              <div className="rounded-lg border border-border/40 bg-muted/10 p-3 text-sm text-muted-foreground">
                You don&apos;t have an approved sender ID yet.{" "}
                <Link
                  href="/dashboard/sms/sender-ids/new"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  Request one
                </Link>{" "}
                before sending.
              </div>
            ) : (
              <SenderSelectField
                senders={senders}
                value={sender}
                onChange={setSender}
              />
            )}
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
                "group/button relative inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {submitLabel}
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
