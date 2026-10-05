"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useInviteMember,
  useLeaveTeam,
  useRemoveMember,
  useTeamMembers,
} from "@/hooks/queries/use-team-members";
import { useCurrentUser } from "@/hooks/queries/use-user";
import type { InvitableRole, TeamMember } from "@/types/team";
import { useTeamPermissions } from "../../../hooks/queries/use-team-permissions";
import { InviteMemberDialog } from "./invite-member-dialog";
import { TableToolbar } from "./table-toolbar";
import { TeamInvitationsPanel } from "./team-invitations-panel";
import { TeamMemberRow } from "./team-member-row";

export type MemberAction =
  | { type: "leave" }
  | { type: "remove"; member: TeamMember };

function MemberActionDialog({
  action,
  pending,
  onClose,
  onExecute,
}: {
  action: MemberAction | null;
  pending: boolean;
  onClose: () => void;
  onExecute: () => void;
}) {
  return (
    <AlertDialog
      open={action !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action?.type === "leave"
              ? "Leave this team?"
              : `Remove this member?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action?.type === "leave"
              ? "You'll lose access to this team's dashboard, logs, and API keys immediately."
              : "They will immediately lose access to this team's dashboard, logs, and API settings."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-danger text-white hover:bg-danger/90"
            disabled={pending}
            onClick={onExecute}
          >
            {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {action?.type === "leave" ? "Leave team" : "Remove user"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function TeamMembersClient({ teamId }: { teamId: string }) {
  const { data: user } = useCurrentUser();
  const { data: members, isPending, isError, error } = useTeamMembers(teamId);
  const { canManageTeam } = useTeamPermissions();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const leaveTeam = useLeaveTeam();

  const [pendingAction, setPendingAction] = useState<MemberAction | null>(null);
  const [query, setQuery] = useState("");

  const ownerCount = useMemo(
    () =>
      members?.filter((m) => m.role === "owner" && m.status === "active")
        .length ?? 0,
    [members],
  );

  const you = members?.find((m) => m.user_id === user?.id);
  const youAreSoleOwner =
    !!you && you.role === "owner" && you.status === "active" && ownerCount <= 1;

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!members) return [];
    if (!q) return members;
    return members.filter(
      (m) =>
        m.user.name.toLowerCase().includes(q) ||
        m.user.email.toLowerCase().includes(q),
    );
  }, [members, query]);

  function handleInvite(email: string, role: InvitableRole) {
    inviteMember.mutate(
      { teamId, email, role },
      {
        onSuccess: () => toast.success(`Invited ${email}.`),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function executePendingAction() {
    if (!pendingAction) return;

    if (pendingAction.type === "leave") {
      leaveTeam.mutate(teamId, {
        onSuccess: () => {
          toast.success("Left the team.");
          setPendingAction(null);
        },
        onError: (err) => toast.error(err.message),
      });
      return;
    }

    removeMember.mutate(
      { teamId, userId: pendingAction.member.user_id },
      {
        onSuccess: () => {
          toast.success("Member removed.");
          setPendingAction(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  const actionPending = leaveTeam.isPending || removeMember.isPending;

  if (isPending) {
    return (
      <div className="flex min-h-32 items-center justify-center py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center gap-1 py-10 text-center">
        <p className="text-sm font-medium text-danger">
          Couldn&apos;t load members.
        </p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const nonActiveCount = members.filter((m) => m.status !== "active").length;

  return (
    <>
      {canManageTeam && <TeamInvitationsPanel teamId={teamId} />}

      <TableToolbar
        totalCount={members.length}
        itemNameSingular="member"
        itemNamePlural="members"
        statusNode={
          nonActiveCount > 0 && (
            <span className="text-pending"> · {nonActiveCount} not active</span>
          )
        }
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search members"
        actionNode={
          canManageTeam ? <InviteMemberDialog onInvite={handleInvite} /> : null
        }
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="w-75">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No members match &ldquo;{query}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TeamMemberRow
                  key={member.user_id}
                  member={member}
                  isYou={member.user_id === user?.id}
                  youAreSoleOwner={youAreSoleOwner}
                  canManageTeam={canManageTeam}
                  onAction={setPendingAction}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MemberActionDialog
        action={pendingAction}
        pending={actionPending}
        onClose={() => setPendingAction(null)}
        onExecute={executePendingAction}
      />
    </>
  );
}
