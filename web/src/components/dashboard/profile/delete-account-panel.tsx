"use client";

import { useState } from "react";

import { ArrowRight, Trash2 } from "lucide-react";

import { TypedConfirmDialog } from "./typed-confirm-dialog";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserTeam } from "./types";

export function DeleteAccountPanel({
    teams,
    currentEmail,
    onDeleteTeam,
    onDeleteAccount,
}: {
    teams: UserTeam[];
    currentEmail: string;
    onDeleteTeam: (id: string) => void;
    onDeleteAccount: () => void;
}) {
    const [teamDialogTeam, setTeamDialogTeam] = useState<UserTeam | null>(null);
    const [accountDialogOpen, setAccountDialogOpen] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    const nextTeam = teams[0] ?? null;
    const canDeleteAccount = teams.length === 0;

    function handleConfirmAccountDelete() {
        setDeletingAccount(true);
        window.setTimeout(() => {
            onDeleteAccount();
            setDeletingAccount(false);
            setAccountDialogOpen(false);
        }, 800);
    }

    return (
        <>
            <CardContent>
                {!canDeleteAccount && nextTeam ? (
                    <div className="space-y-3 rounded-lg border border-pending/30 bg-pending/10 p-4">
                        <p className="text-sm leading-relaxed text-pending">
                            Accounts can only be deleted when there are no more
                            teams still associated with it. Start by deleting
                            your active team,{" "}
                            <span className="font-mono font-medium">
                                {nextTeam.name}
                            </span>
                            . After each team is removed, the next remaining
                            team will appear here until you can delete your
                            account.
                        </p>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-pending/40 text-pending hover:bg-pending/10"
                            onClick={() => setTeamDialogTeam(nextTeam)}
                        >
                            Delete {nextTeam.name}
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
                title={<>Delete &ldquo;{teamDialogTeam?.name}&rdquo;?</>}
                description={
                    <>
                        This permanently deletes the team, including its API
                        keys, webhooks, delivery workflows, and historical logs.
                        This <strong>cannot</strong> be undone.
                    </>
                }
                confirmPhrase={teamDialogTeam?.name ?? ""}
                cancelLabel="Keep Team"
                onConfirm={() => {
                    if (!teamDialogTeam) return;
                    onDeleteTeam(teamDialogTeam.id);
                    setTeamDialogTeam(null);
                }}
            />

            <TypedConfirmDialog
                open={accountDialogOpen}
                onOpenChange={(next) => {
                    setAccountDialogOpen(next);
                    if (!next) setDeletingAccount(false);
                }}
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
                pending={deletingAccount}
                onConfirm={handleConfirmAccountDelete}
            />
        </>
    );
}
