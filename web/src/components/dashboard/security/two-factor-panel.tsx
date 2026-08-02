"use client";

import { useState } from "react";

import { Eye, EyeOff, ShieldOff } from "lucide-react";

import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./confirm-dialog";
import { TwoFactorSetupDialog } from "./two-factor-setup-dialog";

export function TwoFactorPanel({
    enabled,
    recoveryCodes,
    onEnabled,
    onDisabled,
}: {
    enabled: boolean;
    recoveryCodes: string[];
    onEnabled: (recoveryCodes: string[]) => void;
    onDisabled: () => void;
}) {
    const [disableOpen, setDisableOpen] = useState(false);
    const [codesVisible, setCodesVisible] = useState(false);

    return (
        <>
            <CardContent className="space-y-4 pt-6">
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
                        <TwoFactorSetupDialog onComplete={onEnabled} />
                    </div>
                )}

                {enabled && recoveryCodes.length > 0 && (
                    <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">
                                Recovery codes
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setCodesVisible((v) => !v)}
                                className="h-7 px-2 text-xs"
                            >
                                {codesVisible ? (
                                    <EyeOff className="mr-1.5 size-3.5" />
                                ) : (
                                    <Eye className="mr-1.5 size-3.5" />
                                )}
                                {codesVisible ? "Hide" : "Show"}
                            </Button>
                        </div>
                        {codesVisible ? (
                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {recoveryCodes.map((rc) => (
                                    <code
                                        key={rc}
                                        className="font-mono text-xs text-foreground/90"
                                    >
                                        {rc}
                                    </code>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {recoveryCodes.length} unused codes. Click show
                                to reveal them.
                            </p>
                        )}
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
                    onDisabled();
                    setDisableOpen(false);
                }}
            />
        </>
    );
}
