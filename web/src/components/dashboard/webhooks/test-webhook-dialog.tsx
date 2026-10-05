// src/components/dashboard/webhooks/test-webhook-dialog.tsx

"use client";

import { AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { useSendTestWebhookEvent } from "@/hooks/queries/use-webhooks";
import type { WebhookEndpoint } from "@/types/webhook";

type TestResult = Pick<
  ReturnType<typeof useSendTestWebhookEvent>,
  "data" | "error" | "isPending"
>;

/**
 * Presentational: the parent fires the test from the click handler that opens
 * this dialog (an event, not an effect) and passes the mutation state down.
 */
export function TestWebhookDialog({
  webhook,
  result,
  onOpenChange,
}: {
  webhook: WebhookEndpoint | null;
  result: TestResult;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, error, isPending } = result;

  return (
    <Dialog open={webhook !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/40 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-5 text-muted-foreground" />
            Test event
          </DialogTitle>
          <DialogDescription>
            Sending a sample payload to{" "}
            <span className="font-mono text-xs">{webhook?.url}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {isPending && (
            <p className="text-sm text-muted-foreground">Sending…</p>
          )}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                {error instanceof Error
                  ? error.message
                  : "The test event could not be sent."}
              </span>
            </div>
          )}
          {data && (
            <div className="flex items-start gap-3 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>
                Delivery {data.status}
                {data.response_status
                  ? ` — endpoint responded ${data.response_status}`
                  : ""}
                .
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border/40 pt-4">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
