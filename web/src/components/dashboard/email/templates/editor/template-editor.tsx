"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  useCreateTemplate,
  usePublishTemplate,
  useUpdateTemplate,
} from "@/hooks/queries/use-templates-api";
import type {
  TemplateApiCategory,
  TemplateResource,
} from "@/types/template-api";
import { CodeEditorPane } from "./code-editor-pane";
import { EditorHeader } from "./editor-header";
import { EditorToolbar } from "./editor-toolbar";
import type {
  MobilePane,
  PreviewViewport,
  TemplateFormState,
} from "./editor-types";
import { EmailPreviewPane } from "./email-preview-pane";
import {
  interpolatePreview,
  toApiPayload,
  toFormState,
} from "./template-form-model";
import { VariablesManager } from "./variables-manager";

export function TemplateEditor({
  mode,
  template,
}: {
  mode: "create" | "edit";
  template?: TemplateResource;
}) {
  const router = useRouter();

  const [form, setForm] = useState<TemplateFormState>(() =>
    toFormState(template),
  );
  const [templateId, setTemplateId] = useState<string | undefined>(
    template?.id,
  );
  const [status, setStatus] = useState<"draft" | "published">(
    template?.status ?? "draft",
  );
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    template ? new Date(template.updated_at) : null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const [mobilePane, setMobilePane] = useState<MobilePane>("code");

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate(templateId ?? "");
  const publishTemplate = usePublishTemplate();
  const isSaving =
    createTemplate.isPending ||
    updateTemplate.isPending ||
    publishTemplate.isPending;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const compiledHtml = useMemo(
    () => interpolatePreview(form.htmlBody, form.variables),
    [form.htmlBody, form.variables],
  );

  function updateField<K extends keyof TemplateFormState>(
    key: K,
    value: TemplateFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  function handleInsertVariable(key: string) {
    const token = `{{${key}}}`;
    const textarea = textareaRef.current;

    if (!textarea) {
      updateField("htmlBody", form.htmlBody + token);
      return;
    }

    const start = textarea.selectionStart ?? form.htmlBody.length;
    const end = textarea.selectionEnd ?? form.htmlBody.length;
    const next =
      form.htmlBody.slice(0, start) + token + form.htmlBody.slice(end);
    updateField("htmlBody", next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + token.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function persist(publish: boolean) {
    setSaveError(null);
    const payload = toApiPayload(form);

    const afterSave = (id: string) => {
      setTemplateId(id);
      setLastSavedAt(new Date());
      setIsDirty(false);

      if (publish) {
        publishTemplate.mutate(id, {
          onSuccess: () => setStatus("published"),
          onError: () =>
            setSaveError("Saved, but couldn't publish. Try publishing again."),
        });
      }

      if (mode === "create" && !template) {
        router.replace(`/dashboard/email/templates/${id}`);
      }
    };

    if (templateId) {
      updateTemplate.mutate(payload, {
        onSuccess: () => afterSave(templateId),
        onError: () => setSaveError("Couldn't save your changes. Try again."),
      });
      return;
    }

    createTemplate.mutate(payload, {
      onSuccess: (created) => afterSave(created.id),
      onError: () => setSaveError("Couldn't create the template. Try again."),
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      <EditorHeader
        name={form.name}
        onNameChange={(value) => updateField("name", value)}
        subject={form.subject}
        onSubjectChange={(value) => updateField("subject", value)}
        status={status}
        isDirty={isDirty}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onSaveDraft={() => persist(false)}
        onPublish={() => persist(true)}
        templateId={templateId}
      />

      {saveError && (
        <p className="mt-3 text-sm text-danger animate-fade-up">{saveError}</p>
      )}

      <div
        className="mt-6 animate-fade-up space-y-4"
        style={{ animationDelay: "100ms", animationFillMode: "both" }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="template-alias"
              className="text-xs font-medium text-muted-foreground"
            >
              Alias
            </label>
            <input
              id="template-alias"
              value={form.alias}
              onChange={(e) => updateField("alias", e.target.value)}
              placeholder="welcome-email"
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="template-from"
              className="text-xs font-medium text-muted-foreground"
            >
              From
            </label>
            <input
              id="template-from"
              value={form.from}
              onChange={(e) => updateField("from", e.target.value)}
              placeholder="Acme <hello@example.com>"
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="template-reply-to"
              className="text-xs font-medium text-muted-foreground"
            >
              Reply-to (comma-separated)
            </label>
            <input
              id="template-reply-to"
              value={form.replyTo}
              onChange={(e) => updateField("replyTo", e.target.value)}
              placeholder="support@example.com"
              className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <VariablesManager
          variables={form.variables}
          onChange={(variables) => updateField("variables", variables)}
        />

        <EditorToolbar
          category={form.category}
          onCategoryChange={(value: TemplateApiCategory) =>
            updateField("category", value)
          }
          variables={form.variables}
          onInsertVariable={handleInsertVariable}
          viewport={viewport}
          onViewportChange={setViewport}
          mobilePane={mobilePane}
          onMobilePaneChange={setMobilePane}
        />

        <Card className="overflow-hidden border-border/40 shadow-sm">
          <div className="grid grid-cols-1 lg:min-h-140 lg:grid-cols-2 lg:divide-x lg:divide-border/40">
            <CodeEditorPane
              ref={textareaRef}
              value={form.htmlBody}
              onChange={(value) => updateField("htmlBody", value)}
              isHiddenOnMobile={mobilePane === "preview"}
            />
            <EmailPreviewPane
              subject={form.subject}
              previewText=""
              compiledHtml={compiledHtml}
              viewport={viewport}
              isHiddenOnMobile={mobilePane === "code"}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
