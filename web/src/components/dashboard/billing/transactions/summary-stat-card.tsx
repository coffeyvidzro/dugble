import type { LucideIcon } from "lucide-react";

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

export function SummaryStatCard({
    icon: Icon,
    tone = "neutral",
    value,
    label,
    footer,
}: {
    icon: LucideIcon;
    tone?: Tone;
    value: React.ReactNode;
    label: string;
    footer: React.ReactNode;
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
            <div className="relative space-y-2 p-5">
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
                <p className="text-xs text-muted-foreground/80">{footer}</p>
            </div>
        </Card>
    );
}
