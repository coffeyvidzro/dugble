import { Network } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { IpAllowlistManager } from "./ip-allowlist-manager";
import type { AdvancedSecuritySettings } from "./types";

export function AccessControlCard({
    settings,
    onUpdate,
}: {
    settings: AdvancedSecuritySettings;
    onUpdate: (patch: Partial<AdvancedSecuritySettings>) => void;
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={Network}
                title="Access Control"
                description="Restrict dashboard access to trusted IP ranges."
            />
            <CardContent className="pt-6">
                <IpAllowlistManager
                    entries={settings.ipAllowlist}
                    onChange={(ipAllowlist) => onUpdate({ ipAllowlist })}
                />
            </CardContent>
        </Card>
    );
}
