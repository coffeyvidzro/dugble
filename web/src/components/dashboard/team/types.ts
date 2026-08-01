export type TeamRole = "admin" | "member";
export type MemberStatus = "active" | "pending";

export type TeamMember = {
    id: string;
    email: string;
    role: TeamRole;
    status: MemberStatus;
    date: Date;
    isYou?: boolean;
};

export type TokenScope = "read_only" | "full_access";
export type TokenExpiry = "30d" | "90d" | "1y" | "never";

export type ManagementToken = {
    id: string;
    name: string;
    scope: TokenScope;
    expiry: TokenExpiry;
    createdAt: Date;
    expiresAt: Date | null;
    maskedToken: string;
    fullToken?: string;
};

export const TOKEN_SCOPE_LABEL: Record<TokenScope, string> = {
    read_only: "Read-only",
    full_access: "Full access",
};

export const TOKEN_EXPIRY_LABEL: Record<TokenExpiry, string> = {
    "30d": "30 days",
    "90d": "90 days",
    "1y": "1 year",
    never: "Never",
};

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function expiryToDate(expiry: TokenExpiry, from: Date): Date | null {
    const date = new Date(from);
    switch (expiry) {
        case "30d":
            date.setDate(date.getDate() + 30);
            return date;
        case "90d":
            date.setDate(date.getDate() + 90);
            return date;
        case "1y":
            date.setFullYear(date.getFullYear() + 1);
            return date;
        case "never":
            return null;
    }
}

function randomHex(length: number): string {
    const chars = "abcdef0123456789";
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
}

export function generateTeamToken(): { full: string; masked: string } {
    const body = randomHex(24);
    const full = `tk_team_${body}`;
    const masked = `tk_team_${body.slice(0, 4)}\u2022\u2022\u2022\u2022${body.slice(-4)}`;
    return { full, masked };
}
