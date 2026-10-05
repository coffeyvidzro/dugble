"use client";

import { CheckCircle2, Loader2, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type * as React from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  useAcceptInvitationByToken,
  useDeclineInvitationByToken,
  useInvitationByToken,
} from "@/hooks/queries/use-invitation-by-token";
import { cn } from "@/lib/utils";

export function TeamInvitationForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const invitationQuery = useInvitationByToken(token ?? "");
  const accept = useAcceptInvitationByToken();
  const decline = useDeclineInvitationByToken();

  function handleAccept() {
    if (!token) return;
    accept.mutate(token, {
      onSuccess: () => {
        toast.success("You've joined the team.");
        router.push("/dashboard");
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleDecline() {
    if (!token) return;
    decline.mutate(token, {
      onSuccess: () => {
        toast.success("Invitation declined.");
        router.push("/dashboard");
      },
      onError: (err) => toast.error(err.message),
    });
  }

  if (!token) {
    return (
      <InvitationShell
        className={className}
        {...props}
        title="Missing invitation link"
        subtitle="Open the invite link from your email to continue."
        statusIcon="error"
      />
    );
  }

  if (invitationQuery.isPending) {
    return (
      <InvitationShell
        className={className}
        {...props}
        title="Loading invitation"
        subtitle="One moment…"
        statusIcon="loading"
      />
    );
  }

  if (invitationQuery.isError) {
    return (
      <InvitationShell
        className={className}
        {...props}
        title="Invitation not found"
        subtitle="This link is invalid or has expired."
        statusIcon="error"
      />
    );
  }

  const invitation = invitationQuery.data;

  if (invitation.status !== "pending") {
    return (
      <InvitationShell
        className={className}
        {...props}
        title="Invitation already handled"
        subtitle={`This invitation has already been ${invitation.status}.`}
        statusIcon={invitation.status === "accepted" ? "success" : "error"}
      />
    );
  }

  const pending = accept.isPending || decline.isPending;

  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <AuthShell
        title="You've been invited"
        subtitle={`Join as ${invitation.role} on Dugble.`}
        backHref="/dashboard"
        backLabel="Back to dashboard"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full border border-signal/40 bg-signal/10">
            <Users className="size-6 text-signal" />
          </div>

          <div className="w-full space-y-3">
            <Button
              type="button"
              size="lg"
              className="w-full hover:cursor-pointer"
              onClick={handleAccept}
              disabled={pending}
            >
              {accept.isPending && <Loader2 className="size-4 animate-spin" />}
              Accept invitation
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full hover:cursor-pointer"
              onClick={handleDecline}
              disabled={pending}
            >
              {decline.isPending && <Loader2 className="size-4 animate-spin" />}
              Decline
            </Button>
          </div>
        </div>
      </AuthShell>
    </div>
  );
}

function InvitationShell({
  title,
  subtitle,
  statusIcon,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
  subtitle: string;
  statusIcon: "loading" | "success" | "error";
}) {
  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      <AuthShell
        title={title}
        subtitle={subtitle}
        backHref="/dashboard"
        backLabel="Back to dashboard"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          {statusIcon === "loading" && (
            <div className="flex size-14 items-center justify-center rounded-full border bg-background">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {statusIcon === "success" && (
            <div className="flex size-14 items-center justify-center rounded-full border border-signal/40 bg-signal/10">
              <CheckCircle2 className="size-6 text-signal" />
            </div>
          )}
          {statusIcon === "error" && (
            <div className="flex size-14 items-center justify-center rounded-full border border-danger/40 bg-danger/10">
              <XCircle className="size-6 text-danger" />
            </div>
          )}
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Go to dashboard
          </Link>
        </div>
      </AuthShell>
    </div>
  );
}
