import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SendTiming } from "./schedule-card";

export function ComposeActionsBar({
    onCancel,
    onSaveDraft,
    savingDraft,
    onSendTest,
    sendingTest,
    testSent,
    onSubmit,
    submitting,
    timing,
    isEditing,
}: {
    onCancel: () => void;
    onSaveDraft: () => void;
    savingDraft: boolean;
    onSendTest: () => void;
    sendingTest: boolean;
    testSent: boolean;
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
            <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                {testSent && (
                    <span className="text-xs font-medium text-signal animate-fade-up">
                        Test email sent
                    </span>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onSendTest}
                    disabled={sendingTest}
                >
                    {sendingTest ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : null}
                    Send test
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onSaveDraft}
                    disabled={savingDraft}
                >
                    {savingDraft ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : null}
                    Save draft
                </Button>
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className={cn(
                        "group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 min-w-40",
                        submitting && "opacity-80",
                    )}
                >
                    {submitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}

                    {isEditing && timing === "later"
                        ? "Update schedule"
                        : submitLabel}

                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Button>
            </div>
        </div>
    );
}
