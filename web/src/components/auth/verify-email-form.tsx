// src/components/auth/verify-email-form.tsx

"use client";

import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useResendVerificationEmail,
  useVerifyEmail,
} from "../../hooks/mutations/use-auth";

type Status = "pending" | "verifying" | "success" | "error";

const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyEmailForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerificationEmail();
  const [cooldown, setCooldown] = useState(0);

  // If a verification link brought us here, confirm it immediately.
  // useMutation already guards against setting state after unmount, so
  // there's no need for the manual "cancelled" flag the plain-fetch version
  // needed.
  const submittedToken = useRef<string | null>(null);
  useEffect(() => {
    if (!token || !email) return;
    // Tokens are single-use: never submit the same one twice (StrictMode
    // re-runs effects in development).
    if (submittedToken.current === token) return;
    submittedToken.current = token;
    verifyEmail.mutate({ token, email });
  }, [token, email, verifyEmail.mutate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // A link with a token but no email is malformed — go straight to the
  // error state instead of firing a request with a null email. Otherwise,
  // status tracks the mutation directly rather than duplicating it in a
  // separate variable that could drift out of sync.
  const status: Status = !token
    ? "pending"
    : !email
      ? "error"
      : verifyEmail.isSuccess
        ? "success"
        : verifyEmail.isError
          ? "error"
          : "verifying";

  function resend() {
    if (!email || cooldown > 0) return;
    resendVerification.mutate(
      { email },
      { onSuccess: () => setCooldown(RESEND_COOLDOWN_SECONDS) },
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <AuthShell
        title={
          status === "success"
            ? "Email verified"
            : status === "error"
              ? "Verification failed"
              : "Verify your email"
        }
        subtitle={
          status === "success"
            ? "Your address is confirmed. You're ready to send."
            : status === "error"
              ? "That link is invalid or has expired."
              : email
                ? `We sent a link to ${email}`
                : "Check your inbox for a verification link"
        }
        backHref="/login"
        backLabel="Back to login"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <StatusBadge status={status} />

          {status === "verifying" && (
            <p className="text-sm text-muted-foreground">
              Confirming your email…
            </p>
          )}

          {status === "success" && (
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Continue to sign in
            </Link>
          )}

          {status === "error" && (
            <div className="w-full space-y-3">
              <Button
                onClick={resend}
                disabled={
                  resendVerification.isPending || cooldown > 0 || !email
                }
                size="lg"
                className="w-full hover:cursor-pointer"
              >
                {resendVerification.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Send a new link"}
              </Button>
              <Link
                href="/login"
                className="block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Back to login
              </Link>
            </div>
          )}

          {status === "pending" && (
            <div className="w-full space-y-4">
              <p className="font-mono text-xs text-muted-foreground">
                <span className="text-pending">queued</span>
                {" · "}waiting on click
              </p>
              <Button
                onClick={resend}
                disabled={
                  resendVerification.isPending || cooldown > 0 || !email
                }
                variant="outline"
                size="lg"
                className="w-full hover:cursor-pointer"
              >
                {resendVerification.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
              </Button>
            </div>
          )}
        </div>
      </AuthShell>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "verifying") {
    return (
      <div className="flex size-14 items-center justify-center rounded-full border bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (status === "success") {
    return (
      <div className="flex size-14 items-center justify-center rounded-full border border-signal/40 bg-signal/10">
        <CheckCircle2 className="size-6 text-signal" />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex size-14 items-center justify-center rounded-full border border-danger/40 bg-danger/10">
        <XCircle className="size-6 text-danger" />
      </div>
    );
  }
  return (
    <div className="flex size-14 items-center justify-center rounded-full border border-pending/40 bg-pending/10">
      <Mail className="size-6 text-pending" />
    </div>
  );
}
