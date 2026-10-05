// src/components/dashboard/profile/delete-account-panel.tsx

"use client";

import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useLeaveTeam } from "@/hooks/queries/use-team-members";
import { useDeleteTeam, useTeams } from "@/hooks/queries/use-teams";
import { useDeleteAccount } from "@/hooks/queries/use-user";
import type { TeamListItem } from "@/types/team";
import { TypedConfirmDialog } from "./typed-confirm-dialog";

export function DeleteAccountPanel({ currentEmail }: { currentEmail: string }) {
    const [teamDialogTeam, setTeamDialogTeam] = useState<TeamListItem | null>(
        null,
    );
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);

    // Only active teams block account deletion. Deleting a team soft-disables
    // it, so a deleted team still shows up under `status: "disabled"`. Counting
    // those would leave the user stuck in a loop of "deleting" a team that is
    // already deleted (which the API rejects).
    const { data: activeTeams, isPending } = useTeams({
        page: 1,
        limit: 1,
        status: "active",
    });

    const deleteTeam = useDeleteTeam();
    const leaveTeam = useLeaveTeam();
    const deleteAccount = useDeleteAccount();

    const totalTeams = activeTeams?.pagination.total ?? 0;
    const nextTeam = activeTeams?.items[0] ?? null;
    const canDeleteAccount = totalTeams === 0;

    const isNextTeamOwner = nextTeam?.user_role === "owner";
    const isDialogTeamOwner = teamDialogTeam?.user_role === "owner";

    function handleConfirmTeamAction() {
        if (!teamDialogTeam) return;

        if (isDialogTeamOwner) {
            deleteTeam.mutate(teamDialogTeam.id, {
                onSuccess: () => {
                    toast.success(`Deleted ${teamDialogTeam.name}.`);
                    setTeamDialogTeam(null);
                },
                onError: (err) => toast.error(err.message),
            });
        } else {
            leaveTeam.mutate(teamDialogTeam.id, {
                onSuccess: () => {
                    toast.success(`Left ${teamDialogTeam.name}.`);
                    setTeamDialogTeam(null);
                },
                onError: (err) => toast.error(err.message),
            });
        }
    }

    function handleConfirmAccountDelete() {
        deleteAccount.mutate(undefined, {
            onSuccess: () => {
                setAccountDialogOpen(false);
                window.location.href = "/";
            },
            onError: (err) => toast.error(err.message),
        });
    }

    if (isPending) {
        return (
            <CardContent className="flex justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </CardContent>
        );
    }

    return (
        <>
            <CardContent>
                {!canDeleteAccount && nextTeam ? (
                    <div className="space-y-3 rounded-lg border border-pending/30 bg-pending/10 p-4">
                        <p className="text-sm leading-relaxed text-pending">
                            Accounts can only be deleted when there are no more
                            teams associated with them. You are currently a
                            member of{" "}
                            <span className="font-mono font-medium">
                                {nextTeam.name}
                            </span>{" "}
                            ({nextTeam.user_role}).{" "}
                            {isNextTeamOwner
                                ? "As the owner, you must delete this team before proceeding."
                                : "You must leave this team before proceeding."}
                        </p>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-pending/40 text-pending hover:bg-pending/10"
                            onClick={() => setTeamDialogTeam(nextTeam)}
                        >
                            {isNextTeamOwner ? "Delete" : "Leave"}{" "}
                            {nextTeam.name}
                            <ArrowRight className="ml-1.5 size-3.5" />
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-danger/80">
                            You have no teams associated with your account.
                            Deleting your account removes your profile,
                            sessions, and any personal access tokens. This
                            cannot be undone.
                        </p>
                        <Button
                            type="button"
                            variant="destructive"
                            className="bg-danger/90 text-white hover:bg-danger shadow-sm transition-colors"
                            onClick={() => setAccountDialogOpen(true)}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete Account
                        </Button>
                    </div>
                )}
            </CardContent>

            <TypedConfirmDialog
                open={teamDialogTeam !== null}
                onOpenChange={(open) => !open && setTeamDialogTeam(null)}
                title={
                    isDialogTeamOwner ? (
                        <>Delete &ldquo;{teamDialogTeam?.name}&rdquo;?</>
                    ) : (
                        <>Leave &ldquo;{teamDialogTeam?.name}&rdquo;?</>
                    )
                }
                description={
                    isDialogTeamOwner ? (
                        <>
                            This permanently deletes the team, including its API
                            keys, webhooks, delivery workflows, and historical
                            logs. This <strong>cannot</strong> be undone.
                        </>
                    ) : (
                        <>
                            You will lose access to this team and all of its
                            resources. To rejoin in the future, an admin or
                            owner will need to re-invite you.
                        </>
                    )
                }
                confirmPhrase={teamDialogTeam?.name ?? ""}
                confirmLabel={
                    isDialogTeamOwner ? "Permanently Delete" : "Leave Team"
                }
                pendingLabel={isDialogTeamOwner ? "Deleting..." : "Leaving..."}
                cancelLabel={isDialogTeamOwner ? "Keep Team" : "Cancel"}
                pending={deleteTeam.isPending || leaveTeam.isPending}
                onConfirm={handleConfirmTeamAction}
            />

            <TypedConfirmDialog
                open={accountDialogOpen}
                onOpenChange={setAccountDialogOpen}
                title="Delete your account?"
                description={
                    <>
                        This permanently deletes your Dugble account, profile,
                        and sessions. Any personal access tokens will stop
                        working immediately.{" "}
                        <strong>This cannot be undone.</strong>
                    </>
                }
                confirmPhrase={currentEmail}
                caseInsensitive
                cancelLabel="Keep Account"
                pending={deleteAccount.isPending}
                onConfirm={handleConfirmAccountDelete}
            />
        </>
    );
}
