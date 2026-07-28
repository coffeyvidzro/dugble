import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function PlaceholderPage({
    title,
    description,
    icon: Icon = Construction,
}: {
    title: string;
    description: string;
    icon?: LucideIcon;
}) {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-muted-foreground text-sm">Dashboard</p>
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
                        {description}
                    </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-pending/30 bg-pending/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-pending">
                    Planned
                </span>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground">
                        <Icon className="size-5" />
                    </div>
                    <CardTitle className="mt-3">Coming soon</CardTitle>
                    <CardDescription>
                        This page is scaffolded so the dashboard navigation and
                        product surface are ready for the next feature pass.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-3xl border border-dashed p-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            Build the {title.toLowerCase()} workflow here.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
