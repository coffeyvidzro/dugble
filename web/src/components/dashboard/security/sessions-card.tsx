import { Laptop } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card } from "@/components/ui/card";
import { SessionsPanel } from "./sessions-panel";
import type { SecuritySession } from "./types";

export function SessionsCard({
    sessions,
    onRevokeSession,
    onRevokeAll,
}: {
    sessions: SecuritySession[];
    onRevokeSession: (id: string) => void;
    onRevokeAll: () => void;
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={Laptop}
                title="Active Sessions"
                description="Devices currently signed in to your Dugble account."
            />
            <SessionsPanel
                sessions={sessions}
                onRevokeSession={onRevokeSession}
                onRevokeAll={onRevokeAll}
            />
        </Card>
    );
}
