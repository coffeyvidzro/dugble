"use client";

import { useState } from "react";

import { ShieldCheck, ShieldOff } from "lucide-react";

import { TwoFactorSetupDialog } from "./two-factor-setup-dialog";
import { SectionCardHeader } from "./section-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "./confirm-dialog";
import { Button } from "@/components/ui/button";

export function TwoFactorAuthPanel() {
    const [enabled, setEnabled] = useState(false);
    const [disableOpen, setDisableOpen] = useState(false);

    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={ShieldCheck}
                title="Two-Factor Authentication"
                description="Add an extra layer of security to your account with a time-based one-time code."
                tone={enabled ? "positive" : "neutral"}
            />
            <CardContent className="pt-6">
                {enabled ? (
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-signal" />
                            </span>
                            <span className="font-medium text-foreground">
                                Enabled
                            </span>
                            <span className="text-muted-foreground">
                                via authenticator app
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-danger/30 text-danger hover:bg-danger/10"
                            onClick={() => setDisableOpen(true)}
                        >
                            <ShieldOff className="mr-2 size-4" />
                            Disable
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <p className="text-sm text-muted-foreground">
                            Two-factor authentication is currently{" "}
                            <span className="font-medium text-foreground">
                                not enabled
                            </span>
                            .
                        </p>
                        <TwoFactorSetupDialog
                            onComplete={() => setEnabled(true)}
                        />
                    </div>
                )}
            </CardContent>

            <ConfirmDialog
                open={disableOpen}
                onOpenChange={setDisableOpen}
                title="Disable two-factor authentication?"
                description="Your account will only be protected by your password. You can re-enable it at any time."
                confirmLabel="Disable 2FA"
                onConfirm={() => {
                    setEnabled(false);
                    setDisableOpen(false);
                }}
            />
        </Card>
    );
}
