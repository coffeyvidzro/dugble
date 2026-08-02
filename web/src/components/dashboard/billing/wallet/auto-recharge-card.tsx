"use client";

import { useState } from "react";

import { Check, Loader2, Zap } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ToggleSwitch } from "./toggle-switch";
import { formatCurrency, type AutoRechargeSettings } from "./types";

export function AutoRechargeCard({
    settings,
    onUpdate,
}: {
    settings: AutoRechargeSettings;
    onUpdate: (settings: AutoRechargeSettings) => void;
}) {
    const [thresholdInput, setThresholdInput] = useState(
        (settings.thresholdCents / 100).toString(),
    );
    const [amountInput, setAmountInput] = useState(
        (settings.rechargeAmountCents / 100).toString(),
    );
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const isDirty =
        Number(thresholdInput) * 100 !== settings.thresholdCents ||
        Number(amountInput) * 100 !== settings.rechargeAmountCents;

    function handleSave() {
        setSaving(true);
        window.setTimeout(() => {
            onUpdate({
                ...settings,
                thresholdCents: Math.round(Number(thresholdInput) * 100),
                rechargeAmountCents: Math.round(Number(amountInput) * 100),
            });
            setSaving(false);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2000);
        }, 500);
    }

    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={Zap}
                title="Auto Recharge"
                description="Automatically top up your wallet before it runs dry."
            />
            <CardContent className="space-y-5 pt-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                            Enable auto recharge
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Charge your default card automatically when your
                            balance drops below the threshold.
                        </p>
                    </div>
                    <ToggleSwitch
                        checked={settings.enabled}
                        onCheckedChange={(enabled) =>
                            onUpdate({ ...settings, enabled })
                        }
                    />
                </div>

                {settings.enabled && (
                    <div className="flex flex-wrap gap-4 border-t border-border/40 pt-5 animate-fade-up">
                        <div className="max-w-40 flex-1 space-y-2">
                            <Label htmlFor="recharge-threshold">
                                When balance drops below
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    id="recharge-threshold"
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
                        <div className="max-w-40 flex-1 space-y-2">
                            <Label htmlFor="recharge-amount">Top up by</Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    id="recharge-amount"
                                    inputMode="decimal"
                                    value={amountInput}
                                    onChange={(event) =>
                                        setAmountInput(
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
                    </div>
                )}

                {settings.enabled && (
                    <p className="text-xs text-muted-foreground">
                        Currently: top up{" "}
                        {formatCurrency(settings.rechargeAmountCents)} whenever
                        your balance drops below{" "}
                        {formatCurrency(settings.thresholdCents)}.
                    </p>
                )}
            </CardContent>
            {settings.enabled && (
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
