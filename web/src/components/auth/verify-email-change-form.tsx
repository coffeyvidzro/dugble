"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type * as React from "react";
import { useEffect, useRef } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { buttonVariants } from "@/components/ui/button";
import { useVerifyEmailChange } from "@/hooks/queries/use-user";
import { cn } from "@/lib/utils";

type Status = "missing" | "verifying" | "success" | "error";

export function VerifyEmailChangeForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const verifyEmailChange = useVerifyEmailChange();

  const submittedToken = useRef<string | null>(null);
  useEffect(() => {
    if (!token) return;

    if (submittedToken.current === token) return;
    submittedToken.current = token;
    verifyEmailChange.mutate({ token });
  }, [token, verifyEmailChange.mutate]);

  useEffect(() => {
    if (!verifyEmailChange.isSuccess) return;
    const timeout = setTimeout(() => {
      window.location.href = "/login";
    }, 2500);
    return () => clearTimeout(timeout);
  }, [verifyEmailChange.isSuccess]);

  const status: Status = !token
    ? "missing"
    : verifyEmailChange.isSuccess
      ? "success"
      : verifyEmailChange.isError
        ? "error"
        : "verifying";

  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <AuthShell
        title={
          status === "success"
            ? "Email updated"
            : status === "error"
              ? "Verification failed"
              : status === "missing"
                ? "Missing confirmation link"
                : "Confirming your email"
        }
        subtitle={
          status === "success"
            ? "Your new email is confirmed. Sign in again to continue."
            : status === "error"
              ? "That link is invalid or has expired."
              : status === "missing"
                ? "Open the link from your confirmation email to continue."
                : "One moment while we confirm your new address."
        }
        backHref="/dashboard/settings/profile"
        backLabel="Back to profile settings"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <StatusBadge status={status} />

          {status === "verifying" && (
            <p className="text-sm text-muted-foreground">
              Confirming your new email…
            </p>
          )}

          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              You&apos;ve been signed out on this device for security.
              Redirecting to sign in…
            </p>
          )}

          {(status === "error" || status === "missing") && (
            <Link
              href="/dashboard/settings/profile"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Back to profile settings
            </Link>
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
  return (
    <div className="flex size-14 items-center justify-center rounded-full border border-danger/40 bg-danger/10">
      <XCircle className="size-6 text-danger" />
    </div>
  );
}
