"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
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
import { useDisableMfa } from "@/hooks/queries/use-security";
import { recoveryCodeSchema, totpCodeSchema } from "@/types/security";
import { CodeInput } from "./code-input";

type Method = "totp" | "recovery";

export function DisableMfaDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const disableMfa = useDisableMfa();
  const [method, setMethod] = useState<Method>("totp");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setMethod("totp");
      setCode("");
      setError(null);
      disableMfa.reset();
    }
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = (
      method === "totp" ? totpCodeSchema : recoveryCodeSchema
    ).safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid code.");
      return;
    }
    setError(null);
    disableMfa.mutate(
      { method, code: parsed.data },
      {
        onSuccess: () => {
          toast.success("Two-factor authentication turned off.");
          handleOpenChange(false);
        },
        onError: (err) => setError(err.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Turn off two-factor authentication?</DialogTitle>
            <DialogDescription>
              Confirm with{" "}
              {method === "totp"
                ? "a code from your authenticator app"
                : "one of your recovery codes"}
              . Your account will be protected by your password only.
            </DialogDescription>
          </DialogHeader>
          <Field className="mt-5" data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="disable-mfa-code">
              {method === "totp" ? "Authentication code" : "Recovery code"}
            </FieldLabel>
            <CodeInput
              id="disable-mfa-code"
              mode={method}
              value={code}
              onChange={setCode}
              invalid={Boolean(error)}
              disabled={disableMfa.isPending}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <button
            type="button"
            onClick={() => {
              setMethod(method === "totp" ? "recovery" : "totp");
              setCode("");
              setError(null);
            }}
            className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {method === "totp"
              ? "Use a recovery code instead"
              : "Use authenticator app instead"}
          </button>
          <DialogFooter className="mt-6">
            <Button
              type="submit"
              variant="destructive"
              disabled={disableMfa.isPending || code.trim() === ""}
            >
              {disableMfa.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Turn off
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
