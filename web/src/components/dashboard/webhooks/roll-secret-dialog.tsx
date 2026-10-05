"use client";

import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRotateWebhookSecret } from "@/hooks/queries/use-webhooks";
import { cn } from "@/lib/utils";
import type { WebhookEndpoint } from "@/types/webhook";
import { SecretReveal } from "./secret-reveal";

type Step = "confirm" | "reveal";

export function RollSecretDialog({
  webhook,
  onOpenChange,
}: {
  webhook: WebhookEndpoint | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<Step>("confirm");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [rollError, setRollError] = useState<string | null>(null);

  const { mutate: rotateSecret, isPending } = useRotateWebhookSecret();

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setStep("confirm");
      setNewSecret(null);
      setRollError(null);
    }
  }

  function handleConfirmRoll() {
    if (!webhook) return;
    setRollError(null);
    rotateSecret(webhook.id, {
      onSuccess: (data) => {
        setNewSecret(data.signing_secret);
        setStep("reveal");
      },
      onError: (error) => {
        setRollError(
          error instanceof Error
            ? error.message
            : "Failed to roll the signing secret.",
        );
      },
    });
  }

  return (
    <Dialog open={webhook !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto border-border/40 p-4 shadow-xl sm:p-6">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle>Roll signing secret?</DialogTitle>
              <DialogDescription className="wrap-break-word text-left">
                The current secret for{" "}
                <span className="inline-block max-w-full break-all rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
                  {webhook?.url}
                </span>{" "}
                will stop working immediately. Update your endpoint with the new
                secret to keep verifying incoming requests.
              </DialogDescription>
            </DialogHeader>

            {rollError && (
              <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span className="wrap-break-word">{rollError}</span>
              </div>
            )}

            <DialogFooter className="flex-row items-center justify-end gap-2 border-t border-border/40 pt-4 sm:space-x-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-pending/40 text-pending hover:bg-pending/10 sm:flex-initial"
                onClick={handleConfirmRoll}
                disabled={isPending}
              >
                <RefreshCw
                  className={cn("mr-2 size-4", isPending ? "animate-spin" : "")}
                />
                {isPending ? "Rolling…" : "Roll secret"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="animate-fade-up">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="size-5 shrink-0 text-pending" />
                New secret generated
              </DialogTitle>
              <DialogDescription className="text-left">
                This is the only time this secret will be shown in full.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 sm:py-6">
              <SecretReveal secret={newSecret ?? ""} />
            </div>
            <DialogFooter className="border-t border-border/40 pt-4">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => handleOpenChange(false)}
              >
                I&apos;ve saved it securely
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
