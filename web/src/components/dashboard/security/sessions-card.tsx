"use client";

import { Loader2, LogOut, MonitorSmartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import { ErrorState } from "@/components/dashboard/shared/data-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRevokeSessions, useSessions } from "@/hooks/queries/use-security";
import { formatDate, formatRelativeTime } from "@/lib/format-date";
import type { UserSession } from "@/types/security";
import { describeUserAgent } from "./describe-user-agent";

function isActive(session: UserSession, now: number): boolean {
  return !session.revoked_at && new Date(session.expires_at).getTime() > now;
}

type PendingAction =
  | { scope: "one"; session: UserSession }
  | { scope: "others" };

export function SessionsCard() {
  const sessions = useSessions();
  const revoke = useRevokeSessions();
  const [pending, setPending] = useState<PendingAction | null>(null);

  const active = useMemo(() => {
    const now = Date.now();
    return (sessions.data ?? [])
      .filter((session) => isActive(session, now))
      .sort(
        (a, b) =>
          new Date(b.last_seen_at ?? b.created_at).getTime() -
          new Date(a.last_seen_at ?? a.created_at).getTime(),
      );
  }, [sessions.data]);

  function handleConfirm() {
    if (!pending) return;
    const target =
      pending.scope === "others"
        ? ({ scope: "others" } as const)
        : ({ scope: "one", sessionId: pending.session.id } as const);
    revoke.mutate(target, {
      onSuccess: () => {
        toast.success(
          pending.scope === "others"
            ? "Signed out of all other sessions."
            : "Session revoked.",
        );
        setPending(null);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Card className="overflow-hidden">
      <SectionCardHeader
        icon={MonitorSmartphone}
        title="Active sessions"
        description="Devices currently signed in to your account."
      />
      <CardContent className="py-4">
        {sessions.isPending ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.isError ? (
          <ErrorState title="Couldn't load your sessions" />
        ) : active.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No active sessions.
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {active.map((session) => (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {describeUserAgent(session.user_agent)}
                    {session.mfa_completed_at && (
                      <span className="ml-2 rounded-full bg-signal/10 px-2 py-0.5 text-[10px] font-medium text-signal">
                        2FA
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {session.ip_address ?? "Unknown IP"} · last active{" "}
                    {formatRelativeTime(
                      session.last_seen_at ?? session.created_at,
                    )}{" "}
                    · signed in {formatDate(session.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPending({ scope: "one", session })}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {active.length > 1 && (
        <div className="flex items-center justify-end border-t border-border/40 bg-muted/10 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => setPending({ scope: "others" })}
          >
            <LogOut className="size-4" />
            Sign out other sessions
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.scope === "others"
            ? "Sign out of all other sessions?"
            : "Revoke this session?"
        }
        description={
          pending?.scope === "others"
            ? "Every device except this one will be signed out."
            : "That device will be signed out. If it's the device you're using now, you'll need to sign in again."
        }
        confirmLabel={
          pending?.scope === "others" ? "Sign out others" : "Revoke"
        }
        pending={revoke.isPending}
        pendingLabel="Revoking…"
        onConfirm={handleConfirm}
      />
    </Card>
  );
}
