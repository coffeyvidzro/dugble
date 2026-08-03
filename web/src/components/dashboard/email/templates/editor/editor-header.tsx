import Link from "next/link";

import { ChevronLeft } from "lucide-react";

import { EditorStatusIndicator } from "./editor-status-indicator";
import { EditorTitleFields } from "./editor-title-fields";
import { SendTestDialog } from "./send-test-dialog";
import { EditorActions } from "./editor-actions";
import type { TemplateStatus } from "../types";

interface EditorHeaderProps {
    name: string;
    onNameChange: (value: string) => void;
    subject: string;
    onSubjectChange: (value: string) => void;
    status: TemplateStatus;
    isDirty: boolean;
    isSaving: boolean;
    lastSavedAt: Date | null;
    onSaveDraft: () => void;
    onPublish: () => void;
    compiledHtml: string;
}

export function EditorHeader({
    name,
    onNameChange,
    subject,
    onSubjectChange,
    status,
    isDirty,
    isSaving,
    lastSavedAt,
    onSaveDraft,
    onPublish,
    compiledHtml,
}: EditorHeaderProps) {
    return (
        <div className="animate-fade-up space-y-3">
            <Link
                href="/dashboard/email/templates"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                <ChevronLeft className="size-3.5" />
                Templates
            </Link>

            <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <EditorTitleFields
                    name={name}
                    onNameChange={onNameChange}
                    subject={subject}
                    onSubjectChange={onSubjectChange}
                />

                <div className="flex flex-col items-start gap-3 sm:items-end">
                    <EditorStatusIndicator
                        status={status}
                        isDirty={isDirty}
                        isSaving={isSaving}
                        lastSavedAt={lastSavedAt}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <SendTestDialog
                            subject={subject}
                            compiledHtml={compiledHtml}
                        />
                        <EditorActions
                            status={status}
                            isSaving={isSaving}
                            onSaveDraft={onSaveDraft}
                            onPublish={onPublish}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
