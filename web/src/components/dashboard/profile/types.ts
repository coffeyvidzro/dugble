export type MembershipRole = "admin" | "member";

export type UserTeam = {
    id: string;
    name: string;
    role: MembershipRole;
    memberCount: number;
};

export type TeamInvite = {
    id: string;
    teamName: string;
    inviterEmail: string;
    role: MembershipRole;
    memberCount: number;
    createdAt: Date;
};

export const MEMBERSHIP_ROLE_LABEL: Record<MembershipRole, string> = {
    admin: "Admin",
    member: "Member",
};

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

const AVATAR_PALETTE = [
    "bg-primary/10 text-primary",
    "bg-signal/10 text-signal",
    "bg-pending/10 text-pending",
    "bg-chart-3/20 text-chart-3",
    "bg-chart-5/25 text-chart-5",
];

export function avatarStyle(seed: string): string {
    const hash = Array.from(seed).reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0,
    );
    return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function initialsFromName(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function randomCodeChunk(length: number): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
}

export function generateRecoveryCodes(count = 8): string[] {
    return Array.from(
        { length: count },
        () => `${randomCodeChunk(4)}-${randomCodeChunk(4)}`,
    );
}
