import { TemplateCard } from "./template-card";
import type { EmailTemplate } from "./types";

export function TemplateGrid({ templates }: { templates: EmailTemplate[] }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
            ))}
        </div>
    );
}
