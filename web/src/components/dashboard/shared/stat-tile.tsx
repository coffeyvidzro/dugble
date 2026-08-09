import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<"default" | "positive" | "negative", string> = {
    default: "text-foreground",
    positive: "text-signal",
    negative: "text-danger",
};

export function StatTile({
    label,
    value,
    icon: Icon,
    sublabel,
    tone = "default",
}: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    sublabel?: string;
    tone?: "default" | "positive" | "negative";
}) {
    return (
        <Card className="border-border/40 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Icon className="size-3.5" />
                {label}
            </div>
            <p
                className={cn(
                    "mt-2 font-heading text-2xl font-semibold",
                    TONE_CLASS[tone],
                )}
            >
                {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {sublabel && (
                <p className="text-xs text-muted-foreground">{sublabel}</p>
            )}
        </Card>
    );
}
