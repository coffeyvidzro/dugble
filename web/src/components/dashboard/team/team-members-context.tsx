"use client";

import { createContext, useContext, useState } from "react";
import type { TeamMember, TeamRole } from "./types";

type TeamMembersContextType = {
    members: TeamMember[];
    activeCount: number;
    handleInvite: (email: string, role: TeamRole) => void;
    handleCancelInvite: (id: string) => void;
    handleRemoveMember: (id: string) => void;
    handleLeaveTeam: () => void;
};

const TeamMembersContext = createContext<TeamMembersContextType | null>(null);

export function TeamMembersProvider({
    children,
    currentUser,
}: {
    children: React.ReactNode;
    currentUser: { email: string; name: string };
}) {
    const [members, setMembers] = useState<TeamMember[]>([
        {
            id: "you",
            email: currentUser.email,
            role: "admin",
            status: "active",
            date: new Date(),
            isYou: true,
        },
    ]);

    function handleInvite(email: string, role: TeamRole) {
        setMembers((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                email,
                role,
                status: "pending",
                date: new Date(),
            },
        ]);
    }

    function handleCancelInvite(id: string) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
    }

    function handleRemoveMember(id: string) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
    }

    function handleLeaveTeam() {
        setMembers((prev) => prev.filter((m) => !m.isYou));
    }

    const activeCount = members.filter((m) => m.status === "active").length;

    return (
        <TeamMembersContext.Provider
            value={{
                members,
                activeCount,
                handleInvite,
                handleCancelInvite,
                handleRemoveMember,
                handleLeaveTeam,
            }}
        >
            {children}
        </TeamMembersContext.Provider>
    );
}

export function useTeamMembers() {
    const context = useContext(TeamMembersContext);
    if (!context) {
        throw new Error(
            "useTeamMembers must be used within TeamMembersProvider",
        );
    }
    return context;
}
