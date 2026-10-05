"use client";

import { CheckCircle2, Loader2, RefreshCw, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCancelPendingEmailChange,
  useChangeEmail,
  useResendEmailChangeVerification,
} from "@/hooks/queries/use-user";
import { cn } from "@/lib/utils";
import { changeEmailInputSchema, type PendingEmailChange } from "@/types/user";

function formatExpiry(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AccountEmailForm({
  email,
  emailVerified,
}: {
  email: string;
  emailVerified: boolean;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingEmailChange | null>(null);

  const changeEmail = useChangeEmail();
  const resend = useResendEmailChangeVerification();
  const cancelPending = useCancelPendingEmailChange();

  const canSubmit = newEmail.trim().length > 0 && currentPassword.length > 0;

  function handleSave() {
    const trimmed = newEmail.trim().toLowerCase();
    if (trimmed === email.toLowerCase()) {
      setError("That's already your current email.");
      return;
    }

    const parsed = changeEmailInputSchema.safeParse({
      email: trimmed,
      current_password: currentPassword,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    setError(null);
    changeEmail.mutate(parsed.data, {
      onSuccess: (pendingChange) => {
        setPending(pendingChange);
        setNewEmail("");
        setCurrentPassword("");
        toast.success("Confirmation link sent.");
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleResend() {
    resend.mutate(undefined, {
      onSuccess: (pendingChange) => {
        setPending(pendingChange);
        toast.success("Verification email sent.");
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleCancel() {
    cancelPending.mutate(undefined, {
      onSuccess: () => {
        setPending(null);
        toast.success("Pending email change cancelled.");
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <>
      <CardContent className="space-y-4 pt-6">
        <div className="max-w-sm space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="account-email">Email Address</Label>
            {emailVerified ? (
              <Badge
                variant="outline"
                className="gap-1 border-signal/30 bg-signal/10 text-signal shadow-none"
              >
                <CheckCircle2 className="size-3" />
                Verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-pending/30 bg-pending/10 text-pending shadow-none"
              >
                <ShieldAlert className="size-3" />
                Unverified
              </Badge>
            )}
          </div>
          <Input
            id="account-email"
            value={email}
            disabled
            className="w-full rounded-lg border border-border/60 bg-muted/10 py-2 pl-4 pr-4 text-sm text-muted-foreground"
          />
        </div>

        {pending ? (
          <div className="flex flex-col gap-3 rounded-lg border border-pending/30 bg-pending/10 p-4 animate-fade-up sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-pending">
                Confirm your new email
              </p>
              <p className="text-sm text-pending/80">
                We sent a confirmation link to{" "}
                <span className="font-mono">{pending.pending_email}</span>. It
                expires {formatExpiry(pending.verification_expires_at)}.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleResend}
                disabled={resend.isPending}
                className="border-pending/40 text-pending hover:bg-pending/10"
              >
                {resend.isPending ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 size-3.5" />
                )}
                Resend
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={cancelPending.isPending}
              >
                {cancelPending.isPending ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <X className="mr-1.5 size-3.5" />
                )}
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-sm space-y-3 rounded-lg border border-border/50 bg-muted/10 p-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(event) => {
                  setNewEmail(event.target.value);
                  setError(null);
                }}
                placeholder="new@email.com"
                disabled={changeEmail.isPending}
                className="w-full rounded-lg border border-border/60 bg-background py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setError(null);
                }}
                placeholder="Confirm it's you"
                disabled={changeEmail.isPending}
                className="w-full rounded-lg border border-border/60 bg-background py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            {error && (
              <p className="text-xs font-medium text-danger animate-fade-up">
                {error}
              </p>
            )}
          </div>
        )}
      </CardContent>
      {!pending && (
        <div className="flex items-center justify-end border-t border-border/40 bg-muted/10 px-6 py-4">
          <Button
            onClick={handleSave}
            disabled={!canSubmit || changeEmail.isPending}
            className={cn(
              "group/button relative inline-flex min-w-30 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20",
              changeEmail.isPending && "opacity-80",
            )}
          >
            {changeEmail.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {changeEmail.isPending ? "Sending..." : "Update email"}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
            />
          </Button>
        </div>
      )}
    </>
  );
}
