"use client";

import { useState } from "react";

import { AudienceCard } from "./audience-card";
import { BroadcastDetailsCard } from "./broadcast-details-card";
import { ComposeActionsBar } from "./compose-actions-bar";
import { ContentEditorCard } from "./content-editor-card";
import { ScheduleCard, type SendTiming } from "./schedule-card";
import { SENDING_DOMAINS } from "../email-dashboard/types";
import { generateId, type Broadcast } from "./types";

const VERIFIED_DOMAINS = SENDING_DOMAINS.filter((d) => d.status === "verified");

function toDatetimeLocalValue(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ComposeBroadcastView({
    editingBroadcast,
    currentUserEmail,
    onCancel,
    onSaveDraft,
    onSubmit,
}: {
    editingBroadcast: Broadcast | null;
    currentUserEmail: string;
    onCancel: () => void;
    onSaveDraft: (broadcast: Broadcast) => void;
    onSubmit: (broadcast: Broadcast) => void;
}) {
    const [subject, setSubject] = useState(editingBroadcast?.subject ?? "");
    const [previewText, setPreviewText] = useState(
        editingBroadcast?.previewText ?? "",
    );
    const [fromName, setFromName] = useState(
        editingBroadcast?.fromName ?? "Dugble",
    );
    const [fromLocalPart, setFromLocalPart] = useState(
        editingBroadcast?.fromEmail.split("@")[0] ?? "news",
    );
    const [fromDomain, setFromDomain] = useState(
        editingBroadcast?.fromEmail.split("@")[1] ??
            VERIFIED_DOMAINS[0]?.domain ??
            "",
    );
    const [audienceId, setAudienceId] = useState<string | null>(
        editingBroadcast?.audienceId ?? null,
    );
    const [content, setContent] = useState(editingBroadcast?.content ?? "");
    const [timing, setTiming] = useState<SendTiming>(
        editingBroadcast?.scheduledAt ? "later" : "now",
    );
    const [scheduledAtInput, setScheduledAtInput] = useState(
        editingBroadcast?.scheduledAt
            ? toDatetimeLocalValue(editingBroadcast.scheduledAt)
            : "",
    );

    const [error, setError] = useState<string | null>(null);
    const [savingDraft, setSavingDraft] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const [testSent, setTestSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    function buildBroadcast(status: Broadcast["status"]): Broadcast {
        const scheduledAt =
            timing === "later" && scheduledAtInput
                ? new Date(scheduledAtInput)
                : undefined;

        return {
            id: editingBroadcast?.id ?? generateId("bc"),
            subject: subject.trim(),
            previewText: previewText.trim(),
            fromName: fromName.trim() || "Dugble",
            fromEmail: `${fromLocalPart.trim() || "news"}@${fromDomain}`,
            audienceId: audienceId ?? "",
            content,
            status,
            recipientCount: editingBroadcast?.recipientCount ?? 0,
            openRate: editingBroadcast?.openRate,
            clickRate: editingBroadcast?.clickRate,
            scheduledAt,
            sentAt: editingBroadcast?.sentAt,
            createdAt: editingBroadcast?.createdAt ?? new Date(),
        };
    }

    function validate(): boolean {
        if (!subject.trim()) {
            setError("Give your broadcast a subject line.");
            return false;
        }
        if (!audienceId) {
            setError("Choose an audience to send to.");
            return false;
        }
        if (!content.trim()) {
            setError("Write some content before sending.");
            return false;
        }
        if (timing === "later" && !scheduledAtInput) {
            setError("Pick a date and time to schedule this broadcast.");
            return false;
        }
        setError(null);
        return true;
    }

    function handleSaveDraft() {
        setSavingDraft(true);
        window.setTimeout(() => {
            onSaveDraft(buildBroadcast("draft"));
            setSavingDraft(false);
        }, 500);
    }

    function handleSendTest() {
        setSendingTest(true);
        window.setTimeout(() => {
            setSendingTest(false);
            setTestSent(true);
            window.setTimeout(() => setTestSent(false), 3000);
        }, 700);
    }

    function handleSubmit() {
        if (!validate()) return;
        setSubmitting(true);
        window.setTimeout(() => {
            setSubmitting(false);
            onSubmit(
                buildBroadcast(timing === "now" ? "sending" : "scheduled"),
            );
        }, 900);
    }

    return (
        <div className="space-y-6 pb-24">
            <BroadcastDetailsCard
                subject={subject}
                onSubjectChange={setSubject}
                previewText={previewText}
                onPreviewTextChange={setPreviewText}
                fromName={fromName}
                onFromNameChange={setFromName}
                fromLocalPart={fromLocalPart}
                onFromLocalPartChange={setFromLocalPart}
                fromDomain={fromDomain}
                onFromDomainChange={setFromDomain}
            />

            <AudienceCard selectedId={audienceId} onSelect={setAudienceId} />

            <ContentEditorCard content={content} onChange={setContent} />

            <ScheduleCard
                timing={timing}
                onTimingChange={setTiming}
                scheduledAt={scheduledAtInput}
                onScheduledAtChange={setScheduledAtInput}
            />

            {error && (
                <p className="text-sm font-medium text-danger animate-fade-up">
                    {error}
                </p>
            )}

            <p className="text-xs text-muted-foreground">
                Test emails are sent to{" "}
                <span className="font-mono">{currentUserEmail}</span>.
            </p>

            <ComposeActionsBar
                onCancel={onCancel}
                onSaveDraft={handleSaveDraft}
                savingDraft={savingDraft}
                onSendTest={handleSendTest}
                sendingTest={sendingTest}
                testSent={testSent}
                onSubmit={handleSubmit}
                submitting={submitting}
                timing={timing}
                isEditing={!!editingBroadcast}
            />
        </div>
    );
}
