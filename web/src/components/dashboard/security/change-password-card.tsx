import { KeyRound } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password-form";

export function ChangePasswordCard({
    currentUserEmail,
    onPasswordChanged,
}: {
    currentUserEmail: string;
    onPasswordChanged: () => void;
}) {
    return (
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <SectionCardHeader
                icon={KeyRound}
                title="Password"
                description="Choose a strong password you don't use anywhere else."
            />
            <ChangePasswordForm
                currentUserEmail={currentUserEmail}
                onPasswordChanged={onPasswordChanged}
            />
        </Card>
    );
}
