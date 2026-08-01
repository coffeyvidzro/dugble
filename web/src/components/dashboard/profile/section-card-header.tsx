import type { LucideIcon } from "lucide-react";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "positive" | "danger";

const TONE_STYLES: Record<
    Tone,
    { header: string; chip: string; title: string; description: string }
> = {
    neutral: {
        header: "flex-row items-center gap-3 border-b border-border/40 bg-muted/10 pb-4",
        chip: "border-border/50 bg-muted/40 text-muted-foreground",
        title: "",
        description: "",
    },
    positive: {
        header: "flex-row items-center gap-3 border-b border-border/40 bg-muted/10 pb-4",
        chip: "border-signal/30 bg-signal/10 text-signal",
        title: "",
        description: "",
    },
    danger: {
        header: "flex-row items-center gap-3 pb-4",
        chip: "border-danger/30 bg-danger/10 text-danger",
        title: "text-danger",
        description: "text-danger/80",
    },
};

export function SectionCardHeader({
    icon: Icon,
    title,
    description,
    tone = "neutral",
}: {
    icon: LucideIcon;
    title: React.ReactNode;
    description: React.ReactNode;
    tone?: Tone;
}) {
    const styles = TONE_STYLES[tone];

    return (
        <CardHeader className={styles.header}>
            <div
                className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                    styles.chip,
                )}
            >
                <Icon className="size-4" />
            </div>
            <div className="space-y-1">
                <CardTitle className={cn("text-xl", styles.title)}>
                    {title}
                </CardTitle>
                <CardDescription className={styles.description}>
                    {description}
                </CardDescription>
            </div>
        </CardHeader>
    );
}
