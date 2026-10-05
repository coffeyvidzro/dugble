// src/components/dashboard/team/team-invitations-panel.tsx

"use client";

import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  useRevokeTeamInvitation,
  useTeamInvitations,
} from "@/hooks/queries/use-team-members";
import { useTeamPermissions } from "@/hooks/queries/use-team-permissions";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function TeamInvitationsPanel({ teamId }: { teamId: string }) {
  const { canManageTeam, isLoading: isPermissionsLoading } =
    useTeamPermissions();
  const { data: invitations, isPending } = useTeamInvitations(
    teamId,
    canManageTeam && !isPermissionsLoading,
  );
  const revoke = useRevokeTeamInvitation();

  if (
    !canManageTeam ||
    isPermissionsLoading ||
    isPending ||
    !invitations ||
    invitations.length === 0
  ) {
    return null;
  }

  function handleRevoke(invitationId: string, email: string) {
    revoke.mutate(
      { teamId, invitationId },
      {
        onSuccess: () => toast.success(`Invite to ${email} cancelled.`),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-2 border-b border-border/40 bg-pending/5 px-6 py-4">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        Pending invites
      </p>
      <div className="space-y-1.5">
        {invitations.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-pending/20 bg-background px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm">{invite.email}</span>
              <Badge
                variant="outline"
                className="shrink-0 text-xs font-normal capitalize shadow-none"
              >
                {invite.role}
              </Badge>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Expires {formatDate(invite.expires_at)}
              </span>
              <button
                type="button"
                onClick={() => handleRevoke(invite.id, invite.email)}
                disabled={revoke.isPending}
                aria-label={`Cancel invite to ${invite.email}`}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-50"
              >
                {revoke.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <X className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
