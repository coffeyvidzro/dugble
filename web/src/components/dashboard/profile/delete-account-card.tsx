import { AlertTriangle } from "lucide-react";

import { DeleteAccountPanel } from "./delete-account-panel";
import { SectionCardHeader } from "./section-card-header";
import { Card } from "@/components/ui/card";
import type { UserTeam } from "./types";

export function DeleteAccountCard({
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
    return (
        <Card className="border-danger/30 bg-danger/5 shadow-sm transition-colors hover:border-danger/50">
            <SectionCardHeader
                icon={AlertTriangle}
                title="Delete Account"
                description="Permanently delete your Dugble account and profile."
                tone="danger"
            />
            <DeleteAccountPanel
                teams={teams}
                currentEmail={currentEmail}
                onDeleteTeam={onDeleteTeam}
                onDeleteAccount={onDeleteAccount}
            />
        </Card>
    );
}
