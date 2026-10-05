// src/components/dashboard/sms/send-sms/use-sms-composer.ts

"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { useApprovedSenderIds } from "@/hooks/queries/use-approved-sender-ids";
import { useSendSms, useSendSmsBatch } from "@/hooks/queries/use-sms-api";
import { toDateTimeLocalValue } from "@/lib/format-date";
import type { MessageTemplate } from "../../shared/message-templates";
import { calculateSegments, estimateCost } from "../../shared/sms-segments";
import {
  isValidRecipient,
  parseRecipients,
  type RecipientMode,
  type ScheduleMode,
} from "./types";

/** Maximum messages accepted by `POST /sms/batch`. */
export const SMS_BATCH_LIMIT = 50;

/**
 * State, derived values and submission for the SMS composer. Keeps
 * `ComposeSmsForm` purely presentational: it lays out fields and wires them
 * to what this hook returns.
 */
export function useSmsComposer(initialTemplate?: MessageTemplate) {
  const router = useRouter();
  const { data: senders } = useApprovedSenderIds();

  const sendSms = useSendSms();
  const sendSmsBatch = useSendSmsBatch();
  const isSubmitting = sendSms.isPending || sendSmsBatch.isPending;

  const minDateTime = useMemo(
    () => toDateTimeLocalValue(new Date(Date.now() + 5 * 60 * 1000)),
    [],
  );

  const [senderChoice, setSender] = useState("");
  // Fall back to the first available option until the user picks one —
  // derived during render rather than written back from an effect.
  const sender = senderChoice || (senders[0]?.name ?? "");
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("single");
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [message, setMessage] = useState(initialTemplate?.body ?? "");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  // POST /sms/batch accepts at most 50 messages per request.
  const exceedsBatchLimit = recipients.length > SMS_BATCH_LIMIT;

  const canSubmit =
    sender.length > 0 &&
    recipients.length > 0 &&
    !exceedsBatchLimit &&
    invalidRecipients.length === 0 &&
    message.trim().length > 0 &&
    (scheduleMode === "now" || scheduledAt.length > 0) &&
    !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitError(null);
    setBatchSuccess(null);

    const scheduled_at =
      scheduleMode === "later" && scheduledAt
        ? new Date(scheduledAt).toISOString()
        : undefined;

    const [onlyRecipient] = recipients;
    if (recipients.length === 1 && onlyRecipient) {
      sendSms.mutate(
        {
          to: onlyRecipient,
          from: sender,
          body: message,
          scheduled_at,
        },
        {
          onSuccess: (data) => {
            router.push(`/dashboard/sms/send/${data.id}`);
          },
          onError: (error) => {
            setSubmitError(
              error instanceof Error
                ? error.message
                : "Couldn't send that message. Try again.",
            );
          },
        },
      );
      return;
    }

    sendSmsBatch.mutate(
      recipients.map((to) => ({
        to,
        from: sender,
        body: message,
        scheduled_at,
      })),
      {
        onSuccess: (data) => {
          setBatchSuccess({ count: data.length });
          setRecipientsRaw("");
          setMessage("");
        },
        onError: (error) => {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "Couldn't send those messages. Try again.",
          );
        },
      },
    );
  }

  const submitLabel = isSubmitting
    ? "Sending…"
    : scheduleMode === "later"
      ? `Schedule ${recipients.length > 1 ? `${recipients.length} messages` : "message"}`
      : `Send ${recipients.length > 1 ? `${recipients.length} messages` : "message"}`;

  return {
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
  };
}
