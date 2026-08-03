"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useTemplatesStore } from "../templates-store";
import { EmailPreviewPane } from "./email-preview-pane";
import { CodeEditorPane } from "./code-editor-pane";
import { EditorToolbar } from "./editor-toolbar";
import { EditorHeader } from "./editor-header";
import { Card } from "@/components/ui/card";
import type {
    MobilePane,
    PreviewViewport,
    TemplateFormState,
} from "./editor-types";
import {
    interpolateHtml,
    variablesForCategory,
    defaultHtmlForCategory,
    type TemplateVariable,
} from "../template-content";
import type { EmailTemplate } from "../types";

function toFormState(template?: EmailTemplate): TemplateFormState {
    if (template) {
        return {
            name: template.name,
            subject: template.subject,
            previewText: template.previewText,
            category: template.category,
            status: template.status,
            htmlBody: template.htmlBody,
        };
    }
    return {
        name: "Untitled template",
        subject: "",
        previewText: "",
        category: "custom",
        status: "draft",
        htmlBody: defaultHtmlForCategory("custom"),
    };
}

export function TemplateEditor({
    mode,
    template,
}: {
    mode: "create" | "edit";
    template?: EmailTemplate;
}) {
    const router = useRouter();
    const { saveTemplate, createTemplate } = useTemplatesStore();

    const [form, setForm] = useState<TemplateFormState>(() =>
        toFormState(template),
    );
    const [templateId, setTemplateId] = useState<string | undefined>(
        template?.id,
    );
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
        template ? template.updatedAt : null,
    );
    const [viewport, setViewport] = useState<PreviewViewport>("desktop");
    const [mobilePane, setMobilePane] = useState<MobilePane>("code");

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const variables = useMemo(
        () => variablesForCategory(form.category),
        [form.category],
    );

    const compiledHtml = useMemo(
        () => interpolateHtml(form.htmlBody, variables),
        [form.htmlBody, variables],
    );

    function updateField<K extends keyof TemplateFormState>(
        key: K,
        value: TemplateFormState[K],
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
    }

    function handleInsertVariable(variable: TemplateVariable) {
        const token = `{{${variable.key}}}`;
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

    function persist(nextStatus: TemplateFormState["status"]) {
        setIsSaving(true);
        const patch = { ...form, status: nextStatus };
        setForm(patch);

        // Simulated latency — TODO: I'll wire up with backend.
        window.setTimeout(() => {
            if (templateId) {
                saveTemplate(templateId, patch);
            } else {
                const created = createTemplate(patch);
                setTemplateId(created.id);
                router.replace(`/dashboard/email/templates/${created.id}`);
            }
            setIsSaving(false);
            setIsDirty(false);
            setLastSavedAt(new Date());
        }, 700);
    }

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <EditorHeader
                name={form.name}
                onNameChange={(value) => updateField("name", value)}
                subject={form.subject}
                onSubjectChange={(value) => updateField("subject", value)}
                status={form.status}
                isDirty={isDirty}
                isSaving={isSaving}
                lastSavedAt={lastSavedAt}
                onSaveDraft={() => persist("draft")}
                onPublish={() => persist("published")}
                compiledHtml={compiledHtml}
            />

            <div
                className="mt-6 animate-fade-up space-y-4"
                style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
                <EditorToolbar
                    category={form.category}
                    onCategoryChange={(value) => updateField("category", value)}
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
                            previewText={form.previewText}
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
