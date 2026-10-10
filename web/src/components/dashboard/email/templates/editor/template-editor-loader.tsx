"use client";

import { LoadingBlock } from "@/components/dashboard/shared/data-states";
import { useTemplateApi } from "@/hooks/queries/use-templates-api";
import { TemplateEditor } from "./template-editor";
import { TemplateNotFound } from "./template-not-found";

export function TemplateEditorLoader({ id }: { id: string }) {
  const { data: template, isPending, isError } = useTemplateApi(id);

  if (isPending) {
    return <LoadingBlock label="Loading template…" variant="page" />;
  }

  if (isError || !template) {
    return <TemplateNotFound />;
  }

  return <TemplateEditor mode="edit" template={template} />;
}
