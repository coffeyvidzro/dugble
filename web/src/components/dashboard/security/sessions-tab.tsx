import { SessionsCard } from "./sessions-card";
import type { SecuritySession } from "./types";

export function SessionsTab({
    sessions,
    onRevokeSession,
    onRevokeAll,
}: {
    sessions: SecuritySession[];
    onRevokeSession: (id: string) => void;
    onRevokeAll: () => void;
}) {
    return (
        <SessionsCard
            sessions={sessions}
            onRevokeSession={onRevokeSession}
            onRevokeAll={onRevokeAll}
        />
    );
}
