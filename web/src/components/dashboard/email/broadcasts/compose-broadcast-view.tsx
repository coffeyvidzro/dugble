// src/components/dashboard/email/broadcasts/compose-broadcast-view.tsx

"use client";

import { useState } from "react";
import {
  useCreateBroadcast,
  useUpdateBroadcast,
} from "@/hooks/queries/use-broadcasts-api";
import { useSenderDomains } from "@/hooks/queries/use-sender-domains-api";
import { apiMutate } from "@/lib/api/fetcher";
import { errorMessage } from "@/lib/errors";
import {
  type Broadcast,
  broadcastSchema,
  sendBroadcastInputSchema,
} from "@/types/broadcast-api";
import { AudienceCard } from "./audience-card";
import { BroadcastDetailsCard } from "./broadcast-details-card";
import { ComposeActionsBar } from "./compose-actions-bar";
import { ContentEditorCard } from "./content-editor-card";
import { markdownToHtml, markdownToPlainText } from "./markdown-to-html";
import { ScheduleCard, type SendTiming } from "./schedule-card";

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ComposeBroadcastView({
  editingBroadcast,
  onCancel,
  onDone,
}: {
  editingBroadcast: Broadcast | null;
  onCancel: () => void;
  onDone: () => void;
}) {
  const { data: domains } = useSenderDomains();
  const verifiedDomains = (domains ?? []).filter(
    (d) => d.status === "verified",
  );

  const [subject, setSubject] = useState(editingBroadcast?.subject ?? "");
  const [previewText, setPreviewText] = useState(
    editingBroadcast?.preview_text ?? "",
  );
  const [fromName, setFromName] = useState(
    editingBroadcast?.from_name ?? "Dugble",
  );
  const [fromLocalPart, setFromLocalPart] = useState(
    editingBroadcast?.from_email?.split("@")[0] ?? "news",
  );
  const [fromDomainChoice, setFromDomain] = useState(
    editingBroadcast?.from_email?.split("@")[1] ?? "",
  );
  // Fall back to the first available option until the user picks one —
  // derived during render rather than written back from an effect.
  const fromDomain = fromDomainChoice || (verifiedDomains[0]?.name ?? "");
  const [segmentId, setSegmentId] = useState<string | null>(
    editingBroadcast?.segment_id ?? null,
  );
  const [content, setContent] = useState(editingBroadcast?.text ?? "");
  const [timing, setTiming] = useState<SendTiming>(
    editingBroadcast?.scheduled_at ? "later" : "now",
  );
  const [scheduledAtInput, setScheduledAtInput] = useState(
    editingBroadcast?.scheduled_at
      ? toDatetimeLocalValue(new Date(editingBroadcast.scheduled_at))
      : "",
  );

  const [error, setError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const createBroadcast = useCreateBroadcast();
  const updateBroadcast = useUpdateBroadcast(editingBroadcast?.id ?? "");

  function validate(): boolean {
    if (!subject.trim()) {
      setError("Give your broadcast a subject line.");
      return false;
    }
    if (!segmentId) {
      setError("Choose a segment to send to.");
      return false;
    }
    if (!content.trim()) {
      setError("Write some content before sending.");
      return false;
    }
    if (!fromDomain) {
      setError("Verify a sending domain before continuing.");
      return false;
    }
    if (timing === "later" && !scheduledAtInput) {
      setError("Pick a date and time to schedule this broadcast.");
      return false;
    }
    setError(null);
    return true;
  }

  function buildContentPayload() {
    return {
      html: markdownToHtml(content),
      text: markdownToPlainText(content),
    };
  }

  function handleSaveDraft() {
    if (!subject.trim() || !segmentId) {
      setError("Add a subject and choose a segment before saving a draft.");
      return;
    }
    setError(null);
    setSavingDraft(true);

    const { html, text } = buildContentPayload();
    const fromEmail = fromDomain
      ? `${fromLocalPart || "news"}@${fromDomain}`
      : undefined;

    if (editingBroadcast) {
      updateBroadcast.mutate(
        {
          revision: editingBroadcast.revision,
          name: subject.trim(),
          segment_id: segmentId,
          from_email: fromEmail,
          from_name: fromName.trim() || undefined,
          subject: subject.trim(),
          preview_text: previewText.trim() || null,
          html,
          text,
        },
        {
          onSuccess: () => {
            setSavingDraft(false);
            onDone();
          },
          onError: (err) => {
            setSavingDraft(false);
            setError(errorMessage(err, "Couldn't save your changes."));
          },
        },
      );
      return;
    }

    createBroadcast.mutate(
      {
        name: subject.trim(),
        segment_id: segmentId,
        from_email: fromEmail,
        from_name: fromName.trim() || undefined,
        subject: subject.trim(),
        preview_text: previewText.trim() || undefined,
        html,
        text,
      },
      {
        onSuccess: () => {
          setSavingDraft(false);
          onDone();
        },
        onError: (err) => {
          setSavingDraft(false);
          setError(errorMessage(err, "Couldn't create the broadcast."));
        },
      },
    );
  }

  async function handleSubmit() {
    if (!validate() || !segmentId) return;
    setSubmitting(true);
    setError(null);

    const { html, text } = buildContentPayload();
    const fromEmail = `${fromLocalPart || "news"}@${fromDomain}`;
    const scheduled_at =
      timing === "later" ? new Date(scheduledAtInput).toISOString() : undefined;

    try {
      let targetId = editingBroadcast?.id;

      if (editingBroadcast) {
        await updateBroadcast.mutateAsync({
          revision: editingBroadcast.revision,
          name: subject.trim(),
          segment_id: segmentId,
          from_email: fromEmail,
          from_name: fromName.trim() || undefined,
          subject: subject.trim(),
          preview_text: previewText.trim() || null,
          html,
          text,
        });
      } else {
        const created = await createBroadcast.mutateAsync({
          name: subject.trim(),
          segment_id: segmentId,
          from_email: fromEmail,
          from_name: fromName.trim() || undefined,
          subject: subject.trim(),
          preview_text: previewText.trim() || undefined,
          html,
          text,
        });
        targetId = created.id;
      }

      // Sending targets whichever broadcast id is now known (either
      // the just-created draft or the existing one being edited) —
      // this can't go through a fixed-id hook the way Campaigns'
      // useSendCampaignByIdMutation does, since a brand-new
      // broadcast's id doesn't exist until the create call resolves.
      await apiMutate(
        `/broadcasts/${targetId}/send`,
        "POST",
        broadcastSchema,
        sendBroadcastInputSchema.parse({ scheduled_at }),
      );

      setSubmitting(false);
      onDone();
    } catch (err) {
      setSubmitting(false);
      setError(
        errorMessage(
          err,
          editingBroadcast
            ? "Saved, but couldn't send/schedule. Try again from the broadcast list."
            : "Created, but couldn't send/schedule. Find it in the broadcast list to retry.",
        ),
      );
    }
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

      <AudienceCard selectedId={segmentId} onSelect={setSegmentId} />

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

      <ComposeActionsBar
        onCancel={onCancel}
        onSaveDraft={handleSaveDraft}
        savingDraft={savingDraft}
        onSubmit={handleSubmit}
        submitting={submitting}
        timing={timing}
        isEditing={!!editingBroadcast}
      />
    </div>
  );
}
