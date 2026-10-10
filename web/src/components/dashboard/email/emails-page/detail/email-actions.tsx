"use client";

import { AlertCircle, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  useCancelEmail,
  useUpdateEmailSchedule,
} from "@/hooks/queries/use-emails-api";
import { toDateTimeLocalValue } from "@/lib/format-date";
import type { EmailApiResource } from "@/types/email-api";

export function EmailActions({
  email,
  isTerminal,
}: {
  email: EmailApiResource;
  isTerminal: boolean;
}) {
  const updateSchedule = useUpdateEmailSchedule(email.id);
  const cancelEmail = useCancelEmail(email.id);
  const [rescheduling, setRescheduling] = useState(false);
  const [sendAt, setSendAt] = useState(
    email.scheduled_at
      ? toDateTimeLocalValue(new Date(email.scheduled_at))
      : "",
  );
  const [error, setError] = useState<string | null>(null);

  // Only pending scheduled emails are eligible for reschedule/cancel —
  // an email with no scheduled_at was queued immediately.
  if (isTerminal || !email.scheduled_at) return null;

  const isBusy = updateSchedule.isPending || cancelEmail.isPending;

  function handleReschedule() {
    if (!sendAt) return;
    setError(null);
    updateSchedule.mutate(new Date(sendAt).toISOString(), {
      onSuccess: () => setRescheduling(false),
      onError: (err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Couldn't reschedule this email.",
        ),
    });
  }

  function handleCancel() {
    setError(null);
    cancelEmail.mutate(undefined, {
      onError: (err) =>
        setError(
          err instanceof Error ? err.message : "Couldn't cancel this email.",
        ),
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/40 bg-muted/10 p-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {rescheduling ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="datetime-local"
            value={sendAt}
            onChange={(e) => setSendAt(e.target.value)}
            className="w-auto"
          />
          <button
            type="button"
            onClick={handleReschedule}
            disabled={!sendAt || isBusy}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90"
          >
            {updateSchedule.isPending && (
              <Loader2 className="size-3.5 animate-spin" />
            )}
            Confirm reschedule
          </button>
          <button
            type="button"
            onClick={() => setRescheduling(false)}
            className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRescheduling(true)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
          >
            Reschedule
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:pointer-events-none disabled:opacity-50"
          >
            {cancelEmail.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <XCircle className="size-3.5" />
            )}
            Cancel send
          </button>
        </div>
      )}
    </div>
  );
}
