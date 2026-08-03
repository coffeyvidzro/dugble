export type DeviceType = "desktop" | "mobile" | "tablet";

export type SecuritySession = {
    id: string;
    device: string;
    browser: string;
    deviceType: DeviceType;
    location: string;
    ipAddress: string;
    lastActiveAt: Date;
    isCurrent: boolean;
};

export type PasswordInfo = {
    lastChangedAt: Date;
};

export type SecurityEventType =
    | "sign_in"
    | "failed_sign_in"
    | "password_changed"
    | "two_factor_enabled"
    | "two_factor_disabled"
    | "session_revoked"
    | "recovery_codes_regenerated"
    | "settings_changed";

export type SecurityEventSeverity = "info" | "success" | "warning" | "danger";

export type SecurityEvent = {
    id: string;
    type: SecurityEventType;
    description: string;
    occurredAt: Date;
    ipAddress?: string;
    device?: string;
    severity: SecurityEventSeverity;
};

export type SessionTimeout = "30m" | "1h" | "24h" | "7d" | "never";

export type AdvancedSecuritySettings = {
    newDeviceAlerts: boolean;
    requireTeamTwoFactor: boolean;
    sessionTimeout: SessionTimeout;
    ipAllowlist: string[];
};

export const SESSION_TIMEOUT_LABEL: Record<SessionTimeout, string> = {
    "30m": "30 minutes",
    "1h": "1 hour",
    "24h": "24 hours",
    "7d": "7 days",
    never: "Never",
};

export function daysSince(date: Date): number {
    const ms = Date.now() - date.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

export function formatDateTimeFull(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

export function formatRelativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    return formatDate(date);
}

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export function getPasswordStrength(password: string): {
    score: PasswordStrengthScore;
    label: string;
} {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

    const clamped = Math.min(score, 4) as PasswordStrengthScore;
    const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
    return { score: clamped, label: password ? labels[clamped] : "" };
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
