"use client";

import { useTemplatesStore } from "../templates-store";
import { TemplateEditor } from "./template-editor";
import { TemplateNotFound } from "./template-not-found";

export function TemplateEditorLoader({ id }: { id: string }) {
    const { getTemplate } = useTemplatesStore();
    const template = getTemplate(id);

    if (!template) {
        return <TemplateNotFound />;
    }

    return <TemplateEditor mode="edit" template={template} />;
}
