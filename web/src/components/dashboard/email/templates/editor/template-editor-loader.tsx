"use client";

import { Loader2 } from "lucide-react";
import { useTemplateApi } from "@/hooks/queries/use-templates-api";
import { TemplateEditor } from "./template-editor";
import { TemplateNotFound } from "./template-not-found";

export function TemplateEditorLoader({ id }: { id: string }) {
  const { data: template, isPending, isError } = useTemplateApi(id);

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading template…
      </div>
    );
  }

  if (isError || !template) {
    return <TemplateNotFound />;
  }

  return <TemplateEditor mode="edit" template={template} />;
}
