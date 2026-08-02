"use client";

import { useState } from "react";

import { Bell, Check, Loader2, ShieldAlert } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ToggleSwitch } from "./toggle-switch";
import {
    type LowBalanceAlertSettings,
    type SpendingLimitSettings,
} from "./types";

export function AlertsAndLimitsCard({
    lowBalanceAlert,
    onUpdateLowBalanceAlert,
    spendingLimit,
    onUpdateSpendingLimit,
}: {
    lowBalanceAlert: LowBalanceAlertSettings;
    onUpdateLowBalanceAlert: (settings: LowBalanceAlertSettings) => void;
    spendingLimit: SpendingLimitSettings;
    onUpdateSpendingLimit: (settings: SpendingLimitSettings) => void;
}) {
    const [thresholdInput, setThresholdInput] = useState(
        (lowBalanceAlert.thresholdCents / 100).toString(),
    );
    const [limitInput, setLimitInput] = useState(
        (spendingLimit.monthlyLimitCents / 100).toString(),
    );
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const isDirty =
        Number(thresholdInput) * 100 !== lowBalanceAlert.thresholdCents ||
        Number(limitInput) * 100 !== spendingLimit.monthlyLimitCents;

    function handleSave() {
        setSaving(true);
        window.setTimeout(() => {
            onUpdateLowBalanceAlert({
                ...lowBalanceAlert,
                thresholdCents: Math.round(Number(thresholdInput) * 100),
            });
            onUpdateSpendingLimit({
                ...spendingLimit,
                monthlyLimitCents: Math.round(Number(limitInput) * 100),
            });
            setSaving(false);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2000);
        }, 500);
    }

    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={ShieldAlert}
                title="Alerts & Limits"
                description="Stay ahead of low balances and cap how much you can spend."
            />
            <CardContent className="divide-y divide-border/40 pt-6">
                <div className="space-y-4 pb-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-1.5">
                            <Bell className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-foreground">
                                    Low balance email alert
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Email me when my balance drops below the
                                    threshold below.
                                </p>
                            </div>
                        </div>
                        <ToggleSwitch
                            checked={lowBalanceAlert.enabled}
                            onCheckedChange={(enabled) =>
                                onUpdateLowBalanceAlert({
                                    ...lowBalanceAlert,
                                    enabled,
                                })
                            }
                        />
                    </div>
                    {lowBalanceAlert.enabled && (
                        <div className="max-w-40 space-y-2 animate-fade-up">
                            <Label htmlFor="low-balance-threshold">
                                Alert threshold
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    id="low-balance-threshold"
                                    inputMode="decimal"
                                    value={thresholdInput}
                                    onChange={(event) =>
                                        setThresholdInput(
                                            event.target.value.replace(
                                                /[^0-9.]/g,
                                                "",
                                            ),
                                        )
                                    }
                                    className="border-border bg-muted/20 pl-7 text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-foreground">
                                Monthly spending limit
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Pause message delivery once this month&apos;s
                                usage hits the cap below.
                            </p>
                        </div>
                        <ToggleSwitch
                            checked={spendingLimit.enabled}
                            onCheckedChange={(enabled) =>
                                onUpdateSpendingLimit({
                                    ...spendingLimit,
                                    enabled,
                                })
                            }
                        />
                    </div>
                    {spendingLimit.enabled && (
                        <div className="max-w-40 space-y-2 animate-fade-up">
                            <Label htmlFor="spending-limit">Monthly cap</Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    id="spending-limit"
                                    inputMode="decimal"
                                    value={limitInput}
                                    onChange={(event) =>
                                        setLimitInput(
                                            event.target.value.replace(
                                                /[^0-9.]/g,
                                                "",
                                            ),
                                        )
                                    }
                                    className="border-border bg-muted/20 pl-7 text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            {(lowBalanceAlert.enabled || spendingLimit.enabled) && (
                <div className="flex items-center justify-end gap-3 border-t border-border/40 bg-muted/10 px-6 py-4">
                    {saved && (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-signal animate-fade-up">
                            <Check className="size-4" />
                            Saved
                        </span>
                    )}
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!isDirty || saving}
                        className={cn(
                            "min-w-28 transition-all",
                            saving && "opacity-80",
                        )}
                    >
                        {saving ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : null}
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>
            )}
        </Card>
    );
}
