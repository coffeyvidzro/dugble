import type { TemplateListItem } from "@/types/template-api";
import { TemplateCard } from "./template-card";

export function TemplateGrid({ templates }: { templates: TemplateListItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
