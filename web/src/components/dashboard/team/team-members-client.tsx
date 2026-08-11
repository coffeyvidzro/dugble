"use client";

import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import { useTeamMembers } from "./team-members-context";
import { TableToolbar } from "./table-toolbar";
import { TeamMemberRow } from "./team-member-row";
import { InviteMemberDialog } from "./invite-member-dialog";
import type { TeamMember } from "./types";

export type MemberAction =
    | { type: "leave" }
    | { type: "remove"; member: TeamMember }
    | { type: "cancel_invite"; member: TeamMember };

function MemberActionDialog({
    action,
    onClose,
    onExecute,
}: {
    action: MemberAction | null;
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
                            : action?.type === "cancel_invite"
                              ? "Cancel invitation?"
                              : `Remove ${action?.type === "remove" ? action.member.email : ""}?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {action?.type === "leave"
                            ? "You'll lose access to this team's dashboard, logs, and API keys immediately."
                            : action?.type === "cancel_invite"
                              ? "They will no longer be able to use the invitation link to join this team."
                              : "They will immediately lose access to this team's dashboard, logs, and API settings."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className={cn(
                            "bg-danger text-white hover:bg-danger/90",
                        )}
                        onClick={() => {
                            onExecute();
                            onClose();
                        }}
                    >
                        {action?.type === "leave"
                            ? "Leave team"
                            : action?.type === "cancel_invite"
                              ? "Cancel Invite"
                              : "Remove user"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function TeamMembersClient() {
    const {
        members,
        handleInvite,
        handleCancelInvite,
        handleRemoveMember,
        handleLeaveTeam,
    } = useTeamMembers();

    const [pendingAction, setPendingAction] = useState<MemberAction | null>(
        null,
    );
    const [query, setQuery] = useState("");

    const adminCount = members.filter(
        (m) => m.role === "admin" && m.status === "active",
    ).length;
    const pendingCount = members.filter((m) => m.status === "pending").length;

    const you = members.find((m) => m.isYou);
    const youAreSoleAdmin =
        !!you &&
        you.role === "admin" &&
        you.status === "active" &&
        adminCount <= 1;

    const filteredMembers = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return members;
        return members.filter((m) => m.email.toLowerCase().includes(q));
    }, [members, query]);

    const executePendingAction = () => {
        if (!pendingAction) return;
        if (pendingAction.type === "leave") handleLeaveTeam();
        else if (pendingAction.type === "remove")
            handleRemoveMember(pendingAction.member.id);
        else if (pendingAction.type === "cancel_invite")
            handleCancelInvite(pendingAction.member.id);
    };

    return (
        <>
            <TableToolbar
                totalCount={members.length}
                itemNameSingular="member"
                itemNamePlural="members"
                statusNode={
                    pendingCount > 0 && (
                        <span className="text-pending">
                            {" "}
                            · {pendingCount} pending
                        </span>
                    )
                }
                searchQuery={query}
                onSearchChange={setQuery}
                searchPlaceholder="Search members"
                actionNode={
                    <InviteMemberDialog
                        existingEmails={members.map((m) => m.email)}
                        onInvite={handleInvite}
                    />
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
                                    key={member.id}
                                    member={member}
                                    youAreSoleAdmin={youAreSoleAdmin}
                                    onAction={setPendingAction}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <MemberActionDialog
                action={pendingAction}
                onClose={() => setPendingAction(null)}
                onExecute={executePendingAction}
            />
        </>
    );
}
