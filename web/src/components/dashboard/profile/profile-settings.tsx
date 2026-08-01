"use client";

import { useState } from "react";

import { TwoFactorAuthPanel } from "./two-factor-auth-panel";
import { PendingInvitesCard } from "./pending-invites-card";
import { DeleteAccountCard } from "./delete-account-card";
import { AccountEmailCard } from "./account-email-card";
import type { TeamInvite, UserTeam } from "./types";
import { UserTeamsCard } from "./user-teams-card";
import { ProfileHeader } from "./profile-header";

export function ProfileSettings({
    currentUser,
}: {
    currentUser: { email: string; name: string };
}) {
    const [teams, setTeams] = useState<UserTeam[]>([
        {
            id: "team-coffeyvidzro",
            name: "coffeyvidzro",
            role: "admin",
            memberCount: 1,
        },
    ]);

    const [invites, setInvites] = useState<TeamInvite[]>([
        {
            id: "invite-1",
            teamName: "Team Prosper",
            inviterEmail: "prosper@dugble.com",
            role: "member",
            memberCount: 6,
            createdAt: new Date(),
        },
    ]);

    function handleAcceptInvite(id: string) {
        const invite = invites.find((i) => i.id === id);
        if (!invite) return;
        setTeams((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                name: invite.teamName,
                role: invite.role,
                memberCount: invite.memberCount + 1,
            },
        ]);
        setInvites((prev) => prev.filter((i) => i.id !== id));
    }

    function handleDeclineInvite(id: string) {
        setInvites((prev) => prev.filter((i) => i.id !== id));
    }

    function handleLeaveTeam(id: string) {
        setTeams((prev) => prev.filter((t) => t.id !== id));
    }

    function handleDeleteTeam(id: string) {
        setTeams((prev) => prev.filter((t) => t.id !== id));
    }

    function handleDeleteAccount() {
        console.log("Account deleted (local only).");
    }

    return (
        <div className="mx-auto w-full max-w-5xl pb-8">
            <ProfileHeader name={currentUser.name} teamCount={teams.length} />

            <div className="space-y-8">
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "100ms",
                        animationFillMode: "both",
                    }}
                >
                    <AccountEmailCard initialEmail={currentUser.email} />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "150ms",
                        animationFillMode: "both",
                    }}
                >
                    <PendingInvitesCard
                        invites={invites}
                        onAccept={handleAcceptInvite}
                        onDecline={handleDeclineInvite}
                    />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "200ms",
                        animationFillMode: "both",
                    }}
                >
                    <UserTeamsCard
                        teams={teams}
                        onLeaveTeam={handleLeaveTeam}
                        onDeleteTeam={handleDeleteTeam}
                    />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "250ms",
                        animationFillMode: "both",
                    }}
                >
                    <TwoFactorAuthPanel />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "300ms",
                        animationFillMode: "both",
                    }}
                >
                    <DeleteAccountCard
                        teams={teams}
                        currentEmail={currentUser.email}
                        onDeleteTeam={handleDeleteTeam}
                        onDeleteAccount={handleDeleteAccount}
                    />
                </div>
            </div>
        </div>
    );
}
