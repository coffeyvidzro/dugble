import {
    AlertTriangle,
    History,
    KeyRound,
    LogIn,
    ShieldAlert,
    ShieldCheck,
    ShieldOff,
    ShieldX,
    SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    formatRelativeTime,
    type SecurityEvent,
    type SecurityEventSeverity,
    type SecurityEventType,
} from "./types";

const EVENT_ICON: Record<SecurityEventType, LucideIcon> = {
    sign_in: LogIn,
    failed_sign_in: AlertTriangle,
    password_changed: KeyRound,
    two_factor_enabled: ShieldCheck,
    two_factor_disabled: ShieldOff,
    session_revoked: ShieldX,
    recovery_codes_regenerated: KeyRound,
    settings_changed: SlidersHorizontal,
};

const SEVERITY_STYLE: Record<SecurityEventSeverity, string> = {
    info: "border-l-border text-muted-foreground",
    success: "border-l-signal text-signal",
    warning: "border-l-pending text-pending",
    danger: "border-l-danger text-danger",
};

export function ActivityLogCard({ events }: { events: SecurityEvent[] }) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={History}
                title="Security Activity"
                description="A running log of sign-ins, changes, and alerts on your account."
            />

            {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                        <ShieldAlert className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        Nothing to show yet
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Security-related activity on your account will appear
                        here.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-border/40">
                    {events.map((event) => {
                        const Icon = EVENT_ICON[event.type];
                        return (
                            <div
                                key={event.id}
                                className={cn(
                                    "flex items-start gap-3 border-l-2 px-6 py-4 transition-colors hover:bg-muted/10",
                                    SEVERITY_STYLE[event.severity],
                                )}
                            >
                                <Icon className="mt-0.5 size-4 shrink-0" />
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className="text-sm font-medium text-foreground">
                                        {event.description}
                                    </p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {formatRelativeTime(event.occurredAt)}
                                        {event.device
                                            ? ` · ${event.device}`
                                            : ""}
                                        {event.ipAddress
                                            ? ` · ${event.ipAddress}`
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
