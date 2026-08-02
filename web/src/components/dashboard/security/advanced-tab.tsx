import { AccessControlCard } from "./access-control-card";
import { LoginProtectionCard } from "./login-protection-card";
import type { AdvancedSecuritySettings } from "./types";

export function AdvancedTab({
    settings,
    onUpdate,
}: {
    settings: AdvancedSecuritySettings;
    onUpdate: (patch: Partial<AdvancedSecuritySettings>) => void;
}) {
    return (
        <div className="space-y-6">
            <LoginProtectionCard settings={settings} onUpdate={onUpdate} />
            <AccessControlCard settings={settings} onUpdate={onUpdate} />
        </div>
    );
}
