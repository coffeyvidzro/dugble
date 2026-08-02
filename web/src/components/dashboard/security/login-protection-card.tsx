import { Clock, ShieldAlert, Users } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ToggleSwitch } from "./toggle-switch";
import {
    SESSION_TIMEOUT_LABEL,
    type AdvancedSecuritySettings,
    type SessionTimeout,
} from "./types";

const TIMEOUT_OPTIONS: SessionTimeout[] = ["30m", "1h", "24h", "7d", "never"];

export function LoginProtectionCard({
    settings,
    onUpdate,
}: {
    settings: AdvancedSecuritySettings;
    onUpdate: (patch: Partial<AdvancedSecuritySettings>) => void;
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={ShieldAlert}
                title="Login & Session Policy"
                description="Control how sign-ins are monitored and how long sessions stay alive."
            />
            <CardContent className="divide-y divide-border/40 pt-6">
                <div className="flex items-start justify-between gap-4 pb-5">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                            New device alerts
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Email me whenever a new device or browser signs in.
                        </p>
                    </div>
                    <ToggleSwitch
                        checked={settings.newDeviceAlerts}
                        onCheckedChange={(checked) =>
                            onUpdate({ newDeviceAlerts: checked })
                        }
                    />
                </div>

                <div className="flex items-start justify-between gap-4 py-5">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            <Users className="size-3.5 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">
                                Require 2FA for team members
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Everyone invited to your teams must enable
                            two-factor authentication before accessing
                            dashboards or API keys.
                        </p>
                    </div>
                    <ToggleSwitch
                        checked={settings.requireTeamTwoFactor}
                        onCheckedChange={(checked) =>
                            onUpdate({ requireTeamTwoFactor: checked })
                        }
                    />
                </div>

                <div className="space-y-3 pt-5">
                    <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">
                            Idle session timeout
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Automatically sign out sessions after a period of
                        inactivity.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {TIMEOUT_OPTIONS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() =>
                                    onUpdate({ sessionTimeout: option })
                                }
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                    settings.sessionTimeout === option
                                        ? "border-primary/40 bg-primary/10 text-primary"
                                        : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40",
                                )}
                            >
                                {SESSION_TIMEOUT_LABEL[option]}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
