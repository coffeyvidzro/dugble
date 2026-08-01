import { LucideIcon } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TeamCardHeaderProps {
    icon: LucideIcon;
    title: React.ReactNode;
    description: React.ReactNode;
    danger?: boolean;
}

export function TeamCardHeader({
    icon: Icon,
    title,
    description,
    danger,
}: TeamCardHeaderProps) {
    return (
        <CardHeader
            className={cn(
                "flex-row items-center gap-3 pb-4",
                danger ? "" : "border-b border-border/40 bg-muted/10",
            )}
        >
            <div
                className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                    danger
                        ? "border-danger/30 bg-danger/10 text-danger"
                        : "border-border/50 bg-muted/40 text-muted-foreground",
                )}
            >
                <Icon className="size-4" />
            </div>
            <div className="space-y-1">
                <CardTitle className={cn("text-xl", danger && "text-danger")}>
                    {title}
                </CardTitle>
                <CardDescription className={danger ? "text-danger/80" : ""}>
                    {description}
                </CardDescription>
            </div>
        </CardHeader>
    );
}
