import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SendTiming } from "./schedule-card";

export function ComposeActionsBar({
  onCancel,
  onSaveDraft,
  savingDraft,
  onSubmit,
  submitting,
  timing,
  isEditing,
}: {
  onCancel: () => void;
  onSaveDraft: () => void;
  savingDraft: boolean;
  onSubmit: () => void;
  submitting: boolean;
  timing: SendTiming;
  isEditing: boolean;
}) {
  const submitLabel = submitting
    ? timing === "now"
      ? "Sending..."
      : "Scheduling..."
    : timing === "now"
      ? "Send broadcast"
      : "Schedule broadcast";

  return (
    <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 bg-card/95 px-6 py-4 backdrop-blur-sm">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          disabled={savingDraft || submitting}
        >
          {savingDraft ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : null}
          Save draft
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={submitting || savingDraft}
          className={cn(
            "group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all min-w-40",
            submitting && "opacity-80",
          )}
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {isEditing && timing === "later" ? "Update schedule" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
