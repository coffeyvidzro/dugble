// src/components/dashboard/security/enroll-totp-dialog.tsx

"use client";

import { Download, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { type FormEvent, useState } from "react";
import { CopyButton } from "@/components/dashboard/shared/copy-button";
import { downloadTextFile } from "@/components/dashboard/shared/download-file";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type {
  useConfirmTotp,
  useEnrollTotp,
} from "@/hooks/queries/use-security";
import { totpCodeSchema } from "@/types/security";
import { CodeInput } from "./code-input";

type EnrollTotpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Started by the "Enable" click in the parent (an event, not an effect). */
  enrollment: ReturnType<typeof useEnrollTotp>;
  confirmation: ReturnType<typeof useConfirmTotp>;
};

/**
 * Two-step enrolment: scan + confirm, then show recovery codes exactly once.
 * The secret and codes exist only in mutation state and are discarded when the
 * dialog closes (the parent resets both mutations).
 */
export function EnrollTotpDialog({
  open,
  onOpenChange,
  enrollment,
  confirmation,
}: EnrollTotpDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recoveryCodes = confirmation.data?.recovery_codes;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCode("");
      setError(null);
    }
    onOpenChange(next);
  }

  function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = totpCodeSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid code.");
      return;
    }
    setError(null);
    confirmation.mutate(parsed.data, {
      onError: (err) => setError(err.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {recoveryCodes ? (
          <>
            <DialogHeader>
              <DialogTitle>Save your recovery codes</DialogTitle>
              <DialogDescription>
                Each code works once if you lose access to your authenticator.
                They won&apos;t be shown again.
              </DialogDescription>
            </DialogHeader>
            <ul className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/20 p-4 font-mono text-sm">
              {recoveryCodes.map((recoveryCode) => (
                <li key={recoveryCode}>{recoveryCode}</li>
              ))}
            </ul>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  downloadTextFile(
                    `${recoveryCodes.join("\n")}\n`,
                    "dugble-recovery-codes.txt",
                    "text/plain;charset=utf-8;",
                  )
                }
              >
                <Download className="size-4" />
                Download
              </Button>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                I&apos;ve saved them
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleConfirm} noValidate>
            <DialogHeader>
              <DialogTitle>Set up authenticator app</DialogTitle>
              <DialogDescription>
                Scan the QR code with an authenticator app, then enter the
                6-digit code it shows.
              </DialogDescription>
            </DialogHeader>

            <div className="my-5 flex flex-col items-center gap-4">
              {enrollment.isPending ? (
                <div className="flex size-44 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : enrollment.isError ? (
                <p className="text-sm text-danger">
                  {enrollment.error.message}
                </p>
              ) : enrollment.data ? (
                <>
                  <div className="rounded-lg bg-white p-3">
                    <QRCodeSVG
                      value={enrollment.data.uri}
                      size={168}
                      marginSize={0}
                    />
                  </div>
                  <div className="flex w-full items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                    <code className="flex-1 break-all font-mono text-xs">
                      {enrollment.data.secret}
                    </code>
                    <CopyButton
                      value={enrollment.data.secret}
                      label="setup key"
                    />
                  </div>
                </>
              ) : null}
            </div>

            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="totp-confirm-code">
                Verification code
              </FieldLabel>
              <CodeInput
                id="totp-confirm-code"
                mode="totp"
                value={code}
                onChange={setCode}
                invalid={Boolean(error)}
                disabled={!enrollment.data || confirmation.isPending}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>

            <DialogFooter className="mt-6">
              <Button
                type="submit"
                disabled={
                  !enrollment.data ||
                  confirmation.isPending ||
                  code.trim() === ""
                }
              >
                {confirmation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Turn on two-factor
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
