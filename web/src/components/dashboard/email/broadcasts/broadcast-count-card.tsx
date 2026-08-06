import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function BroadcastCountCard({
    icon: Icon,
    label,
    value,
    footer,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    footer: string;
}) {
    return (
        <Card className="flex h-full flex-col justify-center gap-2 overflow-hidden border-border/40 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="size-4" />
                {label}
            </div>
            <div>
                <p className="font-heading text-3xl font-semibold tracking-tight text-foreground">
                    {value}
                </p>
                <p className="text-xs text-muted-foreground">{footer}</p>
            </div>
        </Card>
    );
}
