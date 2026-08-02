import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "signal" | "pending" | "danger";

const TONE_CHIP: Record<Tone, string> = {
    neutral: "border-border/50 bg-muted/40 text-muted-foreground",
    signal: "border-signal/30 bg-signal/10 text-signal",
    pending: "border-pending/30 bg-pending/10 text-pending",
    danger: "border-danger/30 bg-danger/10 text-danger",
};

const TONE_GLOW: Record<Tone, string> = {
    neutral: "bg-muted-foreground/10",
    signal: "bg-signal/10",
    pending: "bg-pending/10",
    danger: "bg-danger/10",
};

export function OverviewStatCard({
    icon: Icon,
    tone = "neutral",
    value,
    label,
    footerLeft,
    actionLabel,
    onAction,
}: {
    icon: LucideIcon;
    tone?: Tone;
    value: React.ReactNode;
    label: string;
    footerLeft: React.ReactNode;
    actionLabel: string;
    onAction: () => void;
}) {
    return (
        <Card className="group relative overflow-hidden border-border/40 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div
                aria-hidden="true"
                className={cn(
                    "pointer-events-none absolute -top-10 -right-10 size-28 rounded-full blur-2xl transition-opacity group-hover:opacity-80",
                    TONE_GLOW[tone],
                )}
            />
            <div className="relative space-y-3 p-5">
                <div
                    className={cn(
                        "flex size-9 items-center justify-center rounded-lg border",
                        TONE_CHIP[tone],
                    )}
                >
                    <Icon className="size-4" />
                </div>
                <div>
                    <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                        {value}
                    </p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-3">
                    <p className="truncate text-xs text-muted-foreground">
                        {footerLeft}
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onAction}
                        className="h-7 shrink-0 px-2 text-xs"
                    >
                        {actionLabel}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
