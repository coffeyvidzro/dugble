// src/components/auth/mfa-challenge-form.tsx

"use client";

import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  useVerifyLoginRecoveryCode,
  useVerifyLoginTotp,
} from "@/hooks/mutations/use-auth";
import { recoveryCodeSchema, totpCodeSchema } from "@/types/security";

export type MfaChallenge = {
  /** Short-lived token from `POST /auth/login`; kept in memory only. */
  token: string;
  methods: readonly string[];
};

type Method = "totp" | "recovery";

type MfaChallengeFormProps = {
  challenge: MfaChallenge;
  onVerified: () => void;
  onCancel: () => void;
};

/** Second login step for accounts with two-factor authentication enabled. */
export function MfaChallengeForm({
  challenge,
  onVerified,
  onCancel,
}: MfaChallengeFormProps) {
  const allowsRecovery =
    challenge.methods.length === 0 || challenge.methods.includes("recovery");
  const [method, setMethod] = useState<Method>("totp");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const verifyTotp = useVerifyLoginTotp();
  const verifyRecovery = useVerifyLoginRecoveryCode();
  const mutation = method === "totp" ? verifyTotp : verifyRecovery;

  function switchMethod(next: Method) {
    setMethod(next);
    setCode("");
    setError(null);
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
    mutation.mutate(
      { challenge_token: challenge.token, code: parsed.data },
      {
        onSuccess: (result) => {
          if (result.mfa_required) {
            setError("Verification incomplete. Try again.");
            return;
          }
          onVerified();
        },
        onError: (err) => setError(err.message),
      },
    );
  }

  const isTotp = method === "totp";

  return (
    <AuthShell
      title="Two-factor verification"
      backHref="/"
      backLabel="Back to home"
      subtitle={
        isTotp
          ? "Enter the 6-digit code from your authenticator app."
          : "Enter one of your saved recovery codes."
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="mfa-code">
            {isTotp ? "Authentication code" : "Recovery code"}
          </FieldLabel>
          <Input
            id="mfa-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="one-time-code"
            inputMode={isTotp ? "numeric" : "text"}
            maxLength={isTotp ? 7 : 64}
            autoFocus
            aria-invalid={Boolean(error)}
            disabled={mutation.isPending}
            className="font-mono tracking-widest"
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending || code.trim() === ""}
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
          Verify and sign in
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          {allowsRecovery && (
            <button
              type="button"
              onClick={() => switchMethod(isTotp ? "recovery" : "totp")}
              className="inline-flex items-center gap-1.5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <KeyRound className="size-3.5" />
              {isTotp ? "Use a recovery code" : "Use authenticator app"}
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
