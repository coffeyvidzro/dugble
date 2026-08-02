"use client";

import { useState } from "react";

import { ActiveSessionsCard } from "./active-sessions-card";
import { ActivityTab } from "./activity-tab";
import { AdvancedTab } from "./advanced-tab";
import { AuthenticationTab } from "./authentication-tab";
import { PasswordAgeCard } from "./password-age-card";
import { RecoveryCodesCard } from "./recovery-codes-card";
import { SecurityHeader } from "./security-header";
import { SecurityRecommendationBanner } from "./security-recommendation-banner";
import { SecurityTabBar, type SecurityTabValue } from "./security-tab-bar";
import { SessionsTab } from "./sessions-tab";
import { TwoFactorStatusCard } from "./two-factor-status-card";
import type {
    AdvancedSecuritySettings,
    PasswordInfo,
    SecurityEvent,
    SecuritySession,
} from "./types";

const INITIAL_SESSIONS: SecuritySession[] = [
    {
        id: "session-1",
        device: "Dell Inspiron 3542",
        browser: "Chrome 126",
        deviceType: "desktop",
        location: "Accra, Ghana",
        ipAddress: "154.160.22.104",
        lastActiveAt: new Date(),
        isCurrent: true,
    },
    {
        id: "session-2",
        device: "iPhone 15 Pro",
        browser: "Safari",
        deviceType: "mobile",
        location: "Accra, Ghana",
        ipAddress: "154.160.22.108",
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 42),
        isCurrent: false,
    },
    {
        id: "session-3",
        device: "Windows PC",
        browser: "Edge 125",
        deviceType: "desktop",
        location: "Akatsi South",
        ipAddress: "82.132.61.19",
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
        isCurrent: false,
    },
];

const INITIAL_ACTIVITY: SecurityEvent[] = [
    {
        id: "evt-1",
        type: "sign_in",
        description: "Signed in from a new device",
        occurredAt: new Date(Date.now() - 1000 * 60 * 42),
        ipAddress: "154.160.22.108",
        device: "iPhone 15 Pro · Safari",
        severity: "info",
    },
    {
        id: "evt-2",
        type: "sign_in",
        description: "Signed in from a new device",
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
        ipAddress: "82.132.61.19",
        device: "Windows PC · Edge",
        severity: "warning",
    },
    {
        id: "evt-3",
        type: "password_changed",
        description: "Password was changed",
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 46),
        ipAddress: "154.160.22.104",
        device: "MacBook Pro · Chrome",
        severity: "success",
    },
    {
        id: "evt-4",
        type: "failed_sign_in",
        description: "Failed sign-in attempt (incorrect password)",
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        ipAddress: "203.0.113.44",
        severity: "danger",
    },
];

export function SecuritySettings({
    currentUserEmail,
}: {
    currentUserEmail: string;
}) {
    const [sessions, setSessions] =
        useState<SecuritySession[]>(INITIAL_SESSIONS);
    const [activity, setActivity] = useState<SecurityEvent[]>(INITIAL_ACTIVITY);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [usedRecoveryCodes, setUsedRecoveryCodes] = useState(0);
    const [passwordInfo, setPasswordInfo] = useState<PasswordInfo>({
        lastChangedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 46),
    });
    const [advancedSettings, setAdvancedSettings] =
        useState<AdvancedSecuritySettings>({
            newDeviceAlerts: true,
            requireTeamTwoFactor: false,
            sessionTimeout: "7d",
            ipAllowlist: [],
        });
    const [activeTab, setActiveTab] =
        useState<SecurityTabValue>("authentication");

    function logEvent(event: Omit<SecurityEvent, "id" | "occurredAt">) {
        setActivity((prev) => [
            { ...event, id: crypto.randomUUID(), occurredAt: new Date() },
            ...prev,
        ]);
    }

    function handlePasswordChanged() {
        setPasswordInfo({ lastChangedAt: new Date() });
        logEvent({
            type: "password_changed",
            description: "Password was changed",
            severity: "success",
        });
    }

    function handleTwoFactorEnabled(codes: string[]) {
        setTwoFactorEnabled(true);
        setRecoveryCodes(codes);
        setUsedRecoveryCodes(0);
        logEvent({
            type: "two_factor_enabled",
            description: "Two-factor authentication was enabled",
            severity: "success",
        });
    }

    function handleTwoFactorDisabled() {
        setTwoFactorEnabled(false);
        setRecoveryCodes([]);
        setUsedRecoveryCodes(0);
        logEvent({
            type: "two_factor_disabled",
            description: "Two-factor authentication was disabled",
            severity: "warning",
        });
    }

    function handleRevokeSession(id: string) {
        const session = sessions.find((s) => s.id === id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (session) {
            logEvent({
                type: "session_revoked",
                description: `Session revoked · ${session.device}`,
                ipAddress: session.ipAddress,
                device: `${session.device} · ${session.browser}`,
                severity: "info",
            });
        }
    }

    function handleRevokeAllSessions() {
        const current = sessions.find((s) => s.isCurrent);
        setSessions(current ? [current] : []);
        logEvent({
            type: "session_revoked",
            description: "All other sessions were revoked",
            severity: "info",
        });
    }

    function handleUpdateAdvancedSettings(
        patch: Partial<AdvancedSecuritySettings>,
    ) {
        setAdvancedSettings((prev) => ({ ...prev, ...patch }));
        logEvent({
            type: "settings_changed",
            description: "Advanced security settings were updated",
            severity: "info",
        });
    }

    const recoveryCodesRemaining = recoveryCodes.length - usedRecoveryCodes;

    return (
        <div className="mx-auto w-full max-w-5xl pb-8">
            <SecurityHeader activeSessionCount={sessions.length} />

            <div className="space-y-8">
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "80ms",
                        animationFillMode: "both",
                    }}
                >
                    <SecurityRecommendationBanner
                        visible={!twoFactorEnabled}
                        onEnable={() => setActiveTab("authentication")}
                    />
                </div>

                <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up"
                    style={{
                        animationDelay: "120ms",
                        animationFillMode: "both",
                    }}
                >
                    <ActiveSessionsCard
                        sessions={sessions}
                        onManage={() => setActiveTab("sessions")}
                    />
                    <TwoFactorStatusCard
                        enabled={twoFactorEnabled}
                        onManage={() => setActiveTab("authentication")}
                    />
                    <PasswordAgeCard
                        lastChangedAt={passwordInfo.lastChangedAt}
                        onManage={() => setActiveTab("authentication")}
                    />
                    <RecoveryCodesCard
                        enabled={twoFactorEnabled}
                        remaining={recoveryCodesRemaining}
                        total={recoveryCodes.length}
                        onManage={() => setActiveTab("authentication")}
                    />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "160ms",
                        animationFillMode: "both",
                    }}
                >
                    <SecurityTabBar
                        value={activeTab}
                        onValueChange={setActiveTab}
                        sessionCount={sessions.length}
                    />

                    <div key={activeTab} className="animate-fade-up pt-6">
                        {activeTab === "authentication" && (
                            <AuthenticationTab
                                currentUserEmail={currentUserEmail}
                                onPasswordChanged={handlePasswordChanged}
                                twoFactorEnabled={twoFactorEnabled}
                                recoveryCodes={recoveryCodes}
                                onTwoFactorEnabled={handleTwoFactorEnabled}
                                onTwoFactorDisabled={handleTwoFactorDisabled}
                            />
                        )}
                        {activeTab === "sessions" && (
                            <SessionsTab
                                sessions={sessions}
                                onRevokeSession={handleRevokeSession}
                                onRevokeAll={handleRevokeAllSessions}
                            />
                        )}
                        {activeTab === "advanced" && (
                            <AdvancedTab
                                settings={advancedSettings}
                                onUpdate={handleUpdateAdvancedSettings}
                            />
                        )}
                        {activeTab === "activity" && (
                            <ActivityTab events={activity} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
