import { CheckCircle2, FileEdit, LayoutTemplate } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { TemplateListItem } from "@/types/template-api";

export function TemplatesStats({
  templates,
}: {
  templates: TemplateListItem[];
}) {
  const published = templates.filter((t) => t.status === "published").length;
  const drafts = templates.length - published;

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
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
