import { CheckCircle2, FileEdit, LayoutTemplate, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { EmailTemplate } from "./types";

export function TemplatesStats({ templates }: { templates: EmailTemplate[] }) {
    const published = templates.filter((t) => t.status === "published").length;
    const drafts = templates.length - published;
    const sentLast30d = templates.reduce((sum, t) => sum + t.sentLast30d, 0);

    const stats = [
        {
            label: "Total templates",
            value: templates.length.toLocaleString(),
            icon: LayoutTemplate,
        },
        {
            label: "Published",
            value: published.toLocaleString(),
            icon: CheckCircle2,
        },
        { label: "Drafts", value: drafts.toLocaleString(), icon: FileEdit },
        {
            label: "Sent (30d)",
            value: sentLast30d.toLocaleString(),
            icon: Send,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
                <Card
                    key={stat.label}
                    className="border-border/40 p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <stat.icon className="size-3.5" />
                        {stat.label}
                    </div>
                    <p className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
                        {stat.value}
                    </p>
                </Card>
            ))}
        </div>
    );
}
