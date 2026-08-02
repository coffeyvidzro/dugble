import { ChangePasswordCard } from "./change-password-card";
import { TwoFactorCard } from "./two-factor-card";

export function AuthenticationTab({
    currentUserEmail,
    onPasswordChanged,
    twoFactorEnabled,
    recoveryCodes,
    onTwoFactorEnabled,
    onTwoFactorDisabled,
}: {
    currentUserEmail: string;
    onPasswordChanged: () => void;
    twoFactorEnabled: boolean;
    recoveryCodes: string[];
    onTwoFactorEnabled: (recoveryCodes: string[]) => void;
    onTwoFactorDisabled: () => void;
}) {
    return (
        <div className="space-y-6">
            <ChangePasswordCard
                currentUserEmail={currentUserEmail}
                onPasswordChanged={onPasswordChanged}
            />
            <TwoFactorCard
                enabled={twoFactorEnabled}
                recoveryCodes={recoveryCodes}
                onEnabled={onTwoFactorEnabled}
                onDisabled={onTwoFactorDisabled}
            />
        </div>
    );
}
